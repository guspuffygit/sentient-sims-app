import * as fs from 'fs';
import { describe, expect, it } from 'vitest';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import { mockApiContext } from './util';

// H3: an old memory about someone just mentioned has to be reachable. Before the focus
// window, retrieval only ever saw the newest N memories involving the sim, so a question
// about Nancy could not surface a Nancy memory that had fallen out of that window no
// matter how well it would have scored.
describe('entity-focus retrieval window', () => {
  function loadedContext(): ApiContext {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: `focus-${Math.random().toString(36).slice(2)}`, saveId: '1' });
    ctx.memoryRepository.setOnMemoryUpserted(() => {});
    return ctx;
  }

  function createMemory(ctx: ApiContext, content: string, participantIds: string[]): MemoryEntity {
    const created = ctx.memoryRepository.createMemory({
      memory: { location_id: 1, content },
      participants: participantIds.map((id) => ({ id })),
    });
    if (!created) {
      throw new Error('test memory rejected by hygiene gate');
    }
    return created;
  }

  it('surfaces an old memory about a mentioned sim that the recent window misses', () => {
    const ctx = loadedContext();
    // The one memory that matters, written first so it falls out of a tight window
    createMemory(ctx, 'Nancy admitted she started the fire', ['100', '200']);
    // ...buried under newer, unrelated rows
    for (let index = 0; index < 5; index += 1) {
      createMemory(ctx, `unrelated tick ${index}`, ['100']);
    }

    const narrow = ctx.memoryIndexRepository.getRetrievalCandidates(['100'], 3, 'none', ['100']);
    expect(narrow.some((row) => row.content?.includes('Nancy'))).toBe(false);

    const withFocus = ctx.memoryIndexRepository.getRetrievalCandidates(['100'], 3, 'none', ['100'], ['200']);
    expect(withFocus.some((row) => row.content?.includes('Nancy'))).toBe(true);
  });

  it('does not duplicate a row that both windows return', () => {
    const ctx = loadedContext();
    createMemory(ctx, 'shared row', ['100', '200']);
    const rows = ctx.memoryIndexRepository.getRetrievalCandidates(['100'], 50, 'none', ['100'], ['200']);
    expect(rows.filter((row) => row.content === 'shared row')).toHaveLength(1);
  });

  it('keeps private rows private even when their owner is named as a focus', () => {
    // Naming someone must not become a way to read their inner monologue
    const ctx = loadedContext();
    const secret = ctx.memoryRepository.createMemory({
      memory: { location_id: 1, content: "Nancy's private thought", event_type: 'thought' },
      participants: [{ id: '200' }],
      index: { owner: '200' },
    });
    expect(secret).toBeDefined();

    const rows = ctx.memoryIndexRepository.getRetrievalCandidates(['100'], 50, 'none', ['100'], ['200']);
    expect(rows.some((row) => row.content?.includes('private thought'))).toBe(false);
  });

  it('stamps the game day from the loaded state report', () => {
    const ctx = loadedContext();
    ctx.simStateCache.ingest({
      type: 'state_report',
      seq: 1,
      lot: { clock: { absolute_day: 78, hour: 9, minute: 0 } },
      sims: [],
    } as never);
    const memory = createMemory(ctx, 'something happened today', ['100']);
    const rows = ctx.memoryIndexRepository.getRetrievalCandidates(['100'], 50, 'none', ['100']);
    const stored = rows.find((row) => row.id === memory.id);
    expect(stored?.game_day).toBe(78);
  });

  it('leaves the game day unset when no state report has arrived', () => {
    const ctx = loadedContext();
    const memory = createMemory(ctx, 'written from the scenario tester', ['100']);
    const rows = ctx.memoryIndexRepository.getRetrievalCandidates(['100'], 50, 'none', ['100']);
    const stored = rows.find((row) => row.id === memory.id);
    expect(stored?.game_day ?? null).toBeNull();
  });
});
