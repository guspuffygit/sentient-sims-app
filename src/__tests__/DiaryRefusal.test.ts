import { describe, expect, it, vi } from 'vitest';
import { SceneState } from 'main/sentient-sims/services/SceneService';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import { mockApiContext } from './util';

// Flora's sleep diary on Haiku (2026-10-29) came back as a refusal over the night's WickedWhims
// row and was stored word for word. The diary is written once more without the act; a refusal
// with nothing intimate in the day stores nothing.
const REFUSAL =
  "I'm not going to write this diary entry, since it would mean narrating explicit sexual content involving Flora and Jake.";

function diaryScene(replies: string[]) {
  const ctx = mockApiContext();
  const scene: SceneState = { sceneId: 7, locationId: 10, startedAt: '2026-10-29T00:00:00.000Z' };
  const rows = [
    { id: '1', content: 'Jake Flores: morning', location_id: 10, event_type: 'interaction' },
    { id: '2', content: 'Flora Ladipo: hey you', location_id: 10, event_type: 'interaction' },
    {
      id: '3',
      content: 'Flora Ladipo and Jake Flores are having sex in the bed.',
      location_id: 10,
      event_type: 'wickedwhims',
    },
    { id: '4', content: 'Jaz Kieten: how was your night', location_id: 10, event_type: 'interaction' },
  ] as unknown as MemoryEntity[];
  vi.spyOn(ctx.memoryRepository, 'getSceneMemories').mockReturnValue(rows);
  vi.spyOn(ctx.memoryRepository, 'getSceneParticipantIds').mockReturnValue(['500', '600']);
  vi.spyOn(ctx.memoryRepository, 'getParticipantIdsForMemories').mockReturnValue(new Map([['3', ['500', '600']]]));
  vi.spyOn(ctx.participantRepository, 'getParticipantNames').mockReturnValue(['Flora Ladipo', 'Jake Flores']);
  vi.spyOn(ctx.locationRepository, 'getLocation').mockReturnValue({ id: 10, name: 'Havisham House' } as never);
  const oneShot = vi.spyOn(ctx.ai, 'runOneShot');
  replies.forEach((text) =>
    oneShot.mockResolvedValueOnce({
      text,
      exchange: { label: 'Scene Reflection', request: { messages: [], maxResponseTokens: 160 }, responseText: text },
    }),
  );
  const created = vi.spyOn(ctx.memoryRepository, 'createMemory').mockReturnValue(undefined);
  ctx.simStateCache.ingest({
    type: 'state_report',
    seq: 1,
    sims: [{ sim_id: '500', sim_name: 'Flora Ladipo', self: { age: 'YOUNGADULT' } }],
  } as never);
  return { ctx, scene, oneShot, created };
}

describe('sleep diary refusals', () => {
  it('writes the diary again without the intimate row when the model refuses', async () => {
    const { ctx, scene, oneShot, created } = diaryScene([
      REFUSAL,
      'A slow morning with Jake, then Jaz asked about my night.',
    ]);
    await ctx.ai.runSceneReflection(scene, { simId: '500', simName: 'Flora Ladipo' }, 'travel');
    expect(oneShot).toHaveBeenCalledTimes(2);
    expect(oneShot.mock.calls[0][2]).toContain('having sex');
    expect(oneShot.mock.calls[1][2]).not.toContain('having sex');
    expect(oneShot.mock.calls[1][2]).toContain('how was your night');
    expect(created).toHaveBeenCalledTimes(1);
    const stored = created.mock.calls[0][0].memory.content;
    expect(stored).toContain('A slow morning with Jake');
    expect(stored).not.toContain('not going to write');
  });

  it('stores nothing when the model refuses twice', async () => {
    const { ctx, scene, oneShot, created } = diaryScene([REFUSAL, REFUSAL]);
    await ctx.ai.runSceneReflection(scene, { simId: '500', simName: 'Flora Ladipo' }, 'travel');
    expect(oneShot).toHaveBeenCalledTimes(2);
    expect(created).not.toHaveBeenCalled();
  });
});
