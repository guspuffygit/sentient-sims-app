import log from 'electron-log';
import { MemoryEntity } from '../db/entities/MemoryEntity';
import { ApiContext } from './ApiContext';
import { embeddingToBuffer } from './EmbeddingService';

// When the rating generation fails (no provider configured, malformed reply), fall back
// to a prior by memory kind: reflections are distilled and durable, outcomes are notable,
// stray thoughts are noise.
const IMPORTANCE_BY_EVENT_TYPE: Record<string, number> = {
  reflection: 8,
  outcome: 5,
  thought: 2,
};
const DEFAULT_IMPORTANCE = 3;

const IMPORTANCE_SYSTEM_PROMPT = `You rate how memorable a life event is for the character who experienced it.
1 means mundane and forgettable (routine chores, small talk), 10 means life-changing (a breakup, a birth, a betrayal).
Respond with only a single integer from 1 to 10, nothing else.`;

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
// memory_index sidecar table. Fire-and-forget: gameplay never waits on it.
export class MemoryAnnotationService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  annotateInBackground(memory: MemoryEntity): void {
    this.annotate(memory).catch((error: unknown) => {
      log.error(`[Annotation] Failed to annotate memory ${memory.id}`, error);
    });
  }

  async annotate(memory: MemoryEntity): Promise<void> {
    if (memory.id === undefined) {
      return;
    }

    const text = memory.observation || memory.content || '';
    const importance = text
      ? await this.rateImportance(text, memory.event_type)
      : heuristicImportance(memory.event_type);

    let embedding: Buffer | undefined;
    let embeddingModel: string | undefined;
    if (text) {
      const [vector] = await this.ctx.embedding.embed([text]);
      if (vector) {
        embedding = embeddingToBuffer(vector);
        embeddingModel = this.ctx.embedding.model;
      }
    }

    this.ctx.memoryIndexRepository.upsertIndex({
      memory_id: memory.id,
      importance,
      embedding,
      embedding_model: embeddingModel,
    });
    log.debug(`[Annotation] memory ${memory.id} importance=${importance} embedded=${Boolean(embedding)}`);
  }

  backfillInBackground(): void {
    this.backfill().catch((error: unknown) => {
      log.error('[Annotation] Backfill failed', error);
    });
  }

  // Fills in embeddings for memories from before the index existed, or written while no
  // embedder was configured. Batched so a large backlog costs few API calls. Importance on
  // never-indexed rows uses the cheap event-type heuristic — no LLM call per historical
  // memory — while rows the live path already rated keep their rating.
  async backfill(batchSize = 50): Promise<number> {
    if (!this.ctx.embedding.isAvailable()) {
      return 0;
    }

    let total = 0;
    for (;;) {
      const batch = this.ctx.memoryIndexRepository.getUnindexedMemories(batchSize);
      if (batch.length === 0) {
        break;
      }
      const embedded = await this.backfillBatch(batch);
      total += embedded;
      // Rows that can't make progress (no text, failing embedder) must not spin forever
      if (embedded === 0) {
        break;
      }
    }

    if (total > 0) {
      log.info(`[Annotation] Backfilled embeddings for ${total} memories`);
    }
    return total;
  }

  private async backfillBatch(batch: MemoryEntity[]): Promise<number> {
    const textable = batch.filter((memory) => memory.observation || memory.content);
    if (textable.length === 0) {
      return 0;
    }

    const vectors = await this.ctx.embedding.embed(
      textable.map((memory) => memory.observation || memory.content || ''),
    );
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
        embedding: embeddingToBuffer(vector),
        embedding_model: model,
      });
      embedded += 1;
    });
    return embedded;
  }

  private async rateImportance(text: string, eventType?: string): Promise<number> {
    try {
      const result = await this.ctx.ai.runOneShot('Memory Importance', IMPORTANCE_SYSTEM_PROMPT, text, 5);
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
