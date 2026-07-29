import { Server } from 'http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { runApi } from 'main/sentient-sims/api';
import { CreateMemoryRequest } from 'main/sentient-sims/models/GetMemoryRequest';
import { WebsocketNotification } from 'main/sentient-sims/models/ModWebsocketMessage';
import { mockApiContext } from './util';

describe('cognition routes', () => {
  const ctx = mockApiContext({ port: 25204 });
  const apiUrl = `http://localhost:${ctx.port}`;
  let server: Server;

  const sentToMod: WebsocketNotification[] = [];
  const createdMemories: CreateMemoryRequest[] = [];

  async function post(path: string, body: unknown) {
    const response = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response.json() as Promise<Record<string, unknown>>;
  }

  beforeAll(() => {
    vi.spyOn(ctx.actionDispatcher, 'sendToMod').mockImplementation((message) => {
      sentToMod.push(message);
    });
    vi.spyOn(ctx.memoryRepository, 'createMemory').mockImplementation((request) => {
      createdMemories.push(request);
      return { ...request.memory, id: 7 };
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

  it('debug enqueue dispatches an ENQUEUE_INTERACTION message and the outcome becomes a memory', async () => {
    const enqueue = await post('/cognition/debug/enqueue', {
      sim_id: '123',
      action: 'tell_joke',
      target_sim_id: '456',
      motivation: 'wants to cheer Peyton up',
    });

    const requestId = enqueue.request_id as string;
    expect(requestId).toBeTruthy();
    expect(ctx.actionDispatcher.pendingCount).toBe(1);
    expect(sentToMod).toHaveLength(1);
    expect(sentToMod[0]).toMatchObject({
      type: 'enqueue_interaction',
      request_id: requestId,
      sim_id: '123',
      action: 'tell_joke',
      target_sim_id: '456',
      source: 'cognition',
    });

    const outcome = await post('/cognition/outcome', {
      request_id: requestId,
      sim_id: '123',
      sim_name: 'Marisol Rocca',
      target_sim_id: '456',
      target_sim_name: 'Peyton Puckett',
      interaction_name: 'mixer_socials_TellJoke_group_Funny_alwaysOn',
      outcome: 'success',
      location_id: 88,
    });

    expect(outcome).toMatchObject({ ok: true, correlated: true, memory_id: 7 });
    expect(ctx.actionDispatcher.pendingCount).toBe(0);
    expect(createdMemories).toHaveLength(1);
    expect(createdMemories[0].memory).toMatchObject({
      event_type: 'outcome',
      location_id: 88,
      action: 'tell_joke',
      interaction_name: 'mixer_socials_TellJoke_group_Funny_alwaysOn',
      pre_action: 'wants to cheer Peyton up',
    });
    expect(createdMemories[0].memory.observation).toBe(
      "Marisol Rocca tried 'tell_joke' with Peyton Puckett and it succeeded.",
    );
    expect(createdMemories[0].participants.map((participant) => participant.id)).toEqual(['123', '456']);

    // A duplicate outcome for the same request is uncorrelated: the pending dispatch was consumed
    const duplicate = await post('/cognition/outcome', {
      request_id: requestId,
      sim_id: '123',
      outcome: 'failure',
    });
    expect(duplicate).toMatchObject({ ok: true, correlated: false });
  });

  it('writes an uncorrelated failure outcome using the reported names', async () => {
    createdMemories.length = 0;

    const outcome = await post('/cognition/outcome', {
      sim_id: '123',
      sim_name: 'Marisol Rocca',
      action: 'grab_snack',
      interaction_name: 'fridge_GrabSnackAutonomously',
      outcome: 'failure',
      location_id: 5,
    });

    expect(outcome).toMatchObject({ ok: true, correlated: false });
    expect(createdMemories[0].memory.observation).toBe("Marisol Rocca tried 'grab_snack' and it failed.");
    expect(createdMemories[0].memory.pre_action).toBeUndefined();
  });

  it('humanizes a raw game repr in the outcome reason', async () => {
    createdMemories.length = 0;

    const outcome = await post('/cognition/outcome', {
      sim_id: '123',
      sim_name: 'Marisol Rocca',
      action: 'take_shower',
      interaction_name: 'shower_TakeShower',
      outcome: 'canceled',
      reason: '<EnqueueResult: Bills: Interaction requires a utility that is shut off. <ExecuteResult: False: (None)>>',
      location_id: 5,
    });

    expect(outcome).toMatchObject({ ok: true, correlated: false });
    expect(createdMemories[0].memory.observation).toBe(
      "Marisol Rocca tried 'take_shower' and it was canceled (Bills: Interaction requires a utility that is shut off.).",
    );
  });

  it('requests a perception snapshot and formats the reply', async () => {
    sentToMod.length = 0;

    const request = await post('/cognition/debug/perception', { sim_id: '123' });
    const requestId = request.request_id as string;
    expect(requestId).toBeTruthy();
    expect(sentToMod).toHaveLength(1);
    expect(sentToMod[0]).toMatchObject({
      type: 'request_perception',
      request_id: requestId,
      sim_id: '123',
    });

    const reply = await post('/cognition/perception', {
      type: 'perception_snapshot',
      request_id: requestId,
      sim_id: '123',
      sim_name: 'Marisol Rocca',
      room_id: 5,
      location: { zone_id: 9, outdoors: false },
      sims: [{ sim_id: '456', tier: 'same_room', distance: 3.0, name: 'Peyton Puckett', doing: 'chat' }],
      objects: [
        { object_id: '100', action_keys: ['grab_snack'], name: 'object_fridge_01', tier: 'same_room', distance: 4.0 },
      ],
      ambient: { sim_mood: 'Happy' },
    });

    expect(reply.ok).toBe(true);
    expect(reply.formatted).toContain(
      'You can see: Peyton Puckett (chat, 3m away); a fridge (could grab snack, 4m away).',
    );
    expect(ctx.controller.cognition.getPerception('123')).toMatchObject({ request_id: requestId, sim_id: '123' });
  });

  it('sleep boundary reflects on the current scene and starts a new one', async () => {
    // No active scene yet: nothing to reflect on
    expect(await post('/cognition/sleep-boundary', { sim_id: '123' })).toMatchObject({
      ok: true,
      reflected: false,
    });

    const reflectedScenes: unknown[] = [];
    vi.spyOn(ctx.ai, 'runSceneReflection').mockImplementation((scene) => {
      reflectedScenes.push(scene);
      return Promise.resolve();
    });

    ctx.sceneService.checkSceneBoundary({ environment: { location_id: 42 } } as never);
    const scene = ctx.sceneService.getCurrentScene();
    expect(scene).toBeTruthy();

    const result = await post('/cognition/sleep-boundary', { sim_id: '123', sim_name: 'Marisol Rocca' });
    expect(result).toMatchObject({ ok: true, reflected: true, scene_id: scene?.sceneId });
    expect(reflectedScenes).toHaveLength(1);
    expect(reflectedScenes[0]).toMatchObject({ sceneId: scene?.sceneId, locationId: 42 });

    // The old scene ended and a fresh one started at the same location, so the next
    // travel boundary only covers what happens after the nap
    const nextScene = ctx.sceneService.getCurrentScene();
    expect(nextScene?.sceneId).not.toBe(scene?.sceneId);
    expect(nextScene?.locationId).toBe(42);

    expect(await post('/cognition/sleep-boundary', {})).toMatchObject({ error: 'sim_id is required' });
  });

  it('rejects invalid requests', async () => {
    expect(await post('/cognition/debug/enqueue', { sim_id: '123' })).toMatchObject({
      error: 'sim_id and action are required',
    });
    expect(await post('/cognition/outcome', { outcome: 'success' })).toMatchObject({
      error: 'sim_id and outcome are required',
    });
    expect(await post('/cognition/perception', { sims: [] })).toMatchObject({
      error: 'sim_id is required',
    });
    expect(await post('/cognition/debug/perception', {})).toMatchObject({
      error: 'sim_id is required',
    });
  });
});
