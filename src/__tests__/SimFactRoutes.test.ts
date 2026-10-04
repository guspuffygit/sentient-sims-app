import { Server } from 'http';
import fs from 'fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runApi } from 'main/sentient-sims/api';
import { FactPredicate } from 'main/sentient-sims/pipeline/facts/predicates';
import { SimDossier } from 'main/sentient-sims/models/SimDossier';
import { mockApiContext, mockEnvironment } from './util';

// H4: the provenance surface. "Why does she believe that" has to resolve to the memory it
// came from, and "how are these two related" to a chain of edges - the watches and the
// MCP tools have had no way to ask either question until now.
describe('sim fact routes', () => {
  const { directoryService, settingsService } = mockEnvironment();
  const ctx = mockApiContext({ port: 25206, directoryService, settingsService });
  const apiUrl = `http://localhost:${ctx.port}`;
  let server: Server;

  async function get(path: string) {
    const response = await fetch(`${apiUrl}${path}`);
    return { status: response.status, body: (await response.json()) as Record<string, never> };
  }

  async function send(method: string, path: string, body?: unknown) {
    const response = await fetch(`${apiUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: (await response.json()) as Record<string, never> };
  }

  const dossier: SimDossier = {
    sim_id: '100',
    name: 'Travis Scott',
    age: 'ELDER',
    family: { children: ['200'], steady_ids: [] },
    traits: ['trait_Geek'],
    relationships: [{ sim_id: '200', name: 'Mackenzie Scott', has_met: true, friendship: 100 }],
  };

  beforeAll(() => {
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: `routes-${Math.random().toString(36).slice(2)}`, saveId: '1' });
    ctx.semanticMemory.ingestDossier(dossier, { hash: 'r1', day: 10 });
    ctx.semanticMemory.ingestDossier(
      { sim_id: '200', name: 'Mackenzie Scott', family: { parents: ['100'], children: ['400'], steady_ids: [] } },
      { hash: 'r2', day: 10 },
    );
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

  it('lists a sim current facts with names for the ids', async () => {
    const { status, body } = await get('/sims/100/facts');
    expect(status).toBe(200);
    const facts = body.facts as unknown as { predicate: string; objectSimId?: string }[];
    expect(facts.some((fact) => fact.predicate === FactPredicate.CHILD && fact.objectSimId === '200')).toBe(true);
    // Ids are unreadable on their own; the route resolves them so no caller has to
    expect((body.names as unknown as Record<string, string>)['200']).toBe('Mackenzie Scott');
  });

  it('maps each id to its own name, not to the next row in the table', async () => {
    // getParticipantNames returns a bare list in database order with unknown ids dropped,
    // so zipping it against the requested ids renames people. Live on 2026-09-03 this
    // reported Travis's child under a different Sim's name - the exact cross-character
    // confusion the fact store exists to remove.
    ctx.participantRepository.updateParticipant({ id: '200', name: 'Mackenzie Scott' });
    ctx.participantRepository.updateParticipant({ id: '400', name: 'Someone Else' });

    const { body } = await get('/sims/100/facts');
    const names = body.names as unknown as Record<string, string>;
    expect(names['200']).toBe('Mackenzie Scott');
    expect(names['400']).toBeUndefined();

    const direct = ctx.participantRepository.getParticipantNameMap(['999', '400', '200']);
    expect(direct).toEqual({ '400': 'Someone Else', '200': 'Mackenzie Scott' });
  });

  it('narrows to one relationship with ?about', async () => {
    const { body } = await get('/sims/100/facts?about=200');
    const facts = body.facts as unknown as { objectSimId?: string }[];
    expect(facts.length).toBeGreaterThan(0);
    expect(facts.every((fact) => fact.objectSimId === '200')).toBe(true);
  });

  it('walks the edges between two sims', async () => {
    const { body } = await get('/sims/100/facts/path/400');
    expect(body.connected).toBe(true);
    expect((body.path as unknown as unknown[]).length).toBe(2);

    const unrelated = await get('/sims/100/facts/path/9999');
    expect(unrelated.body.connected).toBe(false);
  });

  it('accepts a player fact and refuses to let anyone claim to be the game', async () => {
    const added = await send('POST', '/sims/100/facts', {
      predicate: FactPredicate.LIKES,
      objectText: 'long walks',
      source: 'player',
    });
    expect(added.status).toBe(200);
    expect((added.body.fact as unknown as { source: string }).source).toBe('player');

    // `game` is the dossier's word alone: a route-asserted game fact could never be corrected
    const forged = await send('POST', '/sims/100/facts', {
      predicate: FactPredicate.LIKES,
      objectText: 'forgery',
      source: 'game',
    });
    expect(forged.status).toBe(400);
  });

  it('rejects a fact with no object', async () => {
    const { status } = await send('POST', '/sims/100/facts', { predicate: FactPredicate.LIKES });
    expect(status).toBe(400);
  });

  it('explains where a fact came from and what it replaced', async () => {
    const told = ctx.semanticMemory.addFact({
      subjectSimId: '100',
      predicate: FactPredicate.SPOUSE,
      objectSimId: '999',
      source: 'told',
      provenanceMemoryId: '4242',
      day: 10,
    });
    expect(told).toBeDefined();
    const { status, body } = await get(`/facts/${told}/explain`);
    expect(status).toBe(200);
    expect((body.fact as unknown as { source: string }).source).toBe('told');

    // The game then asserts the real spouse, retiring the told one
    ctx.semanticMemory.ingestDossier(
      { ...dossier, family: { spouse_id: '300', steady_ids: [] } },
      {
        hash: 'r3',
        day: 11,
      },
    );
    const after = await get(`/facts/${told}/explain`);
    expect((after.body.fact as unknown as { validToDay?: number }).validToDay).toBe(11);
    expect(after.body.supersededBy).toBeDefined();
  });

  it('retires a fact instead of deleting it', async () => {
    const id = ctx.semanticMemory.addFact({
      subjectSimId: '100',
      predicate: FactPredicate.DISLIKES,
      objectText: 'mistake',
      source: 'player',
      day: 12,
    });
    const { status } = await send('DELETE', `/sims/100/facts/${id}`);
    expect(status).toBe(200);
    expect(ctx.semanticMemory.getCurrentFacts('100').some((fact) => fact.id === id)).toBe(false);
    // ...and it is still there as history
    expect(ctx.semanticMemory.getHistory('100').some((fact) => fact.id === id)).toBe(true);
  });

  it('404s an unknown fact rather than inventing one', async () => {
    expect((await get('/facts/999999/explain')).status).toBe(404);
    expect((await send('DELETE', '/sims/100/facts/999999')).status).toBe(404);
  });

  it('publishes the predicate vocabulary so callers do not hardcode it', async () => {
    const { body } = await get('/facts/predicates');
    expect(body.predicates as unknown as string[]).toContain(FactPredicate.PARENT);
  });
});
