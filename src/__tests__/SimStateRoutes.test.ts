import { Server } from 'http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { runApi } from 'main/sentient-sims/api';
import { mockApiContext } from './util';

// The state report is a CORE route (release 4.5, decision 14), and so is Gus's sleep
// boundary (CognitionRoutes.test.ts has his test); these are our cases for both. Run here
// with no tiers at all.
describe('sim state routes', () => {
  const ctx = mockApiContext({ port: 25207, tiers: [] });
  const apiUrl = `http://localhost:${ctx.port}`;
  let server: Server;

  async function post(path: string, body: unknown) {
    const response = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response.json() as Promise<Record<string, unknown>>;
  }

  beforeAll(() => {
    server = runApi(ctx);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  });

  it('sleep boundary leaves a scene the sleeper was never in alone', async () => {
    // Live 2026-08-16 (FINDING G): Ariel slept at home while the app's active scene was
    // still the bar Mackenzie had travelled to. The boundary ended THEIR scene and wrote
    // Ariel a first-person diary of an evening she never attended.
    const reflected: unknown[] = [];
    vi.spyOn(ctx.ai, 'runSceneReflection').mockImplementation((scene) => {
      reflected.push(scene);
      return Promise.resolve();
    });
    const participants = vi.spyOn(ctx.memoryRepository, 'getSceneParticipantIds').mockReturnValue(['555', '777']);

    ctx.sceneService.checkSceneBoundary({ environment: { location_id: 99 } } as never);
    const barScene = ctx.sceneService.getCurrentScene();

    const result = await post('/cognition/sleep-boundary', { sim_id: '123', sim_name: 'Ariel Scott' });

    expect(result).toMatchObject({ ok: true, reflected: false });
    expect(reflected).toHaveLength(0);
    // The scene belongs to the sims who are in it and is still running
    expect(ctx.sceneService.getCurrentScene()?.sceneId).toBe(barScene?.sceneId);

    // A sim who IS in the scene still closes it as before
    participants.mockReturnValue(['123']);
    const own = await post('/cognition/sleep-boundary', { sim_id: '123', sim_name: 'Ariel Scott' });
    expect(own).toMatchObject({ ok: true, reflected: true });
    expect(reflected).toHaveLength(1);
    participants.mockRestore();
  });

  it('sleep boundary from an infant writes no diary and leaves the scene running (J8)', async () => {
    // the 2026-09-04 playtest handoff, cause 8: an infant naps several times a day; each nap ended
    // the household's scene and wrote the infant a first-person diary
    const reflected: unknown[] = [];
    vi.spyOn(ctx.ai, 'runSceneReflection').mockImplementation((scene) => {
      reflected.push(scene);
      return Promise.resolve();
    });
    ctx.simStateCache.ingest({
      type: 'state_report',
      seq: 5,
      sims: [{ sim_id: '600', sim_name: 'Ehren Scott', self: { age: 'INFANT' } }],
    } as never);

    ctx.sceneService.checkSceneBoundary({ environment: { location_id: 77 } } as never);
    const scene = ctx.sceneService.getCurrentScene();

    const result = await post('/cognition/sleep-boundary', { sim_id: '600', sim_name: 'Ehren Scott' });
    expect(result).toMatchObject({ ok: true, reflected: false });
    expect(String(result.reason)).toContain('infant');
    expect(reflected).toHaveLength(0);
    expect(ctx.sceneService.getCurrentScene()?.sceneId).toBe(scene?.sceneId);
    ctx.simStateCache.reset();
  });

  it('ingests state reports into the SimStateCache', async () => {
    const result = await post('/cognition/state', {
      type: 'state_report',
      seq: 1,
      whitelist_version: 'abc123',
      lot: { zone_id: 9, clock: { hour: 14, paused: false }, funds: 500, owned: { computer: 0, fridge: 1 } },
      sims: [
        {
          sim_id: '123',
          sims: [],
          objects: [],
          self: { mood: 'Happy', needs: { bladder: 20 }, wants: ['want_Motives_Energy'] },
          activity: { queue: [], running: null, in_social: false },
        },
      ],
      went_idle: ['123'],
    });

    expect(result).toMatchObject({ ok: true, seq: 1 });
    expect(ctx.simStateCache.getReport()?.seq).toBe(1);
    expect(ctx.simStateCache.getSim('123')?.self?.mood).toBe('Happy');
    expect(ctx.simStateCache.isStale()).toBe(false);

    expect(await post('/cognition/state', { seq: 2 })).toMatchObject({ error: 'not a state_report' });
  });
});
