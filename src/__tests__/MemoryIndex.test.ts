import * as fs from 'fs';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import {
  EmbeddingService,
  NoopEmbeddingService,
  bufferToEmbedding,
  cosineSimilarity,
  embeddingToBuffer,
} from 'main/sentient-sims/services/EmbeddingService';
import { heuristicImportance, parseImportance } from 'main/sentient-sims/services/MemoryAnnotationService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { mockApiContext } from './util';

function loadedContext(sessionId: string): ApiContext {
  const ctx = mockApiContext();
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
  ctx.db.loadDatabase({ sessionId, saveId: '1' });
  return ctx;
}

function createMemory(ctx: ApiContext, memory: Partial<MemoryEntity>): MemoryEntity {
  return ctx.memoryRepository.createMemory({
    memory: { location_id: 1, content: 'a memory', ...memory },
    participants: [{ id: '100' }],
  });
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
  });

  it('roundtrips index rows and cascades deletes with the memory', () => {
    const ctx = loadedContext('memory-index-crud');
    // Manual index management below must not race the automatic background annotation
    ctx.memoryRepository.setOnMemoryUpserted(() => {});

    const memory = createMemory(ctx, { content: 'saw a ghost in the kitchen' });
    const embedding = Float32Array.from([0.25, -1.5, 3]);
    ctx.memoryIndexRepository.upsertIndex({
      memory_id: String(memory.id),
      importance: 7,
      embedding: embeddingToBuffer(embedding),
      embedding_model: 'fake-model',
    });

    const row = ctx.memoryIndexRepository.getIndex(String(memory.id));
    expect(row?.importance).toEqual(7);
    expect(row?.embedding_model).toEqual('fake-model');
    expect(Array.from(bufferToEmbedding(row?.embedding as Buffer))).toEqual([0.25, -1.5, 3]);

    // Upsert replaces in place
    ctx.memoryIndexRepository.upsertIndex({ memory_id: String(memory.id), importance: 9 });
    expect(ctx.memoryIndexRepository.getIndex(String(memory.id))?.importance).toEqual(9);

    ctx.memoryRepository.deleteMemory({ id: String(memory.id) });
    expect(ctx.memoryIndexRepository.getIndex(String(memory.id))).toBeUndefined();
  });

  it('lists memories that still need an embedding, oldest first', () => {
    const ctx = loadedContext('memory-index-unindexed');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});

    const first = createMemory(ctx, { content: 'first' });
    const second = createMemory(ctx, { content: 'second' });
    const third = createMemory(ctx, { content: 'third' });

    // second is fully indexed, third has importance but no embedding yet
    ctx.memoryIndexRepository.upsertIndex({
      memory_id: String(second.id),
      importance: 5,
      embedding: embeddingToBuffer(Float32Array.from([1])),
      embedding_model: 'fake-model',
    });
    ctx.memoryIndexRepository.upsertIndex({ memory_id: String(third.id), importance: 5 });

    const unindexed = ctx.memoryIndexRepository.getUnindexedMemories(10);
    expect(unindexed.map((memory) => memory.id)).toEqual([first.id, third.id]);
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

    const row = ctx.memoryIndexRepository.getIndex(String(memory.id));
    expect(row?.importance).toEqual(9);
    expect(row?.embedding_model).toEqual('fake-model');
    expect(Array.from(bufferToEmbedding(row?.embedding as Buffer))).toEqual([1, 2, 3]);
  });

  it('degrades to heuristic importance and no embedding when nothing is configured', async () => {
    const ctx = loadedContext('annotation-degraded');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});
    vi.spyOn(ctx.ai, 'runOneShot').mockRejectedValue(new Error('no provider'));

    const memory = createMemory(ctx, { content: 'tried tell_joke and it succeeded', event_type: 'outcome' });
    await ctx.memoryAnnotation.annotate(memory);

    const row = ctx.memoryIndexRepository.getIndex(String(memory.id));
    expect(row?.importance).toEqual(5);
    expect(row?.embedding).toBeNull();
    expect(row?.embedding_model).toBeNull();
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
