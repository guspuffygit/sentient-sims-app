import { describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import log from 'electron-log';
import { OneShotOptions } from 'main/sentient-sims/services/AIService';
import { SceneAbortedError } from 'main/sentient-sims/exceptions/SceneAbortedError';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { NoopEmbeddingService } from 'main/sentient-sims/services/EmbeddingService';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { InteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { mockApiContext } from './util';

function makeSim(name: string, simId: string): SentientSim {
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
    is_player_sim: false,
  };
}

function sceneEvent(): InteractionEvent {
  return {
    event_id: 'event-1',
    event_type: SSEventType.INTERACTION,
    location_id: 5,
    environment: {
      location_id: 5,
      world_id: 0,
      time: { second: 0, minute: 0, hour: 0, day: 0, week: 0 },
    },
    sentient_sims: [makeSim('Alex Doe', '1'), makeSim('Bella Goth', '2')],
    interaction_name: 'social_Chat',
  };
}

const ONE_ROUND = ['Director Briefing', 'Actor: Alex Doe', 'Actor: Bella Goth', 'Director Review', 'Scene Scores'];

const SCORES_WANTING_MORE = JSON.stringify({
  'Alex Doe': { memory: 5, action: 1, action_reason: '', unfinished: true, continue: 10 },
  'Bella Goth': { memory: 5, action: 1, action_reason: '', unfinished: true, continue: 10 },
});

// A scene whose scorer asks for another round after every round, so only the cap ends it.
// `stage` runs before each mocked call and may stop the scene or occupy the queue.
function sceneThatNeverLands(
  sessionId: string,
  sceneMaxRounds?: number,
  stage?: (label: string, options?: OneShotOptions) => void,
) {
  const ctx: ApiContext = mockApiContext();
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
  ctx.db.loadDatabase({ sessionId, saveId: '1' });
  if (sceneMaxRounds !== undefined) {
    ctx.settings.set(SettingsEnum.SCENE_MAX_ROUNDS, sceneMaxRounds);
  }
  // Default descriptions are written once per sim and location, outside the rounds
  ctx.settings.set(SettingsEnum.GENERATED_DEFAULT_DESCRIPTIONS, false);
  vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());
  vi.spyOn(ctx.modelSettings, 'getModelSettings').mockResolvedValue({
    temperature: undefined,
    top_p: undefined,
    top_k: undefined,
    repetition_penalty: undefined,
    max_tokens: 5000,
  });

  const labels: string[] = [];
  const calls: { label: string; options?: OneShotOptions }[] = [];
  vi.spyOn(ctx.ai, 'runOneShot').mockImplementation((label: string, ...rest) => {
    labels.push(label);
    const options = rest[6];
    calls.push({ label, options });
    if (options?.signal?.aborted) {
      return Promise.reject(new SceneAbortedError(label));
    }
    stage?.(label, options);
    let text = 'SAY: Tell me more.\nTHINK: I want to hear the rest.';
    if (label === 'Scene Scores') {
      text = SCORES_WANTING_MORE;
    } else if (label === 'Director Briefing' || label === 'Director Review') {
      text = '';
    }
    return Promise.resolve({
      exchange: { label, request: { messages: [], maxResponseTokens: 120 }, responseText: text },
      text,
    });
  });
  const continuations = vi.spyOn(ctx.generationQueue, 'runExclusive');

  const play = async () => {
    const result = await ctx.ai.runDirectedGeneration(sceneEvent(), { action: 'Alex Doe chats with Bella Goth.' });
    // Each round queues the next from inside its own run, so wait until no round is left
    let settled = 0;
    while (settled < continuations.mock.results.length) {
      const pending = continuations.mock.results.slice(settled).map((queued) => queued.value as Promise<unknown>);
      settled = continuations.mock.results.length;
      await Promise.allSettled(pending);
    }
    return result;
  };
  const rounds = () => labels.filter((label) => label === 'Scene Scores').length;

  return { ctx, play, rounds, labels, calls };
}

describe('the scene round cap', () => {
  it('stops a two-sim conversation at three rounds of five calls by default', async () => {
    const scene = sceneThatNeverLands('scene-round-cap-default');

    const result = await scene.play();

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(scene.rounds()).toBe(3);
    expect(scene.labels).toEqual([...ONE_ROUND, ...ONE_ROUND, ...ONE_ROUND]);
  });

  it('never continues a conversation when the cap is one round', async () => {
    const scene = sceneThatNeverLands('scene-round-cap-one', 1);

    await scene.play();

    expect(scene.labels).toEqual(ONE_ROUND);
  });

  it('lets a conversation run to the cap the player picked', async () => {
    const scene = sceneThatNeverLands('scene-round-cap-five', 5);

    await scene.play();

    expect(scene.rounds()).toBe(5);
  });
});

describe('a scene round and the game', () => {
  it('does not queue another round while an interaction is waiting on the queue', async () => {
    let release!: () => void;
    const scene = sceneThatNeverLands('scene-yields', undefined, (label) => {
      if (label !== 'Scene Scores') {
        return;
      }
      // The single slot is busy, so the interaction has to wait, as it did in the field
      void scene.ctx.generationQueue.runExclusive(
        () =>
          new Promise<void>((resolve) => {
            release = resolve;
          }),
      );
      void scene.ctx.generationQueue.runExclusive(() => Promise.resolve(), { blocking: true });
    });

    const played = scene.play();
    await vi.waitFor(() => {
      expect(scene.labels).toContain('Scene Scores');
    });
    release();
    await played;

    expect(scene.labels).toEqual(ONE_ROUND);
  });

  it('hands every round the stop signal of its scene', async () => {
    const scene = sceneThatNeverLands('scene-signal', 2);

    await scene.play();

    const firstRound = scene.calls.slice(0, ONE_ROUND.length);
    const secondRound = scene.calls.slice(ONE_ROUND.length);
    expect(firstRound.every((call) => call.options?.signal === undefined)).toBe(true);
    expect(secondRound.length).toBe(ONE_ROUND.length);
    expect(secondRound.every((call) => call.options?.signal instanceof AbortSignal)).toBe(true);
  });

  it('gives up a running round the moment an interaction has to wait behind it', async () => {
    const info = vi.spyOn(log, 'info');
    const warn = vi.spyOn(log, 'warn');
    let briefings = 0;
    let abortedOnEnqueue: boolean | undefined;
    const scene = sceneThatNeverLands('scene-yields-mid-round', undefined, (label, options) => {
      if (label !== 'Director Briefing') {
        return;
      }
      briefings += 1;
      if (briefings === 2) {
        void scene.ctx.generationQueue.runExclusive(() => Promise.resolve(), { blocking: true });
        abortedOnEnqueue = options?.signal?.aborted;
      }
    });

    await scene.play();

    expect(abortedOnEnqueue).toBe(true);
    expect(scene.labels).toEqual([...ONE_ROUND, 'Director Briefing']);
    expect(info.mock.calls.some(([message]) => String(message).includes('yielded to an interaction'))).toBe(true);
    expect(warn.mock.calls.some(([message]) => String(message).includes('Scene round'))).toBe(false);
  });

  it('drops a round the game stopped mid-request without reporting a failure', async () => {
    const warn = vi.spyOn(log, 'warn');
    let briefings = 0;
    let abortedOnStop: boolean | undefined;
    const scene = sceneThatNeverLands('scene-stopped-mid-request', undefined, (label, options) => {
      if (label !== 'Director Briefing') {
        return;
      }
      briefings += 1;
      if (briefings === 2) {
        scene.ctx.scenePlayback.stopAll('left_lot');
        abortedOnStop = options?.signal?.aborted;
      }
    });

    await scene.play();

    expect(abortedOnStop).toBe(true);
    expect(scene.labels).toEqual([...ONE_ROUND, 'Director Briefing']);
    expect(warn.mock.calls.some(([message]) => String(message).includes('Scene round'))).toBe(false);
  });
});
