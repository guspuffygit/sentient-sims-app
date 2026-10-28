import { describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import { OneShotOptions, DirectedGenerationOptions } from 'main/sentient-sims/services/AIService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { NoopEmbeddingService } from 'main/sentient-sims/services/EmbeddingService';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { InteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import {
  buildLeanActorSystemPrompt,
  LEAN_CONTINUATION_LINE,
  speechRules,
  stripOpener,
} from 'main/sentient-sims/pipeline/prompts/scene';
import { StageId } from 'main/sentient-sims/pipeline/stages';
import { mockApiContext } from './util';

// The lean voice pipeline (2026-10-27): one actor call per Sim per round, the beat carried
// into every round per Sim, fixed rounds, no director, no reviewer, scores only when the
// player is being answered. Series 3 of the voice-pipeline bench (mod repo,
// .claude/voice-pipeline-tests/RESULTS-LEAN-2026-10-27.md): +0.85/10 over the 4.6 pipeline
// at -66% tokens, the lie kept through round 3 in every sample.

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

function sceneEvent(interactionName = 'social_Chat', sims = [makeSim('Alex Doe', '1'), makeSim('Bella Goth', '2')]) {
  const event: InteractionEvent = {
    event_id: 'event-1',
    event_type: SSEventType.INTERACTION,
    location_id: 5,
    environment: {
      location_id: 5,
      world_id: 0,
      time: { second: 0, minute: 0, hour: 20, day: 1, week: 0 },
    },
    sentient_sims: sims,
    interaction_name: interactionName,
  };
  return event;
}

type Call = { label: string; system: string; user: string; options?: OneShotOptions };

function leanScene(sessionId: string, settings: Partial<Record<string, unknown>> = {}) {
  const ctx: ApiContext = mockApiContext();
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
  ctx.db.loadDatabase({ sessionId, saveId: '1' });
  ctx.settings.set(SettingsEnum.SCENE_PIPELINE_MODE, 'lean');
  ctx.settings.set(SettingsEnum.GENERATED_DEFAULT_DESCRIPTIONS, false);
  Object.entries(settings).forEach(([key, value]) => ctx.settings.set(key as SettingsEnum, value));
  vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());
  vi.spyOn(ctx.modelSettings, 'getModelSettings').mockResolvedValue({
    temperature: undefined,
    top_p: undefined,
    top_k: undefined,
    repetition_penalty: undefined,
    max_tokens: 5000,
  });

  const calls: Call[] = [];
  let lineNo = 0;
  vi.spyOn(ctx.ai, 'runOneShot').mockImplementation((label: string, ...rest) => {
    const system = rest[0];
    const user = rest[1];
    const options = rest[6];
    calls.push({ label, system, user, options });
    lineNo += 1;
    let text = `SAY: Line number ${lineNo} here.\nTHINK: Thought ${lineNo}.`;
    if (label === 'Scene Scores') {
      text = JSON.stringify({
        'Alex Doe': { memory: 5, action: 1, action_reason: '', unfinished: false, continue: 1, done: true },
      });
    }
    return Promise.resolve({
      exchange: { label, request: { messages: [], maxResponseTokens: 120 }, responseText: text },
      text,
    });
  });
  const continuations = vi.spyOn(ctx.generationQueue, 'runExclusive');

  const play = async (event: InteractionEvent, options: DirectedGenerationOptions) => {
    const result = await ctx.ai.runDirectedGeneration(event, options);
    let settled = 0;
    while (settled < continuations.mock.results.length) {
      const pending = continuations.mock.results.slice(settled).map((queued) => queued.value as Promise<unknown>);
      settled = continuations.mock.results.length;
      await Promise.allSettled(pending);
    }
    return result;
  };
  return { ctx, calls, play };
}

const OPENER = 'Open the scene:';

describe('lean voice pipeline', () => {
  it('(a) runs N actor calls per round and never a director, reviewer or scorer', async () => {
    const { calls, play } = leanScene('lean-a');
    await play(sceneEvent(), { action: 'Alex Doe chats with Bella Goth.' });
    const labels = calls.map((call) => call.label);
    expect(labels).toEqual([
      'Actor: Alex Doe',
      'Actor: Bella Goth',
      'Actor: Alex Doe',
      'Actor: Bella Goth',
      'Actor: Alex Doe',
      'Actor: Bella Goth',
    ]);
    expect(labels).not.toContain('Director Briefing');
    expect(labels).not.toContain('Director Review');
    expect(labels).not.toContain('Scene Scores');
    // The purpose tag keeps the Grafana bucket
    expect(calls.every((call) => call.options?.stageId === StageId.BROCA_SPEECH)).toBe(true);
  });

  it('(b) carries each Sim their OWN beat into round 2, opener removed: the liar keeps the lie, the dupe the cover', async () => {
    const { calls, play } = leanScene('lean-b');
    await play(sceneEvent('mixer_social_LieAboutCareer'), {
      action: 'Alex Doe is telling Bella Goth a false story about their career.',
    });
    const round1 = calls.slice(0, 2);
    const round2 = calls.slice(2, 4);
    // Round 1: today's text, the opener on, the deception split
    expect(round1[0].user).toContain(OPENER);
    expect(round1[0].user).toContain('makes the story up out loud');
    expect(round1[1].user).toContain('Alex Doe is telling Bella Goth how work is going.');
    expect(round1[1].user).not.toContain('false');
    // Round 2: "This scene:" + the same per-Sim beat, no opener, then the continuation line
    expect(round2[0].user).toContain('This scene: Alex Doe is telling Bella Goth a false story about their career.');
    expect(round2[0].user).toContain('does not know it is false');
    expect(round2[0].user).toContain(LEAN_CONTINUATION_LINE);
    expect(round2[0].user).not.toContain(OPENER);
    expect(round2[1].user).toContain('This scene: Alex Doe is telling Bella Goth how work is going.');
    expect(round2[1].user).not.toContain('false');
    expect(round2[1].user).not.toContain(OPENER);
    expect(round2[1].user).toContain(LEAN_CONTINUATION_LINE);
  });

  it("(c) round 2 history is round 1's lines only, and round 3's is rounds 1-2", async () => {
    const { calls, play } = leanScene('lean-c');
    await play(sceneEvent(), { action: 'Alex Doe chats with Bella Goth.' });
    const round2 = calls[2].user;
    const previously = round2.split('Previously in this scene:\n')[1].split('\n\nThis scene:')[0];
    expect(previously.split('\n')).toEqual(['Alex Doe: Line number 1 here.', 'Bella Goth: Line number 2 here.']);
    const round3 = calls[4].user;
    const previously3 = round3.split('Previously in this scene:\n')[1].split('\n\nThis scene:')[0];
    expect(previously3.split('\n')).toHaveLength(4);
    // The second actor of a round sees the first's line under "The conversation so far"
    expect(calls[3].user).toContain('The conversation so far:\nAlex Doe: Line number 3 here.');
  });

  it("(c2) every actor message ends with that Sim's turn, after the other Sim's lines", async () => {
    const { calls, play } = leanScene('lean-c2');
    await play(sceneEvent(), { action: 'Alex Doe chats with Bella Goth.' });
    expect(calls[0].user.endsWith('\n\nNow respond as Alex Doe.')).toBe(true);
    expect(calls[3].user.endsWith('Alex Doe: Line number 3 here.\n\nNow respond as Bella Goth.')).toBe(true);
  });

  it("(d) a Sim's system prompt is identical across rounds; name-free rules share one prefix across Sims", async () => {
    const { calls, play } = leanScene('lean-d', { [SettingsEnum.LEAN_NAME_FREE_RULES]: true });
    await play(sceneEvent(), { action: 'Alex Doe chats with Bella Goth.' });
    expect(calls[0].system).toBe(calls[2].system);
    expect(calls[2].system).toBe(calls[4].system);
    expect(calls[1].system).toBe(calls[3].system);
    const rules = speechRules('pair', { lean: true });
    expect(calls[0].system.startsWith(rules)).toBe(true);
    expect(calls[1].system.startsWith(rules)).toBe(true);
    expect(rules).not.toContain('Alex Doe');
    expect(rules).toContain('Stay in character at all times.');
    expect(rules).toContain('in the tone of the scene');
    expect(rules).not.toContain('your director');
    // Identity follows the rules; the now-block heads the USER message, not the system prompt
    expect(calls[0].system).toContain('You are Alex Doe.');
    expect(calls[0].system).not.toContain('<DATE>');
    expect(calls[0].user.indexOf('<DATE>')).toBe(0);
  });

  it('(d2) named rules interpolate the Sim and still keep the lean tone wording', async () => {
    const { calls, play } = leanScene('lean-d2', { [SettingsEnum.LEAN_NAME_FREE_RULES]: false });
    await play(sceneEvent(), { action: 'Alex Doe chats with Bella Goth.' });
    expect(calls[0].system.startsWith(speechRules('pair', { simName: 'Alex Doe', lean: true }))).toBe(true);
    expect(calls[0].system).toContain('Stay in character as Alex Doe at all times.');
    expect(calls[0].system).toContain('in the tone of the scene');
  });

  it('(e) a player-facing round runs Scene Scores once and records the verdict on the thread', async () => {
    const { ctx, calls, play } = leanScene('lean-e');
    const record = vi.spyOn(ctx.playerConversations, 'record');
    await play(sceneEvent('social_Chat', [makeSim('Alex Doe', '1')]), {
      action: 'chat',
      playerLine: { speaker: 'The Voice', text: 'What do you want out of life?' },
    });
    expect(calls.map((call) => call.label)).toEqual(['Actor: Alex Doe', 'Scene Scores']);
    expect(calls[0].user).toContain('The Voice just said');
    // The scorer's "The scene:" input is the beat, there being no director's shared scene
    expect(calls[1].user).toContain('The Voice just said');
    expect(record).toHaveBeenCalled();
    expect(record.mock.calls.at(-1)?.[2]).toEqual({ landed: true });
  });

  it('(f) fixed rounds stop at sceneMaxRounds, and the other guards still hold', async () => {
    const capped = leanScene('lean-f1', { [SettingsEnum.SCENE_MAX_ROUNDS]: 2 });
    await capped.play(sceneEvent(), { action: 'Alex Doe chats with Bella Goth.' });
    expect(capped.calls).toHaveLength(4);

    // partnerless: a lone sim answering the player waits for the player
    const partnerless = leanScene('lean-f2');
    await partnerless.play(sceneEvent('social_Chat', [makeSim('Alex Doe', '1')]), {
      action: 'chat',
      playerLine: { speaker: 'The Voice', text: 'Hello?' },
    });
    expect(partnerless.calls.filter((call) => call.label.startsWith('Actor:'))).toHaveLength(1);

    // gameWaiting: an interaction the game is blocked on takes the queue
    const waiting = leanScene('lean-f3');
    vi.spyOn(waiting.ctx.generationQueue, 'hasBlockedRequestWaiting').mockReturnValue(true);
    await waiting.play(sceneEvent(), { action: 'Alex Doe chats with Bella Goth.' });
    expect(waiting.calls).toHaveLength(2);
  });

  it('(g) a solo beat is one THINK call and no scores', async () => {
    const { calls, play } = leanScene('lean-g');
    await play(sceneEvent('sim_Cloudgaze', [makeSim('Alex Doe', '1')]), { action: 'Alex Doe gazes at the clouds.' });
    expect(calls.map((call) => call.label)).toEqual(['Actor: Alex Doe']);
    expect(calls[0].system).toContain('exactly one line');
    expect(calls[0].system).toContain('THINK:');
    expect(calls[0].system).not.toContain('SAY:');
  });

  it('(h) full mode brings the four stages back', async () => {
    const { calls, play } = leanScene('lean-h', { [SettingsEnum.SCENE_PIPELINE_MODE]: 'full' });
    await play(sceneEvent(), { action: 'Alex Doe chats with Bella Goth.' });
    expect(calls.slice(0, 5).map((call) => call.label)).toEqual([
      'Director Briefing',
      'Actor: Alex Doe',
      'Actor: Bella Goth',
      'Director Review',
      'Scene Scores',
    ]);
  });

  // Lean runs no scorer, so a monologue row would otherwise land with importance NULL and
  // wait on the idle-lane annotator, which never gets a quiet slot while cognition ticks
  // (3 of 34 rows rated in 12 min live, 2026-10-27). The type heuristic is stamped at
  // creation instead; the annotator keeps a numeric stamp as final
  // (DirectedSceneMonologue.test.ts pins that), so this IS the row's rating.
  it('(i) monologue rows carry the heuristic importance at creation; a real score still wins', async () => {
    const monologueImportances = (ctx: ApiContext) =>
      ctx.memoryRepository
        .getMemories()
        .filter((memory) => memory.event_type === 'monologue')
        .map((memory) => {
          const index = ctx.memoryIndexRepository.getIndex(String(memory.id));
          return [String(index?.owner_participant_id), index?.importance];
        });

    const pair = leanScene('lean-i1');
    await pair.play(sceneEvent(), { action: 'Alex Doe chats with Bella Goth.' });
    const pairRows = monologueImportances(pair.ctx);
    expect(pairRows.length).toBeGreaterThan(0);
    expect(pairRows.every(([, importance]) => importance === 3)).toBe(true);

    // A solo beat stores its "(thinking)" row with the same stamp (the floor only applies
    // to a real low score, so an unscored thought is still storable)
    const solo = leanScene('lean-i2');
    await solo.play(sceneEvent('sim_Cloudgaze', [makeSim('Alex Doe', '1')]), {
      action: 'Alex Doe gazes at the clouds.',
      saveMemory: true,
    });
    const soloRows = monologueImportances(solo.ctx);
    expect(soloRows).toHaveLength(1);
    expect(soloRows[0][1]).toEqual(3);

    // Full mode: the scorer's memory score lands instead. The helper's mock rates only
    // Alex Doe (sim 1) at 5; Bella Goth (sim 2) is unscored and gets the heuristic
    const full = leanScene('lean-i3', { [SettingsEnum.SCENE_PIPELINE_MODE]: 'full' });
    await full.play(sceneEvent(), { action: 'Alex Doe chats with Bella Goth.' });
    const fullRows = monologueImportances(full.ctx);
    expect(fullRows.find(([owner]) => owner === '1')?.[1]).toEqual(5);
    expect(fullRows.find(([owner]) => owner === '2')?.[1]).toEqual(3);
  });
});

describe('lean prompt helpers', () => {
  it('strips both opener sentences and nothing else', () => {
    const beat =
      'Alex chats with Bella. Open the scene: the characters are just starting this conversation — the first line begins it, nothing was said before. This is a HOSTILE beat: it lands as genuinely unfriendly, hurtful or angry — never warm, never a joke between friends.';
    expect(stripOpener(beat)).toBe(
      'Alex chats with Bella. This is a HOSTILE beat: it lands as genuinely unfriendly, hurtful or angry — never warm, never a joke between friends.',
    );
    expect(stripOpener('Plain beat.')).toBe('Plain beat.');
  });

  it('lays the system prompt out rules, identity, place, facts, status', () => {
    const prompt = buildLeanActorSystemPrompt({
      simName: 'Mara Vale',
      characterBlock: '<CHARACTER_IN_INTERACTION>\nMara Vale is a female adult.\n</CHARACTER_IN_INTERACTION>',
      locationBlock: '<LOCATION>\nHome\n</LOCATION>',
      factsBlock: '<KNOWN_FACTS>\nMara Vale has no job.\n</KNOWN_FACTS>',
      statusBlock: '<STATUS>\nhungry\n</STATUS>',
      playerFacing: true,
      monologueOnly: false,
      nameFreeRules: true,
    });
    const order = ['How to respond', 'You are Mara Vale.', '<LOCATION>', '<KNOWN_FACTS>', '<STATUS>'].map(
      (marker) => prompt.indexOf(marker),
    );
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // Not player-facing: no status, even when handed one
    expect(
      buildLeanActorSystemPrompt({
        simName: 'Mara Vale',
        characterBlock: '',
        locationBlock: '',
        statusBlock: '<STATUS>\nhungry\n</STATUS>',
        monologueOnly: false,
      }),
    ).not.toContain('<STATUS>');
  });
});
