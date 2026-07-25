import * as fs from 'fs';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import {
  EmbeddingService,
  NoopEmbeddingService,
  embeddingToBuffer,
} from 'main/sentient-sims/services/EmbeddingService';
import { recencyScore, scoreCandidate } from 'main/sentient-sims/services/MemoryRetrievalService';
import { summarizeMemory, PromptRequestBuilderOptions } from 'main/sentient-sims/services/PromptRequestBuilderService';
import { SSEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { mockApiContext } from './util';

function loadedContext(sessionId: string): ApiContext {
  const ctx = mockApiContext();
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
  ctx.db.loadDatabase({ sessionId, saveId: '1' });
  // Tests manage index rows by hand; the background annotator must not race them
  ctx.memoryRepository.setOnMemoryUpserted(() => {});
  return ctx;
}

function createMemory(
  ctx: ApiContext,
  memory: Partial<MemoryEntity>,
  participantIds: string[] = ['100'],
): MemoryEntity {
  return ctx.memoryRepository.createMemory({
    memory: { location_id: 1, content: 'a memory', ...memory },
    participants: participantIds.map((id) => ({ id })),
  });
}

function fakeEmbedder(vector: number[]): EmbeddingService {
  return {
    model: 'fake-model',
    isAvailable: () => true,
    embed: (texts: string[]) => Promise.resolve(texts.map(() => Float32Array.from(vector))),
  };
}

function indexMemory(ctx: ApiContext, memory: MemoryEntity, importance: number, embedding?: number[]) {
  ctx.memoryIndexRepository.upsertIndex({
    memory_id: Number(memory.id),
    importance,
    embedding: embedding ? embeddingToBuffer(Float32Array.from(embedding)) : undefined,
    embedding_model: embedding ? 'fake-model' : undefined,
  });
}

describe('scoring', () => {
  it('decays recency by the hour and never goes negative or NaN', () => {
    const now = new Date('2026-07-22T12:00:00Z');
    expect(recencyScore('2026-07-22 12:00:00', now)).toBeCloseTo(1);
    expect(recencyScore('2026-07-21 12:00:00', now)).toBeCloseTo(0.995 ** 24);
    // Future timestamps clamp to "just now" instead of scoring above 1
    expect(recencyScore('2026-07-23 12:00:00', now)).toBeCloseTo(1);
    expect(recencyScore(undefined, now)).toEqual(0);
    expect(recencyScore('not a timestamp', now)).toEqual(0);
  });

  it('blends recency, importance, and similarity with equal weight', () => {
    const now = new Date('2026-07-22T12:00:00Z');
    const query = Float32Array.from([1, 0]);
    const scored = scoreCandidate(
      {
        id: 1,
        location_id: 1,
        timestamp: '2026-07-22 12:00:00',
        importance: 7,
        embedding: embeddingToBuffer(Float32Array.from([1, 0])),
        embedding_model: 'fake-model',
      },
      query,
      now,
    );
    expect(scored.recency).toBeCloseTo(1);
    expect(scored.importance).toBeCloseTo(0.7);
    expect(scored.similarity).toBeCloseTo(1);
    expect(scored.score).toBeCloseTo(2.7);

    // Un-annotated rows fall back to the event-type heuristic and contribute no similarity
    const unannotated = scoreCandidate(
      { id: 2, location_id: 1, timestamp: '2026-07-22 12:00:00', event_type: 'reflection' },
      query,
      now,
    );
    expect(unannotated.importance).toBeCloseTo(0.8);
    expect(unannotated.similarity).toEqual(0);
  });
});

describe('MemoryRetrievalService', () => {
  it('ranks semantically similar memories first and honors k and exclusions', async () => {
    const ctx = loadedContext('retrieval-ranking');
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(fakeEmbedder([1, 0]));

    const similar = createMemory(ctx, { content: 'talked about the wedding' });
    const dissimilar = createMemory(ctx, { content: 'washed the dishes' });
    const unembedded = createMemory(ctx, { content: 'stared at the wall' });
    indexMemory(ctx, similar, 5, [1, 0]);
    indexMemory(ctx, dissimilar, 5, [0, 1]);
    indexMemory(ctx, unembedded, 5);

    const results = await ctx.memoryRetrieval.retrieve({ participantIds: ['100'], queryText: 'wedding plans', k: 3 });
    expect(results.map((result) => result.memory.id)[0]).toEqual(similar.id);
    expect(results[0].similarity).toBeCloseTo(1);
    expect(results).toHaveLength(3);

    const topOnly = await ctx.memoryRetrieval.retrieve({ participantIds: ['100'], queryText: 'wedding plans', k: 1 });
    expect(topOnly.map((result) => result.memory.id)).toEqual([similar.id]);

    const excluded = await ctx.memoryRetrieval.retrieve({
      participantIds: ['100'],
      queryText: 'wedding plans',
      k: 3,
      excludeMemoryIds: [Number(similar.id)],
    });
    expect(excluded.map((result) => result.memory.id)).not.toContain(similar.id);
    expect(excluded).toHaveLength(2);
  });

  it('only considers memories involving the requested participants', async () => {
    const ctx = loadedContext('retrieval-participants');
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());

    const mine = createMemory(ctx, { content: 'my memory' }, ['100']);
    createMemory(ctx, { content: 'someone elses memory' }, ['200']);

    const results = await ctx.memoryRetrieval.retrieve({ participantIds: ['100'], queryText: 'anything', k: 10 });
    expect(results.map((result) => result.memory.id)).toEqual([mine.id]);

    expect(await ctx.memoryRetrieval.retrieve({ participantIds: [], queryText: 'anything', k: 10 })).toEqual([]);
  });

  it('ranks by importance and recency when no embedder is configured', async () => {
    const ctx = loadedContext('retrieval-degraded');
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());

    const mundane = createMemory(ctx, { content: 'swept the floor' });
    const lifeChanging = createMemory(ctx, { content: 'got engaged' });
    indexMemory(ctx, mundane, 1);
    indexMemory(ctx, lifeChanging, 9);

    const results = await ctx.memoryRetrieval.retrieve({ participantIds: ['100'], queryText: 'query', k: 2 });
    expect(results.map((result) => result.memory.id)).toEqual([lifeChanging.id, mundane.id]);
    expect(results[0].similarity).toEqual(0);
  });
});

describe('backfill', () => {
  it('embeds un-indexed memories in batches and preserves existing ratings', async () => {
    const ctx = loadedContext('backfill-batches');
    // Batches ride the queue's idle lane in production; run them inline so the test
    // exercises batching, not the quiet-period wait
    vi.spyOn(ctx.generationQueue, 'runWhenIdle').mockImplementation((task) => task());
    const embed = vi.fn((texts: string[]) => Promise.resolve(texts.map(() => Float32Array.from([1, 2]))));
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue({ model: 'fake-model', isAvailable: () => true, embed });

    createMemory(ctx, { content: 'first', event_type: 'outcome' });
    createMemory(ctx, { content: 'second' });
    const rated = createMemory(ctx, { content: 'third, already rated by the live path' });
    // Simulates a row annotated while no embedder was configured: importance but no embedding
    indexMemory(ctx, rated, 9);

    expect(await ctx.memoryAnnotation.backfill(2)).toEqual(3);
    expect(embed).toHaveBeenCalledTimes(2); // batches of 2 + 1

    expect(ctx.memoryIndexRepository.getUnindexedMemories(10)).toEqual([]);
    const ratedRow = ctx.memoryIndexRepository.getIndex(Number(rated.id));
    expect(ratedRow?.importance).toEqual(9);
    expect(ratedRow?.embedding_model).toEqual('fake-model');

    // Idempotent: a second run finds nothing to do and makes no embedding calls
    expect(await ctx.memoryAnnotation.backfill(2)).toEqual(0);
    expect(embed).toHaveBeenCalledTimes(2);
  });

  it('does nothing without an available embedder', async () => {
    const ctx = loadedContext('backfill-guarded');
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());

    const memory = createMemory(ctx, { content: 'left for later' });

    expect(await ctx.memoryAnnotation.backfill()).toEqual(0);
    expect(ctx.memoryIndexRepository.getIndex(Number(memory.id))).toBeUndefined();
  });
});

describe('prompt wiring', () => {
  function makeSim(): SentientSim {
    return {
      careers: [],
      name: 'Testy Tester',
      age: SimAge.ADULT,
      sim_id: '100',
      gender: 'Male',
      traits: [],
      moods: [],
      is_ghost: false,
      grubby: false,
      in_pool: false,
      is_at_home: false,
      is_dying: false,
      is_human: true,
      is_inside_building: false,
      is_outside: false,
      is_pet: false,
      on_fire: false,
      on_home_lot: false,
      sleeping: false,
      is_pregnant: false,
      is_player_sim: true,
    };
  }

  function testEvent(): SSEvent {
    return {
      event_id: 'test-event',
      event_type: SSEventType.INTERACTION,
      location_id: 0,
      environment: {
        location_id: 1,
        world_id: 0,
        time: { second: 0, minute: 0, hour: 0, day: 0, week: 0 },
      },
      sentient_sims: [makeSim()],
    };
  }

  function promptOptions(): PromptRequestBuilderOptions {
    return {
      action: '{actor.0} chats about weekend plans.',
      apiType: ApiType.OpenAI,
      modelSettings: {
        temperature: undefined,
        top_p: undefined,
        top_k: undefined,
        repetition_penalty: undefined,
        max_tokens: 5000,
      },
    };
  }

  it('summarizes memory text preferring observation and truncating long content', () => {
    expect(summarizeMemory({ location_id: 1, observation: 'saw it happen', content: 'a long transcript' })).toEqual(
      'saw it happen',
    );
    const long = 'word '.repeat(100);
    const summarized = summarizeMemory({ location_id: 1, content: long });
    expect(summarized.length).toBeLessThanOrEqual(281);
    expect(summarized.endsWith('…')).toBe(true);
  });

  it('adds a <RELEVANT_MEMORIES> block and honors the settings toggle', async () => {
    const ctx = loadedContext('prompt-relevant-memories');
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());

    const past = createMemory(ctx, { content: 'won the neighborhood chess tournament' });
    indexMemory(ctx, past, 9);

    const result = await ctx.promptBuilder.buildPromptRequest(testEvent(), promptOptions());
    expect(result.participants).toContain('<RELEVANT_MEMORIES>');
    expect(result.participants).toContain('won the neighborhood chess tournament');

    ctx.settings.memoryRetrievalEnabled = false;
    const disabled = await ctx.promptBuilder.buildPromptRequest(testEvent(), promptOptions());
    expect(disabled.participants).not.toContain('<RELEVANT_MEMORIES>');
  });

  it('excludes current-scene memories from retrieval', async () => {
    const ctx = loadedContext('prompt-scene-exclusion');
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());

    const older = createMemory(ctx, { content: 'burned the anniversary dinner', location_id: 2 });
    indexMemory(ctx, older, 9);

    const event = testEvent();
    ctx.sceneService.checkSceneBoundary(event);
    const inScene = createMemory(ctx, { content: 'is chatting about the weather right now', location_id: 1 });
    indexMemory(ctx, inScene, 9);

    const result = await ctx.promptBuilder.buildPromptRequest(event, promptOptions());
    expect(result.participants).toContain('burned the anniversary dinner');
    expect(result.participants).not.toContain('is chatting about the weather right now');
  });
});
