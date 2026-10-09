import { Server } from 'http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { runApi } from 'main/sentient-sims/api';
import { SimDossier } from 'main/sentient-sims/models/SimDossier';
import { mockApiContext } from './util';

// POST /cognition/dossier is the mod's ground-truth channel (H1 -> H2). The handler must
// stay cheap and forgiving: the mod posts from a daemon thread and treats any non-404 as
// success, so a malformed report should be rejected loudly but never crash the route.
describe('dossier route', () => {
  const ctx = mockApiContext({ port: 25205 });
  const apiUrl = `http://localhost:${ctx.port}`;
  let server: Server;

  const ingested: { simId: string; day?: number }[] = [];

  async function post(path: string, body: unknown) {
    const response = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { status: response.status, body: (await response.json()) as Record<string, unknown> };
  }

  function dossier(simId: string): SimDossier {
    return { sim_id: simId, name: `Sim ${simId}`, age: 'ADULT' };
  }

  // Set per test: which identity facts the next ingest should report as changed
  let identityChanged: string[] = [];

  beforeAll(() => {
    vi.spyOn(ctx.semanticMemory, 'ingestDossier').mockImplementation((d, options) => {
      ingested.push({ simId: d.sim_id, day: options?.day });
      return { inserted: 3, retired: 1, skipped: false, identityChanged };
    });
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

  it('ingests every dossier in the report and carries the game day', async () => {
    const { status, body } = await post('/cognition/dossier', {
      type: 'dossier_report',
      seq: 4,
      reason: 'zone_load',
      clock: { absolute_day: 78, hour: 1, minute: 43 },
      dossiers: [dossier('100'), dossier('200')],
    });
    expect(status).toBe(200);
    expect(body).toMatchObject({ ok: true, seq: 4, ingested: 2, inserted: 6, retired: 2 });
    expect(ingested).toEqual([
      { simId: '100', day: 78 },
      { simId: '200', day: 78 },
    ]);
  });

  it('rejects a body with no dossiers rather than silently accepting it', async () => {
    const { status } = await post('/cognition/dossier', { type: 'dossier_report', seq: 5 });
    expect(status).toBe(400);
  });

  it('skips an entry with no sim id instead of failing the whole report', async () => {
    ingested.length = 0;
    const { status, body } = await post('/cognition/dossier', {
      dossiers: [{ name: 'nobody' }, dossier('300')],
    });
    expect(status).toBe(200);
    expect(body.ingested).toBe(1);
    expect(ingested.map((entry) => entry.simId)).toEqual(['300']);
  });

  it('drops a stale generated description when the sim is no longer who it described', async () => {
    // Fix B: the sim aged up, so the description written about the old one is wrong. The
    // clear is what makes the next scene write a fresh one.
    const clear = vi.spyOn(ctx.participantRepository, 'clearGeneratedDescription').mockReturnValue(true);
    const forget = vi.spyOn(ctx.defaultDescriptions, 'forget').mockImplementation(() => {});

    identityChanged = ['age_stage'];
    await post('/cognition/dossier', { dossiers: [dossier('400')] });
    expect(clear).toHaveBeenCalledWith('400');
    expect(forget).toHaveBeenCalledWith('400');

    // A dossier that changed nothing about who the sim is leaves the description alone
    clear.mockClear();
    forget.mockClear();
    identityChanged = [];
    await post('/cognition/dossier', { dossiers: [dossier('500')] });
    expect(clear).not.toHaveBeenCalled();
    expect(forget).not.toHaveBeenCalled();

    // ...and a description the player wrote is not cleared, so nothing is regenerated
    clear.mockReturnValue(false);
    identityChanged = ['age_stage'];
    await post('/cognition/dossier', { dossiers: [dossier('600')] });
    expect(clear).toHaveBeenCalledWith('600');
    expect(forget).not.toHaveBeenCalled();

    clear.mockRestore();
    forget.mockRestore();
    identityChanged = [];
  });

  it('never lets a description problem fail the dossier POST', async () => {
    const clear = vi.spyOn(ctx.participantRepository, 'clearGeneratedDescription').mockImplementation(() => {
      throw new Error('no database loaded');
    });
    identityChanged = ['age_stage'];

    const { status, body } = await post('/cognition/dossier', { dossiers: [dossier('700')] });

    expect(status).toBe(200);
    expect(body.ok).toBe(true);
    clear.mockRestore();
    identityChanged = [];
  });

  // R2 (2026-09-04): a bench event with no environment used to reach buildPromptRequest,
  // throw on location_id, and pop a renderer notification every time (something posted
  // exactly that every 30 s on 2026-09-03). A malformed event is a 400 and never a generation.
});
