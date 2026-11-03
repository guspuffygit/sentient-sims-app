import { Server } from 'http';
import { afterAll, beforeAll, describe, expect, it, MockInstance, vi } from 'vitest';
import * as fs from 'fs';
import { runApi } from 'main/sentient-sims/api';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { NoopEmbeddingService } from 'main/sentient-sims/services/EmbeddingService';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { InteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { mockApiContext } from './util';

// Fewer repeated scenes (handoff SCENE-REPEATS 2026-10-31, guard-only cut): the same cast on
// the same beat inside the cooldown is dropped before it takes a queue slot; an event the mod
// stamps `reaction: true` runs as ONE silent thought for the actor, one per cooldown.

function makeSim(name: string, simId: string, isPlayerSim = false): SentientSim {
  return {
    careers: [],
    name,
    age: SimAge.ADULT,
    sim_id: simId,
    gender: 'Female',
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
    is_player_sim: isPlayerSim,
  };
}

let eventNo = 0;

function sceneEvent(
  interactionName: string,
  sims: SentientSim[],
  extra: Partial<InteractionEvent> = {},
): InteractionEvent {
  eventNo += 1;
  return {
    event_id: `event-${eventNo}`,
    event_type: SSEventType.INTERACTION,
    location_id: 5,
    environment: {
      location_id: 5,
      world_id: 0,
      time: { second: 0, minute: 0, hour: 20, day: 1, week: 0 },
    },
    sentient_sims: sims,
    interaction_name: interactionName,
    // A description of its own, so the built-in map does not decide the test
    testing_action: '{actor.0} is watching {actor.1} play the guitar.',
    ...extra,
  };
}

const CAT = makeSim('Mittens Cat', '7');
const JULIAN = makeSim('Julian Doe', '1', true);
const ARLENE = makeSim('Arlene Zhang', '2', true);
const WATCH = 'petInvestigate_Obsess_Watch_Instrument_Vocal';

describe('repeated scenes', () => {
  const ctx: ApiContext = mockApiContext({ port: 25204 });
  const apiUrl = `http://localhost:${ctx.port}`;
  let server: Server;
  const labels: string[] = [];
  let tts: MockInstance<() => void>;
  let roundQueued: MockInstance<ApiContext['scenePlayback']['roundQueued']>;
  let continuations: MockInstance<ApiContext['generationQueue']['runExclusive']>;

  async function post(event: InteractionEvent) {
    const response = await fetch(`${apiUrl}/ai/v2/event/interaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return response.json() as Promise<Record<string, unknown> & { status: string; memory?: { event_type?: string } }>;
  }

  // Continuation rounds run after the response: wait for every queued one
  async function settle() {
    let settled = 0;
    while (settled < continuations.mock.results.length) {
      const pending = continuations.mock.results.slice(settled).map((queued) => queued.value as Promise<unknown>);
      settled = continuations.mock.results.length;
      await Promise.allSettled(pending);
    }
  }

  const actorCalls = () => labels.filter((label) => label.startsWith('Actor:'));

  beforeAll(() => {
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: 'scene-repeat', saveId: '1' });
    ctx.settings.set(SettingsEnum.SCENE_PIPELINE_MODE, 'lean');
    ctx.settings.set(SettingsEnum.GENERATED_DEFAULT_DESCRIPTIONS, false);
    ctx.settings.set(SettingsEnum.SCENE_REPEAT_COOLDOWN_SECONDS, 120);
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());
    vi.spyOn(ctx.modelSettings, 'getModelSettings').mockResolvedValue({
      temperature: undefined,
      top_p: undefined,
      top_k: undefined,
      repetition_penalty: undefined,
      max_tokens: 5000,
    });
    let lineNo = 0;
    vi.spyOn(ctx.ai, 'runOneShot').mockImplementation((label: string) => {
      labels.push(label);
      lineNo += 1;
      const text = `SAY: Line number ${lineNo} here.\nTHINK: Thought ${lineNo} about the guitar.`;
      return Promise.resolve({
        exchange: { label, request: { messages: [], maxResponseTokens: 120 }, responseText: text },
        text,
      });
    });
    tts = vi.spyOn(ctx.ai as unknown as { playTtsLines: () => void }, 'playTtsLines').mockImplementation(() => {});
    roundQueued = vi.spyOn(ctx.scenePlayback, 'roundQueued');
    continuations = vi.spyOn(ctx.generationQueue, 'runExclusive');
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

  it('plays the first event of a pair on a beat and answers the repeat NOOP with no actor call', async () => {
    const first = await post(sceneEvent('mixer_social_TellJoke', [CAT, JULIAN]));
    await settle();
    expect(first.status).toBe(InteractionEventStatus.GENERATED);
    const callsAfterFirst = actorCalls().length;
    expect(callsAfterFirst).toBeGreaterThan(0);
    const roundsAfterFirst = roundQueued.mock.calls.length;

    const second = await post(sceneEvent('mixer_social_TellJoke', [JULIAN, CAT]));
    await settle();
    expect(second.status).toBe(InteractionEventStatus.NOOP);
    expect(actorCalls().length).toBe(callsAfterFirst);
    expect(roundQueued.mock.calls.length).toBe(roundsAfterFirst);

    // The same pair on a DIFFERENT beat is not held
    const other = await post(sceneEvent('mixer_social_Compliment', [CAT, JULIAN]));
    await settle();
    expect(other.status).toBe(InteractionEventStatus.GENERATED);
    expect(actorCalls().length).toBeGreaterThan(callsAfterFirst);
  });

  it('runs a reaction as one silent thought for the actor: a monologue row, no scene, no voice; the repeat is NOOP', async () => {
    const before = actorCalls().length;
    const rounds = roundQueued.mock.calls.length;
    const voiced = tts.mock.calls.length;

    const result = await post(sceneEvent(WATCH, [CAT, ARLENE], { reaction: true }));
    await settle();
    expect(result.status).toBe(InteractionEventStatus.GENERATED);
    expect(result.memory?.event_type).toBe('monologue');
    expect(String(result.text)).toContain('Mittens Cat (thinking)');
    expect(String(result.text)).not.toContain('Arlene Zhang');
    // The actor alone, one call
    expect(actorCalls().slice(before)).toEqual(['Actor: Mittens Cat']);
    expect(roundQueued.mock.calls.length).toBe(rounds);
    expect(tts.mock.calls.length).toBe(voiced);

    // The same reaction again, even at another Sim: suppressed for the cooldown
    const again = await post(sceneEvent(WATCH, [CAT, JULIAN], { reaction: true }));
    await settle();
    expect(again.status).toBe(InteractionEventStatus.NOOP);
    expect(actorCalls().slice(before)).toEqual(['Actor: Mittens Cat']);
  });

  it('plays an event without the flag as a scene for the whole cast', async () => {
    const before = actorCalls().length;
    const result = await post(sceneEvent('mixer_social_Hug', [ARLENE, JULIAN]));
    await settle();
    expect(result.status).toBe(InteractionEventStatus.GENERATED);
    const cast = new Set(actorCalls().slice(before));
    expect(cast).toEqual(new Set(['Actor: Arlene Zhang', 'Actor: Julian Doe']));
  });

  it('gives a claim nobody prefetched, and a prefetch, the controller verdict', async () => {
    const before = actorCalls().length;
    // Held by the test above (ARLENE + JULIAN on mixer_social_Hug, seconds ago)
    const claim = await ctx.generationQueue.claim({
      correlation_id: 'repeat:claim',
      event: sceneEvent('mixer_social_Hug', [JULIAN, ARLENE]),
    });
    expect(claim.result.status).toBe(InteractionEventStatus.NOOP);
    expect(
      await ctx.generationQueue.prefetch({
        correlation_id: 'repeat:prefetch',
        event: sceneEvent('mixer_social_Hug', [ARLENE, JULIAN]),
      }),
    ).toEqual({ status: 'noop' });
    expect(actorCalls().length).toBe(before);
  });
});
