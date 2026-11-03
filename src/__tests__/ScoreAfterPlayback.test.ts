import { describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import { DirectedGenerationOptions } from 'main/sentient-sims/services/AIService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { NoopEmbeddingService } from 'main/sentient-sims/services/EmbeddingService';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { InteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { mockApiContext } from './util';

// Lever A of the player-reply latency work (2026-11-01): a reply to the player airs BEFORE
// its Scene Scores call answers, and the verdict (thread close, conversation action, row
// prices) is applied once both the audio is with the renderer and the scorer is back.
// Jaz's 10-29/30 streams had the scorer in series at 1.0 s median, 2.6-4.7 s worst.

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

const ALEX = makeSim('Alex Doe', '1');

function soloEvent(): InteractionEvent {
  return {
    event_id: 'event-1',
    event_type: SSEventType.INTERACTION,
    location_id: 5,
    environment: {
      location_id: 5,
      world_id: 0,
      time: { second: 0, minute: 0, hour: 20, day: 1, week: 0 },
    },
    sentient_sims: [ALEX],
    interaction_name: 'social_Chat',
  };
}

const PLAYER_LINE = { speaker: 'The Voice', text: 'What do you want out of life?' };

const SCORES = JSON.stringify({
  'Alex Doe': { memory: 5, action: 1, action_reason: '', unfinished: false, continue: 1, done: true },
});

// Let every pending microtask and immediate settle (the pipeline awaits mocked promises
// only; nothing in it waits on a timer)
async function flush() {
  for (let i = 0; i < 8; i += 1) {
    await new Promise((resolve) => {
      setImmediate(resolve);
    });
  }
}

function harness(sessionId: string, scoresText = SCORES) {
  const ctx: ApiContext = mockApiContext();
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
  ctx.db.loadDatabase({ sessionId, saveId: '1' });
  ctx.settings.set(SettingsEnum.SCENE_PIPELINE_MODE, 'lean');
  ctx.settings.set(SettingsEnum.GENERATED_DEFAULT_DESCRIPTIONS, false);
  vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());
  vi.spyOn(ctx.modelSettings, 'getModelSettings').mockResolvedValue({
    temperature: undefined,
    top_p: undefined,
    top_k: undefined,
    repetition_penalty: undefined,
    max_tokens: 5000,
  });

  // The scorer answers only when the test says so
  let resolveScores: () => void = () => {};
  const scoresAnswered = new Promise<void>((resolve) => {
    resolveScores = resolve;
  });
  const labels: string[] = [];
  vi.spyOn(ctx.ai, 'runOneShot').mockImplementation(async (label: string) => {
    labels.push(label);
    let text = 'SAY: Nothing much, honestly.\nTHINK: Why do they keep asking?';
    if (label === 'Scene Scores') {
      await scoresAnswered;
      text = scoresText;
    }
    return {
      exchange: { label, request: { messages: [], maxResponseTokens: 120 }, responseText: text },
      text,
    };
  });
  const playTts = vi.spyOn(ctx.ai, 'playTtsLines').mockImplementation(() => {});
  const roundQueued = vi.spyOn(ctx.scenePlayback, 'roundQueued');
  const generationFinished = vi.spyOn(ctx.scenePlayback, 'generationFinished');
  const record = vi.spyOn(ctx.playerConversations, 'record');
  const sceneId = () => roundQueued.mock.calls[0]?.[0];
  const threadKey = () => record.mock.calls[0]?.[0];
  const thread = () => ctx.playerConversations.get(threadKey());

  return { ctx, labels, resolveScores, playTts, generationFinished, record, sceneId, thread };
}

const REPLY: DirectedGenerationOptions = { action: 'chat', playerLine: PLAYER_LINE };

describe('a reply to the player airs before its scores', () => {
  it('hands the audio over while the scorer is still out, then closes the thread on the verdict', async () => {
    const h = harness('sap-1');
    const pending = h.ctx.ai.runDirectedGeneration(soloEvent(), REPLY);
    await flush();

    expect(h.playTts).toHaveBeenCalledTimes(1);
    expect(h.labels).toEqual(['Actor: Alex Doe', 'Scene Scores']);
    // The lines are on the thread, the verdict is not: the thread stays open
    expect(h.record.mock.calls.at(-1)?.[2]).toEqual({ landed: false });
    expect(h.thread()?.closed).toBeFalsy();

    h.resolveScores();
    const result = await pending;
    expect(result.status).toBe(InteractionEventStatus.GENERATED);
    expect(h.record.mock.calls.at(-1)?.[2]).toEqual({ landed: true });
    expect(h.thread()?.closedReason).toBe('landed');
    // The result still carries the scorer's exchange (the bench and the trace read it)
    expect(result.exchanges?.map((exchange) => exchange.label)).toEqual(['Actor: Alex Doe', 'Scene Scores']);
  });

  it('holds the scene open until the verdict, so a conversation action can be held before the scene closes', async () => {
    const h = harness('sap-2');
    const pending = h.ctx.ai.runDirectedGeneration(soloEvent(), REPLY);
    await flush();

    // The renderer finishes the reply before the scorer answers: the scene is still open
    h.ctx.scenePlayback.playbackEnded(h.sceneId(), true);
    expect(h.ctx.scenePlayback.size).toBe(1);
    expect(h.generationFinished).not.toHaveBeenCalled();

    h.resolveScores();
    await pending;
    expect(h.generationFinished).toHaveBeenCalledWith(h.sceneId());
    expect(h.ctx.scenePlayback.size).toBe(0);
  });

  it('drops the verdict when the game ends the scene while the scorer runs', async () => {
    const h = harness('sap-3');
    const pending = h.ctx.ai.runDirectedGeneration(soloEvent(), REPLY);
    await flush();

    h.ctx.scenePlayback.stop(h.sceneId(), 'walked_away', 'soft');
    h.resolveScores();
    await pending;

    expect(h.record.mock.calls.some((call) => call[2].landed)).toBe(false);
    expect(h.thread()?.closedReason).toBe('stopped');
    // The hold is released either way
    expect(h.generationFinished).toHaveBeenCalledWith(h.sceneId());
  });

  it('leaves the thread open when the scorer answers nonsense', async () => {
    const h = harness('sap-4', 'not json');
    const pending = h.ctx.ai.runDirectedGeneration(soloEvent(), REPLY);
    await flush();
    h.resolveScores();
    const result = await pending;

    expect(result.status).toBe(InteractionEventStatus.GENERATED);
    expect(h.record.mock.calls.at(-1)?.[2]).toEqual({ landed: false });
    expect(h.thread()?.closed).toBeFalsy();
    expect(h.generationFinished).toHaveBeenCalledWith(h.sceneId());
  });

  it('re-prices the rows stored at the heuristic once the scorer answers', async () => {
    const h = harness('sap-5');
    const pending = h.ctx.ai.runDirectedGeneration(soloEvent(), { ...REPLY, saveMemory: true });
    await flush();

    const rows = () =>
      h.ctx.memoryRepository.getMemories().map((memory) => ({
        type: memory.event_type,
        importance: h.ctx.memoryIndexRepository.getIndex(String(memory.id))?.importance,
      }));
    // Stored while the scorer was out: the type heuristic
    const before = rows();
    expect(before.find((row) => row.type === 'monologue')?.importance).toBe(3);
    expect(before.find((row) => row.type === SSEventType.INTERACTION)).toBeDefined();

    h.resolveScores();
    await pending;
    const after = rows();
    expect(after.find((row) => row.type === 'monologue')?.importance).toBe(5);
    expect(after.find((row) => row.type === SSEventType.INTERACTION)?.importance).toBe(5);
  });

  it('applies the verdict only once a deferred playback is claimed', async () => {
    const h = harness('sap-6');
    let play: (() => void) | undefined;
    const pending = h.ctx.ai.runDirectedGeneration(soloEvent(), REPLY, {
      deferPlayback: true,
      onPlaybackReady: (ready) => {
        play = ready;
      },
    });
    h.resolveScores();
    const result = await pending;

    expect(result.status).toBe(InteractionEventStatus.GENERATED);
    expect(play).toBeDefined();
    expect(h.playTts).not.toHaveBeenCalled();
    expect(h.record).not.toHaveBeenCalled();
    expect(h.generationFinished).not.toHaveBeenCalled();

    play?.();
    expect(h.playTts).toHaveBeenCalledTimes(1);
    expect(h.record.mock.calls.at(-1)?.[2]).toEqual({ landed: true });
    expect(h.generationFinished).toHaveBeenCalledTimes(1);
  });
});
