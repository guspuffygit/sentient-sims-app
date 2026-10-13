import * as fs from 'fs';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import { migrate } from 'main/sentient-sims/db/migrations';
import {
  EmbeddingService,
  NoopEmbeddingService,
  bufferToEmbedding,
  cosineSimilarity,
  embeddingToBuffer,
} from 'main/sentient-sims/services/EmbeddingService';
import { heuristicImportance, parseImportance } from 'main/sentient-sims/services/MemoryAnnotationService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { mockApiContext } from './util';

function loadedContext(sessionId: string): ApiContext {
  const ctx = mockApiContext();
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
  ctx.db.loadDatabase({ sessionId, saveId: '1' });
  return ctx;
}

// Loading a save starts a backfill; let it settle so a test's own call isn't folded into it
function settleLoadBackfill(): Promise<void> {
  return new Promise<void>((resolve) => {
    setImmediate(resolve);
  });
}

function createMemory(ctx: ApiContext, memory: Partial<MemoryEntity>): MemoryEntity {
  const created = ctx.memoryRepository.createMemory({
    memory: { location_id: 1, content: 'a memory', ...memory },
    participants: [{ id: '100' }],
  });
  if (!created) {
    throw new Error('test memory rejected by hygiene gate');
  }
  return created;
}

function fakeEmbedder(vector: number[]): EmbeddingService {
  return {
    model: 'fake-model',
    isAvailable: () => true,
    embed: (texts: string[]) => Promise.resolve(texts.map(() => Float32Array.from(vector))),
  };
}

describe('MemoryIndexRepository', () => {
  it('ignores index upserts for memories that no longer exist', () => {
    const ctx = loadedContext('memory-index-stale');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});

    // Annotation is fire-and-forget: by the time it lands the memory can be gone
    // (deleted, or the db swapped). It must no-op, not throw a FOREIGN KEY error.
    const result = ctx.memoryIndexRepository.upsertIndex({ memory_id: '9999', importance: 5 });
    expect(result.changes).toEqual(0);
    expect(ctx.memoryIndexRepository.getIndex('9999')).toBeUndefined();

    const embeddingResult = ctx.memoryIndexRepository.upsertEmbedding({
      memory_id: '9999',
      embedding_model: 'fake-model',
      embedding: embeddingToBuffer(Float32Array.from([1])),
    });
    expect(embeddingResult.changes).toEqual(0);
    expect(ctx.memoryIndexRepository.getEmbedding('9999', 'fake-model')).toBeUndefined();
  });

  // Found live 2026-09-05: INSERT OR REPLACE rewrites the whole row, so annotating a memory
  // dropped the game day it was stamped with at creation. 11,474 of 11,499 rows on the live
  // save had lost theirs; the 25 that kept one were outcome rows, which carry no text to
  // annotate. The memory-recall battery grades against that day, so it graded nothing.
  it('keeps the game day a memory was stamped with when the annotator rates it', () => {
    const ctx = loadedContext(`memory-index-game-day-${Math.random().toString(36).slice(2)}`);
    ctx.memoryRepository.setOnMemoryUpserted(() => {});
    ctx.memoryRepository.setGameDayProvider(() => 42);

    const memory = createMemory(ctx, { content: 'walked to the gym before work' });
    const memoryId = String(memory.id);
    expect(ctx.memoryIndexRepository.getIndex(memoryId)?.game_day).toEqual(42);

    ctx.memoryIndexRepository.upsertIndex({ memory_id: memoryId, importance: 8 });

    expect(ctx.memoryIndexRepository.getIndex(memoryId)?.importance).toEqual(8);
    expect(ctx.memoryIndexRepository.getIndex(memoryId)?.game_day).toEqual(42);

    // And the owner still survives the same write, as it always has
    ctx.memoryIndexRepository.upsertIndex({ memory_id: memoryId, owner_participant_id: 100 });
    ctx.memoryIndexRepository.upsertIndex({ memory_id: memoryId, importance: 3 });
    expect(String(ctx.memoryIndexRepository.getIndex(memoryId)?.owner_participant_id)).toEqual('100');
    expect(ctx.memoryIndexRepository.getIndex(memoryId)?.game_day).toEqual(42);
  });

  it('roundtrips index rows and per-model embeddings, cascading deletes with the memory', () => {
    const ctx = loadedContext('memory-index-crud');
    // Manual index management below must not race the automatic background annotation
    ctx.memoryRepository.setOnMemoryUpserted(() => {});

    const memory = createMemory(ctx, { content: 'saw a ghost in the kitchen' });
    const memoryId = String(memory.id);
    ctx.memoryIndexRepository.upsertIndex({ memory_id: memoryId, importance: 7 });
    // One embedding per model: both live side by side under the same memory
    ctx.memoryIndexRepository.upsertEmbedding({
      memory_id: memoryId,
      embedding_model: 'fake-model',
      embedding: embeddingToBuffer(Float32Array.from([0.25, -1.5, 3])),
    });
    ctx.memoryIndexRepository.upsertEmbedding({
      memory_id: memoryId,
      embedding_model: 'other-model',
      embedding: embeddingToBuffer(Float32Array.from([7])),
    });

    expect(ctx.memoryIndexRepository.getIndex(memoryId)?.importance).toEqual(7);
    expect(
      Array.from(bufferToEmbedding(ctx.memoryIndexRepository.getEmbedding(memoryId, 'fake-model') as Buffer)),
    ).toEqual([0.25, -1.5, 3]);
    expect(
      Array.from(bufferToEmbedding(ctx.memoryIndexRepository.getEmbedding(memoryId, 'other-model') as Buffer)),
    ).toEqual([7]);

    // Importance upserts replace in place without touching stored embeddings
    ctx.memoryIndexRepository.upsertIndex({ memory_id: memoryId, importance: 9 });
    expect(ctx.memoryIndexRepository.getIndex(memoryId)?.importance).toEqual(9);
    expect(ctx.memoryIndexRepository.getEmbedding(memoryId, 'fake-model')).toBeDefined();

    // Re-embedding under one model replaces only that model's row
    ctx.memoryIndexRepository.upsertEmbedding({
      memory_id: memoryId,
      embedding_model: 'fake-model',
      embedding: embeddingToBuffer(Float32Array.from([1, 2])),
    });
    expect(
      Array.from(bufferToEmbedding(ctx.memoryIndexRepository.getEmbedding(memoryId, 'fake-model') as Buffer)),
    ).toEqual([1, 2]);
    expect(
      Array.from(bufferToEmbedding(ctx.memoryIndexRepository.getEmbedding(memoryId, 'other-model') as Buffer)),
    ).toEqual([7]);

    ctx.memoryRepository.deleteMemory({ id: memoryId });
    expect(ctx.memoryIndexRepository.getIndex(memoryId)).toBeUndefined();
    expect(ctx.memoryIndexRepository.getEmbedding(memoryId, 'fake-model')).toBeUndefined();
    expect(ctx.memoryIndexRepository.getEmbedding(memoryId, 'other-model')).toBeUndefined();
  });

  it('lists memories that still need an embedding for the given model, oldest first', () => {
    const ctx = loadedContext('memory-index-unindexed');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});

    const first = createMemory(ctx, { content: 'first' });
    const second = createMemory(ctx, { content: 'second' });
    const third = createMemory(ctx, { content: 'third' });

    // second is fully indexed under fake-model, third has importance but no embedding yet
    ctx.memoryIndexRepository.upsertIndex({ memory_id: String(second.id), importance: 5 });
    ctx.memoryIndexRepository.upsertEmbedding({
      memory_id: String(second.id),
      embedding_model: 'fake-model',
      embedding: embeddingToBuffer(Float32Array.from([1])),
    });
    ctx.memoryIndexRepository.upsertIndex({ memory_id: String(third.id), importance: 5 });

    // Embeddings only match the model that produced them: a covered model skips its rows,
    // a model never used before queues everything
    const sameModel = ctx.memoryIndexRepository.getUnindexedMemories(10, 'fake-model');
    expect(sameModel.map((memory) => memory.id)).toEqual([first.id, third.id]);
    const otherModel = ctx.memoryIndexRepository.getUnindexedMemories(10, 'other-model');
    expect(otherModel.map((memory) => memory.id)).toEqual([first.id, second.id, third.id]);

    // Embedding under the second model doesn't disturb the first model's coverage:
    // switching back finds its earlier work still done
    ctx.memoryIndexRepository.upsertEmbedding({
      memory_id: String(second.id),
      embedding_model: 'other-model',
      embedding: embeddingToBuffer(Float32Array.from([2])),
    });
    expect(ctx.memoryIndexRepository.getUnindexedMemories(10, 'other-model').map((memory) => memory.id)).toEqual([
      first.id,
      third.id,
    ]);
    expect(ctx.memoryIndexRepository.getUnindexedMemories(10, 'fake-model').map((memory) => memory.id)).toEqual([
      first.id,
      third.id,
    ]);
  });

  it('counts and drops stored embeddings per model', () => {
    const ctx = loadedContext('memory-index-per-model');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});

    const first = createMemory(ctx, { content: 'first' });
    const second = createMemory(ctx, { content: 'second' });
    createMemory(ctx, { content: 'tried tell_joke', event_type: 'outcome' });
    for (const memory of [first, second]) {
      for (const model of ['retired-model', 'fake-model']) {
        ctx.memoryIndexRepository.upsertEmbedding({
          memory_id: String(memory.id),
          embedding_model: model,
          embedding: embeddingToBuffer(Float32Array.from([1])),
        });
      }
    }
    // No index row yet, so both are still "unindexed" for every model; the outcome row never counts
    expect(ctx.memoryIndexRepository.countUnindexedMemories('fake-model')).toEqual(2);
    ctx.memoryIndexRepository.upsertIndex({ memory_id: String(first.id), importance: 5 });
    ctx.memoryIndexRepository.upsertIndex({ memory_id: String(second.id), importance: 5 });
    expect(ctx.memoryIndexRepository.countUnindexedMemories('fake-model')).toEqual(0);
    expect(ctx.memoryIndexRepository.countUnindexedMemories('other-model')).toEqual(2);

    expect(ctx.memoryIndexRepository.deleteEmbeddingsForModel('retired-model')).toEqual(2);
    expect(ctx.memoryIndexRepository.deleteEmbeddingsForModel('retired-model')).toEqual(0);
    expect(ctx.memoryIndexRepository.getEmbedding(String(first.id), 'retired-model')).toBeUndefined();
    expect(ctx.memoryIndexRepository.getEmbedding(String(first.id), 'fake-model')).toBeDefined();
    expect(ctx.memoryIndexRepository.countUnindexedMemories('retired-model')).toEqual(2);
  });

  it('migrates legacy inline memory_index embeddings into memory_embedding', () => {
    const ctx = loadedContext('memory-index-migration');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});
    const memory = createMemory(ctx, { content: 'embedded before the split' });

    // Recreate the pre-014 schema: embeddings stored inline on memory_index
    const db = ctx.db.getDb();
    db.prepare('DROP TABLE memory_embedding').run();
    db.prepare('ALTER TABLE memory_index ADD COLUMN embedding BLOB').run();
    db.prepare('ALTER TABLE memory_index ADD COLUMN embedding_model TEXT').run();
    db.prepare("DELETE FROM migrations WHERE name = '014-move-embeddings-to-memory-embedding'").run();
    db.prepare(
      'INSERT OR REPLACE INTO memory_index (memory_id, importance, embedding, embedding_model) VALUES (?, ?, ?, ?)',
    ).run([BigInt(String(memory.id)), 7, embeddingToBuffer(Float32Array.from([1, 2])), 'legacy-model']);

    migrate(db);

    // The stored embedding survives the move, keyed by the model that produced it
    const moved = ctx.memoryIndexRepository.getEmbedding(String(memory.id), 'legacy-model');
    expect(Array.from(bufferToEmbedding(moved as Buffer))).toEqual([1, 2]);
    expect(ctx.memoryIndexRepository.getIndex(String(memory.id))?.importance).toEqual(7);

    // The inline columns are gone from memory_index (owner_participant_id is ours, from
    // 021-add-memory-index-owner, once 014, and stays)
    const columns = (db.prepare('PRAGMA table_info(memory_index)').all() as { name: string }[]).map(
      (column) => column.name,
    );
    // game_day joined the index in 019 so retrieval can decay on the sim's own clock;
    // owner_participant_id follows it on a fresh database now that its migration is 021
    expect(columns).toEqual(['memory_id', 'importance', 'game_day', 'owner_participant_id']);
  });
});

describe('EmbeddingService', () => {
  it('computes cosine similarity', () => {
    const a = Float32Array.from([1, 0, 0]);
    expect(cosineSimilarity(a, Float32Array.from([2, 0, 0]))).toBeCloseTo(1);
    expect(cosineSimilarity(a, Float32Array.from([0, 3, 0]))).toBeCloseTo(0);
    expect(cosineSimilarity(a, Float32Array.from([-1, 0, 0]))).toBeCloseTo(-1);
    // Degenerate inputs never NaN
    expect(cosineSimilarity(a, Float32Array.from([1, 2]))).toEqual(0);
    expect(cosineSimilarity(a, Float32Array.from([0, 0, 0]))).toEqual(0);
  });

  it('noop embedder returns undefined per text', async () => {
    const noop = new NoopEmbeddingService();
    expect(noop.isAvailable()).toBe(false);
    expect(await noop.embed(['one', 'two'])).toEqual([undefined, undefined]);
  });
});

describe('MemoryAnnotationService', () => {
  it('parses importance replies and falls back by event type', () => {
    expect(parseImportance('7')).toEqual(7);
    expect(parseImportance('10')).toEqual(10);
    expect(parseImportance('Importance: 8.')).toEqual(8);
    expect(parseImportance('quite memorable')).toBeUndefined();

    expect(heuristicImportance('reflection')).toEqual(8);
    expect(heuristicImportance('outcome')).toEqual(5);
    expect(heuristicImportance('thought')).toEqual(2);
    expect(heuristicImportance(undefined)).toEqual(3);
    expect(heuristicImportance('interaction')).toEqual(3);
  });

  it('stores the rated importance and embedding', async () => {
    const ctx = loadedContext('annotation-full');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});
    vi.spyOn(ctx.ai, 'runOneShot').mockResolvedValue({ text: '9' } as never);
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(fakeEmbedder([1, 2, 3]));

    const memory = createMemory(ctx, { observation: 'proposed marriage at the bluffs' });
    await ctx.memoryAnnotation.annotate(memory);

    expect(ctx.memoryIndexRepository.getIndex(String(memory.id))?.importance).toEqual(9);
    const embedding = ctx.memoryIndexRepository.getEmbedding(String(memory.id), 'fake-model');
    expect(Array.from(bufferToEmbedding(embedding as Buffer))).toEqual([1, 2, 3]);
  });

  it('degrades to heuristic importance and no embedding when nothing is configured', async () => {
    const ctx = loadedContext('annotation-degraded');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});
    vi.spyOn(ctx.ai, 'runOneShot').mockRejectedValue(new Error('no provider'));
    // An ambient OPENAI_KEY env var would make the real embedder available; the premise here is "nothing configured"
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());

    const memory = createMemory(ctx, { content: 'tried tell_joke and it succeeded', event_type: 'outcome' });
    await ctx.memoryAnnotation.annotate(memory);

    expect(ctx.memoryIndexRepository.getIndex(String(memory.id))?.importance).toEqual(5);
    expect(ctx.memoryIndexRepository.getEmbedding(String(memory.id), 'fake-model')).toBeUndefined();
  });

  it('drops stale embeddings when a memory is re-annotated with its text changed', async () => {
    const ctx = loadedContext('annotation-stale-embeddings');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});
    vi.spyOn(ctx.ai, 'runOneShot').mockResolvedValue({ text: '6' } as never);
    const embedderSpy = vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(fakeEmbedder([1, 2]));

    const memory = createMemory(ctx, { content: 'original text' });
    await ctx.memoryAnnotation.annotate(memory);
    expect(ctx.memoryIndexRepository.getEmbedding(String(memory.id), 'fake-model')).toBeDefined();

    // The text changes while no embedder is available: the old vector describes text that
    // no longer exists, so it must not linger and score against future queries
    embedderSpy.mockReturnValue(new NoopEmbeddingService());
    await ctx.memoryAnnotation.annotate({ ...memory, content: 'rewritten text' });
    expect(ctx.memoryIndexRepository.getEmbedding(String(memory.id), 'fake-model')).toBeUndefined();
  });

  it('backfills every memory that lacks a vector from the active model', async () => {
    const ctx = loadedContext('annotation-backfill');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(fakeEmbedder([4, 5]));

    const first = createMemory(ctx, { content: 'first' });
    const second = createMemory(ctx, { content: 'second' });
    createMemory(ctx, { content: 'tried tell_joke', event_type: 'outcome' });
    ctx.memoryIndexRepository.upsertEmbedding({
      memory_id: String(second.id),
      embedding_model: 'old-model',
      embedding: embeddingToBuffer(Float32Array.from([1])),
    });

    expect(await ctx.memoryAnnotation.backfill(1)).toEqual(2);

    for (const memory of [first, second]) {
      const embedding = ctx.memoryIndexRepository.getEmbedding(String(memory.id), 'fake-model');
      expect(Array.from(bufferToEmbedding(embedding as Buffer))).toEqual([4, 5]);
    }
    expect(ctx.memoryIndexRepository.countUnindexedMemories('fake-model')).toEqual(0);
    expect(await ctx.memoryAnnotation.backfill()).toEqual(0);
  });

  it('stops the backfill when the embedder returns nothing instead of spinning', async () => {
    const ctx = loadedContext('annotation-backfill-failing');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});
    const embed = vi.fn(() => Promise.resolve([undefined, undefined]));
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue({ model: 'fake-model', isAvailable: () => true, embed });

    createMemory(ctx, { content: 'first' });
    createMemory(ctx, { content: 'second' });

    expect(await ctx.memoryAnnotation.backfill()).toEqual(0);
    expect(embed).toHaveBeenCalledTimes(1);
    expect(ctx.memoryIndexRepository.countUnindexedMemories('fake-model')).toEqual(2);
  });

  it('runs one backfill at a time and once more when asked mid-run', async () => {
    const ctx = loadedContext('annotation-backfill-serial');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});
    await settleLoadBackfill();
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const backfill = vi.spyOn(ctx.memoryAnnotation, 'backfill').mockImplementation(() => gate.then(() => 0));

    ctx.memoryAnnotation.backfillInBackground();
    ctx.memoryAnnotation.backfillInBackground();
    ctx.memoryAnnotation.backfillInBackground();
    expect(backfill).toHaveBeenCalledTimes(1);

    release();
    await gate;
    await settleLoadBackfill();
    expect(backfill).toHaveBeenCalledTimes(2);
  });

  it('re-runs the backfill when a setting write changes the active embedding model', async () => {
    const ctx = loadedContext('annotation-setting-change');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});
    await settleLoadBackfill();
    const embedderSpy = vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(fakeEmbedder([1]));
    const backfill = vi.spyOn(ctx.memoryAnnotation, 'backfill').mockResolvedValue(0);

    // The save load ran the backfill for fake-model; writes that keep the model are noise
    ctx.memoryAnnotation.backfillInBackground();
    await settleLoadBackfill();
    expect(backfill).toHaveBeenCalledTimes(1);
    ctx.memoryAnnotation.onSettingChanged();
    await settleLoadBackfill();
    expect(backfill).toHaveBeenCalledTimes(1);

    embedderSpy.mockReturnValue({ ...fakeEmbedder([1]), model: 'other-model' });
    ctx.memoryAnnotation.onSettingChanged();
    await settleLoadBackfill();
    expect(backfill).toHaveBeenCalledTimes(2);

    // Losing the embedder is not a switch to backfill for
    embedderSpy.mockReturnValue(new NoopEmbeddingService());
    ctx.memoryAnnotation.onSettingChanged();
    await settleLoadBackfill();
    expect(backfill).toHaveBeenCalledTimes(2);
  });

  it('ignores setting writes while no database is loaded', () => {
    const ctx = mockApiContext();
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(fakeEmbedder([1]));
    const backfill = vi.spyOn(ctx.memoryAnnotation, 'backfill').mockResolvedValue(0);

    ctx.memoryAnnotation.onSettingChanged();
    expect(backfill).not.toHaveBeenCalled();
  });

  it('drops retired hosted-service vectors on load only when the hosted service embeds', () => {
    const ctx = loadedContext('annotation-retired-vectors');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});
    const memory = createMemory(ctx, { content: 'remembered under qwen' });
    const storeRetired = () =>
      ctx.memoryIndexRepository.upsertEmbedding({
        memory_id: String(memory.id),
        embedding_model: 'Qwen/Qwen3-Embedding-8B',
        embedding: embeddingToBuffer(Float32Array.from([1])),
      });

    // OpenAI is the resolved embedder: nothing of the hosted service's is touched
    storeRetired();
    ctx.memoryAnnotation.dropRetiredEmbeddings();
    expect(ctx.memoryIndexRepository.getEmbedding(String(memory.id), 'Qwen/Qwen3-Embedding-8B')).toBeDefined();

    // A self-hosted server may still serve the model
    ctx.settings.embeddingProviderConfigs = [{ id: 'custom', name: 'Custom', apiType: ApiType.CustomAI }];
    ctx.settings.defaultEmbeddingProviderConfigId = 'custom';
    ctx.memoryAnnotation.dropRetiredEmbeddings();
    expect(ctx.memoryIndexRepository.getEmbedding(String(memory.id), 'Qwen/Qwen3-Embedding-8B')).toBeDefined();

    ctx.settings.embeddingProviderConfigs = [{ id: 'ss', name: 'Sentient Sims AI', apiType: ApiType.SentientSimsAI }];
    ctx.settings.defaultEmbeddingProviderConfigId = 'ss';
    ctx.memoryAnnotation.dropRetiredEmbeddings();
    expect(ctx.memoryIndexRepository.getEmbedding(String(memory.id), 'Qwen/Qwen3-Embedding-8B')).toBeUndefined();
  });

  it('is triggered automatically when memories are created or updated', () => {
    const ctx = loadedContext('annotation-wiring');
    const annotated = vi.spyOn(ctx.memoryAnnotation, 'annotateInBackground').mockImplementation(() => {});

    const memory = createMemory(ctx, { content: 'wired up' });
    expect(annotated).toHaveBeenCalledTimes(1);
    expect(annotated.mock.calls[0][0].id).toEqual(memory.id);

    ctx.memoryRepository.updateMemory({ ...memory, content: 'edited' });
    expect(annotated).toHaveBeenCalledTimes(2);
  });
});
