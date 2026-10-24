import log from 'electron-log';
import { retiredSentientSimsAIEmbeddingModels } from '../constants';
import { MemoryEntity } from '../db/entities/MemoryEntity';
import { ApiType } from '../models/ApiType';
import { StageId } from '../pipeline/stages';
import { IMPORTANCE_SYSTEM_PROMPT } from '../pipeline/prompts/utility';
import { AIActionType } from '../models/AIActionType';
import { memoryRecallText } from '../util/memoryRecallText';
import { ApiContext } from './ApiContext';
import { embeddingToBuffer } from './EmbeddingService';

// When the rating generation fails (no provider configured, malformed reply), fall back
// to a prior by memory kind: reflections are distilled and durable, outcomes are notable,
// stray thoughts are noise.
const IMPORTANCE_BY_EVENT_TYPE: Record<string, number> = {
  reflection: 8,
  outcome: 5,
  thought: 2,
  // A scene-attached inner monologue normally arrives pre-scored by the scene's
  // reflection stage; this prior only catches rows whose scoring call failed
  monologue: 3,
};
const DEFAULT_IMPORTANCE = 3;

export function heuristicImportance(eventType?: string): number {
  if (eventType && eventType in IMPORTANCE_BY_EVENT_TYPE) {
    return IMPORTANCE_BY_EVENT_TYPE[eventType];
  }
  return DEFAULT_IMPORTANCE;
}

export function parseImportance(text: string): number | undefined {
  const match = /\b(10|[1-9])\b/.exec(text);
  if (!match) {
    return undefined;
  }
  return Number(match[1]);
}

// Annotates memories with retrieval metadata (importance + embedding) into the
// memory_index sidecar table. Fire-and-forget AND deferred: the work rides the generation
// queue's idle lane, so it never competes with live scene generation — a rating only needs
// to be ready by the next scene, not during this one.
export class MemoryAnnotationService {
  private readonly ctx: ApiContext;

  // One backfill at a time: two loops would each claim the same oldest batch and embed it
  // twice. A request arriving mid-run is remembered and the loop runs once more at the end,
  // which costs a single query when the running loop already caught up.
  private backfillInFlight?: Promise<void>;

  private backfillRequested = false;

  // The model the last backfill ran for; a setting write that leaves it unchanged is noise
  private backfillModel?: string;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  annotateInBackground(memory: MemoryEntity): void {
    this.ctx.generationQueue
      .runWhenIdle(() => this.annotate(memory))
      .catch((error: unknown) => {
        log.error(`[Annotation] Failed to annotate memory ${memory.id}`, error);
      });
  }

  async annotate(memory: MemoryEntity): Promise<void> {
    if (memory.id === undefined) {
      return;
    }

    const session = this.ctx.db.sessionKey;
    // Rated and embedded as it is recalled: a reply to the player carries the question it
    // answered, so a later question about the same thing can find it
    const text = memory.observation || memory.content ? memoryRecallText(memory) : '';
    // A rating the pipeline already computed (scene reflection scores, stamped at
    // creation) wins over a fresh rating call — one score per memory, no double-spend
    const existing = this.ctx.memoryIndexRepository.getIndex(memory.id);
    let importance: number;
    if (typeof existing?.importance === 'number') {
      importance = existing.importance;
    } else if (text) {
      importance = await this.rateImportance(text, memory.event_type, memory.id);
    } else {
      importance = heuristicImportance(memory.event_type);
    }

    let embedding: Buffer | undefined;
    let embeddingModel: string | undefined;
    // Outcome rows are structured bookkeeping, not narrative — embedding them polluted the
    // vector index with 111 near-identical "X tried Y" rows. They keep an importance rating
    // (recency+importance retrieval still sees them) but never enter similarity search.
    if (text && memory.event_type !== 'outcome') {
      const [vector] = await this.ctx.embedding.embed([text], 'embedding_memory');
      if (vector) {
        embedding = embeddingToBuffer(vector);
        embeddingModel = this.ctx.embedding.model;
      }
    }

    // A different database may have been loaded while we awaited the AI calls —
    // this memory id would then point at another save's memory, so drop the result.
    if (this.ctx.db.sessionKey !== session) {
      log.debug(`[Annotation] database changed while annotating memory ${memory.id}, dropping result`);
      return;
    }

    this.ctx.memoryIndexRepository.upsertIndex({ memory_id: memory.id, importance });
    // The memory's text may have just changed, so stored vectors of the old text — under
    // any model — no longer describe it. Dropped rows re-embed via backfill when their
    // model becomes active again.
    this.ctx.memoryIndexRepository.deleteEmbeddings(memory.id);
    if (embedding && embeddingModel) {
      this.ctx.memoryIndexRepository.upsertEmbedding({
        memory_id: memory.id,
        embedding_model: embeddingModel,
        embedding,
      });
    }
    log.debug(`[Annotation] memory ${memory.id} importance=${importance} embedded=${Boolean(embedding)}`);
  }

  backfillInBackground(): void {
    if (this.backfillInFlight) {
      this.backfillRequested = true;
      return;
    }
    this.backfillModel = this.ctx.embedding.model;
    this.backfillInFlight = this.backfill()
      .then(() => undefined)
      .catch((error: unknown) => {
        log.error('[Annotation] Backfill failed', error);
      })
      .finally(() => {
        this.backfillInFlight = undefined;
        if (this.backfillRequested) {
          this.backfillRequested = false;
          this.backfillInBackground();
        }
      });
  }

  // Any setting write may change which embedder is active (the embedding configs, the main
  // provider Auto follows, a key or token arriving). Compare the resolved model instead of
  // enumerating keys, and re-run the backfill when it moved so the switch takes effect
  // without reloading the save.
  onSettingChanged(): void {
    if (!this.ctx.db.isLoaded()) {
      return;
    }
    const { model } = this.ctx.embedding;
    if (model === this.backfillModel || !this.ctx.embedding.isAvailable()) {
      return;
    }
    log.info(`[Annotation] Embedding model changed from ${this.backfillModel ?? 'none'} to ${model}, backfilling`);
    this.backfillInBackground();
  }

  // Vectors from a model the hosted service retired can never match a query again: the
  // replacement model's vectors have a different length, so similarity would score 0 and
  // at 16 KB a row they outweigh the memories themselves. Only when the hosted service is
  // the active embedder — a CustomAI server may still run the retired model.
  dropRetiredEmbeddings(): void {
    if (this.ctx.embeddingProviderConfigs.getResolvedConfig().apiType !== ApiType.SentientSimsAI) {
      return;
    }
    for (const model of Object.keys(retiredSentientSimsAIEmbeddingModels)) {
      try {
        const dropped = this.ctx.memoryIndexRepository.deleteEmbeddingsForModel(model);
        if (dropped > 0) {
          log.info(`[Annotation] Dropped ${dropped} stored embeddings from retired model ${model}`);
        }
      } catch (error) {
        log.error(`[Annotation] Failed to drop stored embeddings from retired model ${model}`, error);
      }
    }
  }

  // Fills in embeddings for memories from before the index existed, written while no
  // embedder was configured, or never embedded by the current model (each model keeps its
  // own rows in memory_embedding, so a switch to a new model embeds everything once and a
  // switch back finds its old rows intact). Batched so a large backlog costs few API
  // calls. Importance on
  // never-indexed rows uses the cheap event-type heuristic — no LLM call per historical
  // memory — while rows the live path already rated keep their rating.
  async backfill(batchSize = 50): Promise<number> {
    if (!this.ctx.embedding.isAvailable()) {
      log.debug('[Annotation] No embedder available, skipping backfill');
      return 0;
    }

    const session = this.ctx.db.sessionKey;
    const startModel = this.ctx.embedding.model;
    const pending = this.ctx.memoryIndexRepository.countUnindexedMemories(startModel);
    if (pending === 0) {
      log.debug(`[Annotation] Every memory already has an embedding from ${startModel}`);
      return 0;
    }
    log.info(`[Annotation] ${pending} memories need embeddings from ${startModel}, backfilling ${batchSize} at a time`);

    let total = 0;
    for (;;) {
      if (this.ctx.db.sessionKey !== session) {
        log.info(`[Annotation] Database changed during backfill, stopping after ${total} memories`);
        break;
      }
      const { model } = this.ctx.embedding;
      const batch = this.ctx.memoryIndexRepository.getUnindexedMemories(batchSize, model);
      if (batch.length === 0) {
        break;
      }
      // Each batch claims its own idle slot, so a live interaction arriving mid-backfill
      // only ever waits out one batch, not the whole backlog
      const embedded = await this.ctx.generationQueue.runWhenIdle(() => this.backfillBatch(batch, session));
      total += embedded;
      // Rows that can't make progress (no text, failing embedder) must not spin forever
      if (embedded === 0) {
        const remaining = this.ctx.memoryIndexRepository.countUnindexedMemories(model);
        if (remaining > 0 && this.ctx.db.sessionKey === session) {
          log.warn(
            `[Annotation] Backfill stopped: ${model} returned no embeddings for a batch of ${batch.length}, ` +
              `${remaining} memories still unembedded. It retries on the next save load or embedding setting change.`,
          );
        }
        break;
      }
    }

    if (total > 0) {
      log.info(`[Annotation] Backfilled embeddings from ${this.ctx.embedding.model} for ${total} memories`);
    }
    return total;
  }

  private async backfillBatch(batch: MemoryEntity[], session: string | undefined): Promise<number> {
    const textable = batch.filter(
      (memory) => (memory.observation || memory.content) && memory.event_type !== 'outcome',
    );
    if (textable.length === 0) {
      return 0;
    }

    const vectors = await this.ctx.embedding.embed(
      textable.map((memory) => memoryRecallText(memory)),
      'embedding_memory_backfill',
    );
    if (this.ctx.db.sessionKey !== session) {
      log.debug('[Annotation] database changed during backfill batch, dropping results');
      return 0;
    }
    const { model } = this.ctx.embedding;

    let embedded = 0;
    textable.forEach((memory, index) => {
      const vector = vectors[index];
      if (memory.id === undefined || !vector) {
        return;
      }
      const existing = this.ctx.memoryIndexRepository.getIndex(memory.id);
      this.ctx.memoryIndexRepository.upsertIndex({
        memory_id: memory.id,
        importance: existing?.importance ?? heuristicImportance(memory.event_type),
      });
      this.ctx.memoryIndexRepository.upsertEmbedding({
        memory_id: memory.id,
        embedding_model: model,
        embedding: embeddingToBuffer(vector),
      });
      embedded += 1;
    });
    return embedded;
  }

  private async rateImportance(text: string, eventType?: string, memoryId?: string): Promise<number> {
    try {
      const result = await this.ctx.ai.runOneShot(
        'Memory Importance',
        IMPORTANCE_SYSTEM_PROMPT,
        text,
        5,
        undefined,
        AIActionType.MEMORY_IMPORTANCE,
        undefined,
        { stageId: StageId.HIPPOCAMPUS_IMPORTANCE },
      );
      // The row already exists by the time this runs, so the stage attaches by id. Kept in
      // its own try/catch: debug bookkeeping must not send a real rating to the heuristic.
      if (memoryId !== undefined) {
        try {
          this.ctx.ext.trace?.appendExchange(memoryId, result.exchange);
        } catch (error) {
          log.debug(`[Annotation] could not attach importance trace to memory ${memoryId}: ${String(error)}`);
        }
      }
      const rating = parseImportance(result.text);
      if (rating !== undefined) {
        return rating;
      }
      log.debug(`[Annotation] Unparseable importance reply: ${result.text}`);
    } catch (error) {
      log.debug(`[Annotation] Importance rating failed, using heuristic: ${String(error)}`);
    }
    return heuristicImportance(eventType);
  }
}
