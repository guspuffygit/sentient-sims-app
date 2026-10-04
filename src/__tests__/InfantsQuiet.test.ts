import { afterEach, describe, expect, it, vi } from 'vitest';
import { isBelowChild, lifeStageOf } from 'main/sentient-sims/util/simLifeStage';
import { SceneState } from 'main/sentient-sims/services/SceneService';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import { mockApiContext } from './util';

// J8 (the 2026-09-04 playtest handoff, cause 8): infants wrote diaries and ran Action Scenes that
// could not produce an option. Below CHILD the sim is quiet: no diary at a boundary,
// no deliberation with an empty vocabulary. Unknown age fails OPEN — nothing may stop a
// Sim thinking on a missing field.
describe('infants go quiet', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('isBelowChild knows the three quiet stages and fails open on the unknown', () => {
    expect(isBelowChild('BABY')).toBe(true);
    expect(isBelowChild('infant')).toBe(true);
    expect(isBelowChild(' Toddler ')).toBe(true);
    expect(isBelowChild('CHILD')).toBe(false);
    expect(isBelowChild('ELDER')).toBe(false);
    expect(isBelowChild(undefined)).toBe(false);
    expect(isBelowChild('')).toBe(false);
  });

  it('reads the life stage from the state report first, the fact store second, and shrugs otherwise', () => {
    const cache = { getSim: (simId: string) => (simId === '1' ? { self: { age: 'infant' } } : undefined) };
    const facts = {
      getCurrentFacts: (simId: string) =>
        simId === '2'
          ? [
              { predicate: 'name', objectText: 'x' },
              { predicate: 'age_stage', objectText: 'TODDLER' },
            ]
          : [],
    };
    expect(lifeStageOf({ simStateCache: cache, semanticMemory: facts }, '1')).toBe('INFANT');
    expect(lifeStageOf({ simStateCache: cache, semanticMemory: facts }, '2')).toBe('TODDLER');
    expect(lifeStageOf({ simStateCache: cache, semanticMemory: facts }, '3')).toBeUndefined();
    // A context with no fact store (tests, the bench harness) throws inside; the answer is unknown
    const throwing = {
      getCurrentFacts: () => {
        throw new Error('no db');
      },
    };
    expect(lifeStageOf({ simStateCache: cache, semanticMemory: throwing }, '3')).toBeUndefined();
    expect(lifeStageOf({}, '3')).toBeUndefined();
  });

  it('a travel boundary writes no diary for an infant, and still writes one for an adult', async () => {
    const ctx = mockApiContext();
    const scene: SceneState = { sceneId: 1, locationId: 10, startedAt: '2026-09-04T00:00:00.000Z' };
    // Four rows: a travel boundary needs a scene with some substance before it earns a
    // diary, so a two-row fixture would now skip for a reason this test isn't about
    const rows = [
      { id: '1', content: 'Travis: dinner is ready', location_id: 10 },
      { id: '2', content: 'Ariel: coming', location_id: 10 },
      { id: '3', content: 'Travis: sit anywhere', location_id: 10 },
      { id: '4', content: 'Ariel: it smells good', location_id: 10 },
    ] as unknown as MemoryEntity[];
    vi.spyOn(ctx.memoryRepository, 'getSceneMemories').mockReturnValue(rows);
    vi.spyOn(ctx.memoryRepository, 'getSceneParticipantIds').mockReturnValue(['500', '600']);
    vi.spyOn(ctx.participantRepository, 'getParticipantNames').mockReturnValue(['Travis Scott', 'Ehren Scott']);
    vi.spyOn(ctx.locationRepository, 'getLocation').mockReturnValue({ id: 10, name: 'Sandtrap Flat' } as never);
    const oneShot = vi
      .spyOn(ctx.ai, 'runOneShot')
      .mockResolvedValue({ text: 'A quiet dinner.', exchange: {} } as never);
    ctx.simStateCache.ingest({
      type: 'state_report',
      seq: 1,
      sims: [
        { sim_id: '600', sim_name: 'Ehren Scott', self: { age: 'INFANT' } },
        { sim_id: '500', sim_name: 'Travis Scott', self: { age: 'ELDER' } },
      ],
    } as never);

    await ctx.ai.runSceneReflection(scene, { simId: '600', simName: 'Ehren Scott' }, 'travel');
    expect(oneShot).not.toHaveBeenCalled();

    await ctx.ai.runSceneReflection(scene, { simId: '500', simName: 'Travis Scott' }, 'travel');
    expect(oneShot).toHaveBeenCalledTimes(1);
    expect(oneShot.mock.calls[0][0]).toBe('Scene Reflection');
  });

  // A hop through a lot is not a day worth writing down. The sleep boundary keeps the
  // lower bar because the same call also sets tomorrow's goals.
  it('a thin travel scene earns no diary', async () => {
    const ctx = mockApiContext();
    const scene: SceneState = { sceneId: 2, locationId: 10, startedAt: '2026-09-17T00:00:00.000Z' };
    const rows = [
      { id: '1', content: 'Travis: nice day', location_id: 10 },
      { id: '2', content: 'Ariel: it is', location_id: 10 },
      { id: '3', content: 'Travis: heading off', location_id: 10 },
    ] as unknown as MemoryEntity[];
    vi.spyOn(ctx.memoryRepository, 'getSceneMemories').mockReturnValue(rows);
    vi.spyOn(ctx.memoryRepository, 'getSceneParticipantIds').mockReturnValue(['500', '600']);
    vi.spyOn(ctx.participantRepository, 'getParticipantNames').mockReturnValue(['Travis Scott', 'Ariel Scott']);
    vi.spyOn(ctx.locationRepository, 'getLocation').mockReturnValue({ id: 10, name: 'Sandtrap Flat' } as never);
    const oneShot = vi
      .spyOn(ctx.ai, 'runOneShot')
      .mockResolvedValue({ text: 'A quiet stop.', exchange: {} } as never);
    ctx.simStateCache.ingest({
      type: 'state_report',
      seq: 1,
      sims: [{ sim_id: '500', sim_name: 'Travis Scott', self: { age: 'ELDER' } }],
    } as never);

    await ctx.ai.runSceneReflection(scene, { simId: '500', simName: 'Travis Scott' }, 'travel');
    expect(oneShot).not.toHaveBeenCalled();
  });
});
