import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { NoopEmbeddingService } from 'main/sentient-sims/services/EmbeddingService';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { SSEventType, WWEventType, WWInteractionEvent } from 'main/sentient-sims/models/InteractionEvents';
import { SimStateReport } from 'main/sentient-sims/models/SimStateReport';
import { AIActionType } from 'main/sentient-sims/models/AIActionType';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { INTIMATE_SCENE_FRAMING, INTIMATE_SOLO_FRAMING } from 'main/sentient-sims/util/intimateScene';
import { ElevenLabsSpeechModel } from 'main/sentient-sims/models/ElevenLabsTTSSettings';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { patterLine, patterUsedWords, speechRuleKind, speechRules } from 'main/sentient-sims/pipeline/prompts/scene';
import { mockApiContext } from './util';

// WickedWhims events run through the directed pipeline (director, actors, reviewer,
// scores) with the sexual-act rules on top: performers only, no facts, the output guard
// over every line and thought, and no continuation rounds.
function makeSim(name: string, simId: string, extra: Partial<SentientSim> = {}): SentientSim {
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
    ...extra,
  };
}

const MARGO = makeSim('Margo Calloway', '1', { is_player_sim: true });
const DESMOND = makeSim('Desmond Calloway', '2');

function wwEvent(type: WWEventType, sims: SentientSim[] = [MARGO, DESMOND]): WWInteractionEvent {
  return {
    event_id: 'ww-1',
    event_type: SSEventType.WICKED_WHIMS,
    location_id: 5,
    environment: {
      location_id: 5,
      world_id: 0,
      time: { second: 0, minute: 0, hour: 0, day: 0, week: 0 },
    },
    sentient_sims: sims,
    sex_category: 0,
    sex_location: 0,
    animation_author: 'Author',
    animation_name: 'Slow Dance Of Love',
    animation_identifier: 'anim_1',
    ww_event_type: type,
  };
}

// Every round asks for another, so only the no-continuation rule can end it at one
const SCORES = JSON.stringify({
  'Margo Calloway': { memory: 6, action: 1, action_reason: '', unfinished: true, continue: 10 },
  'Desmond Calloway': { memory: 6, action: 1, action_reason: '', unfinished: true, continue: 10 },
});

type Stage = {
  actorText?: (label: string) => string;
  // The animation has no mapping text
  unmapped?: boolean;
  // The player's Enable Animation Mapping setting
  mappingOn?: boolean;
};

function wwContext(sessionId: string, stage: Stage = {}) {
  const ctx: ApiContext = mockApiContext();
  // These tests mock the 4.6 pipeline by stage label; the default is lean (2026-10-27)
  ctx.settings.set(SettingsEnum.SCENE_PIPELINE_MODE, 'full');
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
  ctx.db.loadDatabase({ sessionId, saveId: '1' });
  ctx.settings.set(SettingsEnum.GENERATED_DEFAULT_DESCRIPTIONS, false);
  vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());
  vi.spyOn(ctx.modelSettings, 'getModelSettings').mockResolvedValue({
    temperature: undefined,
    top_p: undefined,
    top_k: undefined,
    repetition_penalty: undefined,
    max_tokens: 5000,
  });
  vi.spyOn(ctx.animations, 'isNsfwEnabled').mockReturnValue(true);
  vi.spyOn(ctx.animations, 'getAnimation').mockResolvedValue(
    stage.unmapped
      ? undefined
      : {
          author: 'Author',
          name: 'Slow Dance Of Love',
          act: '{actor.0} and {actor.1} are making love.',
        },
  );
  vi.spyOn(ctx.animations, 'isAnimationMappingEnabled').mockReturnValue(stage.mappingOn ?? false);
  // A toddler on the lot: anyone the report names outside the act must never be named in it
  vi.spyOn(ctx.simStateCache, 'getReport').mockReturnValue({
    type: 'state_report',
    seq: 1,
    sims: [{ sim_id: '9', sim_name: 'Elliot Jr Chatman', sims: [] }],
  } as unknown as SimStateReport);

  const calls: { label: string; systemPrompt: string; userText: string; interaction?: AIActionType }[] = [];
  vi.spyOn(ctx.ai, 'runOneShot').mockImplementation(
    (label: string, systemPrompt: string, userText: string, ...rest) => {
      calls.push({ label, systemPrompt, userText, interaction: rest[3] });
      let text = stage.actorText?.(label) ?? 'SAY: Come here.\nTHINK: I have missed this.';
      if (label === 'Scene Scores') {
        text = SCORES;
      } else if (label === 'Director Briefing' || label === 'Director Review') {
        text = '';
      }
      return Promise.resolve({
        exchange: { label, request: { messages: [], maxResponseTokens: 120 }, responseText: text },
        text,
      });
    },
  );
  const classic = vi.spyOn(ctx.ai, 'runGeneration');
  const voiced = vi.spyOn(ctx.ai, 'playTtsLines').mockReturnValue(undefined);
  const recalled = vi.spyOn(ctx.semanticMemory, 'recall');
  const continued = vi.spyOn(ctx.generationQueue, 'runExclusive');
  const labels = () => calls.map((call) => call.label);

  return { ctx, calls, labels, classic, voiced, recalled, continued };
}

const ONE_ROUND = [
  'Director Briefing',
  'Actor: Margo Calloway',
  'Actor: Desmond Calloway',
  'Director Review',
  'Scene Scores',
];

describe('a WickedWhims scene', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs the directed pipeline, never the classic one', async () => {
    const scene = wwContext('ww-directed-pipeline');

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(scene.classic).not.toHaveBeenCalled();
    expect(scene.labels()).toEqual(ONE_ROUND);
    const speakers = scene.voiced.mock.calls.flatMap(([lines]) => lines.map((line) => line.speaker));
    expect(speakers).toEqual(['Margo Calloway', 'Desmond Calloway']);
  });

  it('remembers the act as a WickedWhims row named for its animation', async () => {
    const scene = wwContext('ww-directed-memory');

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(result.memory?.event_type).toBe(SSEventType.WICKED_WHIMS);
    expect(result.memory?.interaction_name).toBe('Slow Dance Of Love');
    expect(result.memory?.content).toContain('Margo Calloway and Desmond Calloway are making love.');
  });

  it('never continues on its own, even when the scorer asks for another round', async () => {
    const scene = wwContext('ww-directed-no-continue');

    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(scene.continued).not.toHaveBeenCalled();
    expect(scene.labels()).toEqual(ONE_ROUND);
  });

  it('frames the beat as an adult scene and fills in the sex category', async () => {
    const scene = wwContext('ww-directed-framing');

    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.STARTING));

    const actor = scene.calls.find((call) => call.label === 'Actor: Margo Calloway');
    // Once: it used to be appended a second time after the deception block
    expect(actor?.userText.split(INTIMATE_SCENE_FRAMING)).toHaveLength(2);
    expect(actor?.userText).toContain('foreplay');
    expect(actor?.userText).not.toContain('{sex_category}');
  });

  it('gives the actors no facts', async () => {
    const scene = wwContext('ww-directed-no-facts');

    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(scene.recalled).not.toHaveBeenCalled();
    const actor = scene.calls.find((call) => call.label === 'Actor: Margo Calloway');
    expect(actor?.systemPrompt).not.toContain('<KNOWN_FACTS>');
  });

  it('throws the scene away when a line names someone outside the act', async () => {
    const scene = wwContext('ww-directed-outside-name', {
      actorText: (label) =>
        label === 'Actor: Desmond Calloway'
          ? 'SAY: Shh, Elliot Jr is asleep.\nTHINK: Quiet now.'
          : 'SAY: Come here.\nTHINK: I have missed this.',
    });

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(result.status).toEqual(InteractionEventStatus.NOOP);
    expect(result.memory).toBeUndefined();
    expect(scene.voiced).not.toHaveBeenCalled();
  });

  it('throws the scene away when a private thought names someone outside the act', async () => {
    const scene = wwContext('ww-directed-outside-thought', {
      actorText: (label) =>
        label === 'Actor: Margo Calloway'
          ? 'SAY: Come here.\nTHINK: I hope Elliot Jr stays asleep.'
          : 'SAY: Come here.\nTHINK: I have missed this.',
    });

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(result.status).toEqual(InteractionEventStatus.NOOP);
    expect(scene.voiced).not.toHaveBeenCalled();
  });

  it('throws the scene away when an actor refuses', async () => {
    const scene = wwContext('ww-directed-refusal', {
      actorText: (label) =>
        label === 'Actor: Desmond Calloway'
          ? "SAY: I can't help with that.\nTHINK: No."
          : 'SAY: Come here.\nTHINK: I have missed this.',
    });

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(result.status).toEqual(InteractionEventStatus.NOOP);
    expect(scene.voiced).not.toHaveBeenCalled();
  });

  it('plays a solo act as a thought aloud and guards that thought too', async () => {
    const solo = wwContext('ww-directed-solo');
    const kept = await solo.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE, [MARGO]));
    expect(kept.status).toEqual(InteractionEventStatus.GENERATED);
    expect(kept.memory?.interaction_name).toBe('Slow Dance Of Love');
    expect(solo.voiced.mock.calls[0][0][0].speaker).toBe('Margo Calloway (to self)');
    vi.restoreAllMocks();

    const guarded = wwContext('ww-directed-solo-guard', {
      actorText: () => 'THINK: I hope Elliot Jr stays asleep.',
    });
    const dropped = await guarded.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE, [MARGO]));
    expect(dropped.status).toEqual(InteractionEventStatus.NOOP);
    expect(guarded.voiced).not.toHaveBeenCalled();
  });

  it('frames a solo walk-up as one Sim alone: no partnered act, no conversation', async () => {
    const solo = leanWw('ww-directed-solo-walk-up', 'kokoro', { actorText: () => 'THINK: Finally some quiet.' });
    // WickedWhims files a solo animation under a partnered category (1 = handjob)
    await solo.ctx.ai.interactionEvent({ ...wwEvent(WWEventType.STARTING, [MARGO]), sex_category: 1 });

    const [actor] = solo.calls;
    expect(actor.userText).toContain('Margo Calloway is walking to start pleasuring themselves');
    expect(actor.userText).not.toContain('handjob');
    expect(actor.userText).toContain(INTIMATE_SOLO_FRAMING);
    expect(actor.userText).not.toContain('talk to each other');
    expect(actor.userText).not.toContain('Open the scene');
    // nor the day and the weather, which every solo thought otherwise turns to
    expect(actor.systemPrompt).not.toContain('<DATE>');

    // Two Sims keep the walk-up and the framing they had
    const pair = leanWw('ww-directed-pair-walk-up', 'kokoro');
    await pair.ctx.ai.interactionEvent({ ...wwEvent(WWEventType.STARTING), sex_category: 1 });
    expect(pair.calls[0].userText).toContain("is taking Desmond Calloway's hand");
    expect(pair.calls[0].userText).toContain(INTIMATE_SCENE_FRAMING);
    expect(pair.calls[0].systemPrompt).toContain('<DATE>');
  });

  it('plays an unmapped animation from its act and place, through the Wicked Whims provider', async () => {
    const scene = wwContext('ww-directed-unmapped', { unmapped: true });
    const event = { ...wwEvent(WWEventType.ACTIVE), sex_category: 4, sex_location: 1 };

    const result = await scene.ctx.ai.interactionEvent(event);

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(result.memory?.content).toContain('Margo Calloway and Desmond Calloway are having sex on the floor.');
    expect(result.unmapped_animation).toBeUndefined();
    expect(scene.labels()).toEqual(ONE_ROUND);
    expect(scene.calls.every((call) => call.interaction === AIActionType.WICKED_WHIMS)).toBe(true);
  });

  it('asks the mod for the mapping notice when the player maps animations', async () => {
    const scene = wwContext('ww-directed-unmapped-notice', { unmapped: true, mappingOn: true });

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(result.unmapped_animation).toBe(true);
  });

  it('plays an unmapped solo animation as the Sim alone', async () => {
    const scene = wwContext('ww-directed-unmapped-solo', { unmapped: true });

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE, [MARGO]));

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(result.memory?.action).toBe('Margo Calloway is pleasuring themselves.');
  });

  it('does nothing without a player sim', async () => {
    const scene = wwContext('ww-directed-no-player');

    const result = await scene.ctx.ai.interactionEvent(
      wwEvent(WWEventType.ACTIVE, [makeSim('Ana Lee', '3'), makeSim('Bo Lee', '4')]),
    );

    expect(result.status).toEqual(InteractionEventStatus.NOOP);
    expect(scene.calls).toHaveLength(0);
  });
});

describe('the Wicked Whims provider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function withConfigs(sessionId: string) {
    const ctx: ApiContext = mockApiContext();
    // These tests mock the 4.6 pipeline by stage label; the default is lean (2026-10-27)
    ctx.settings.set(SettingsEnum.SCENE_PIPELINE_MODE, 'full');
    // These tests mock the 4.6 pipeline by stage label; the default is lean (2026-10-27)
    ctx.settings.set(SettingsEnum.SCENE_PIPELINE_MODE, 'full');
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId, saveId: '1' });
    ctx.settings.set(SettingsEnum.AI_PROVIDER_CONFIGS, [
      { id: 'uncensored', name: 'Uncensored', apiType: ApiType.OpenRouter, model: 'x' },
      { id: 'openai', name: 'OpenAI', apiType: ApiType.OpenAI, model: 'gpt' },
    ]);
    return ctx;
  }

  it('covers every stage of a WickedWhims scene, ahead of a stage pick', () => {
    const ctx = withConfigs('ww-provider-wins');
    ctx.settings.set(SettingsEnum.AI_ACTION_PROVIDER_OVERRIDES, {
      [AIActionType.WICKED_WHIMS]: 'uncensored',
      [AIActionType.DIRECTED_SCENE_ACTOR]: 'openai',
    });

    const ww = ctx.providerConfigs.getConfigForDirectedStage(
      AIActionType.DIRECTED_SCENE_ACTOR,
      AIActionType.WICKED_WHIMS,
    );
    const chat = ctx.providerConfigs.getConfigForDirectedStage(
      AIActionType.DIRECTED_SCENE_ACTOR,
      AIActionType.INTERACTION,
    );

    expect(ww.id).toBe('uncensored');
    expect(chat.id).toBe('openai');
  });

  it('closes the NSFW gate when a WickedWhims scene stage would run on OpenAI', () => {
    const ctx = withConfigs('ww-provider-gate');
    ctx.settings.nsfwEnabled = false;
    ctx.settings.set(SettingsEnum.AI_ACTION_PROVIDER_OVERRIDES, {
      [AIActionType.DIRECTED_SCENE_REVIEWER]: 'openai',
    });

    expect(ctx.animations.isNsfwEnabled()).toBe(false);

    ctx.settings.set(SettingsEnum.AI_ACTION_PROVIDER_OVERRIDES, {
      [AIActionType.WICKED_WHIMS]: 'uncensored',
      [AIActionType.DIRECTED_SCENE_REVIEWER]: 'openai',
    });

    expect(ctx.animations.isNsfwEnabled()).toBe(true);
  });
});

// On the lean pipeline a WickedWhims act answers in sounds first: mostly sounds in square
// brackets, a few words between (setting wwVoiceTags, on by default)
const INTIMATE_RULES_NAME_FREE = `How to respond — exactly two lines, in this format:
SAY: <the sounds and the few words out of your character's mouth right now>
THINK: <one short line of your character's private thought>

Rules for SAY:
- Stay in character at all times.
- This is sex, not a conversation. Mostly sounds, in square brackets, invented for the moment: [moans], [breathless], [gasps], [soft laugh], [whispers]. Between them a few words at most: a name, a yes, a want, a reaction to what is happening right now.
- Explicit when it fits them; blunt is blunt, shy is shy. Never a speech, never romance-card lines.
- No narration, no name tag, no quotation marks. Never repeat the last line; react to it.

Rules for THINK:
- First person, present tense, one short line. No physical actions.`;

function leanWw(sessionId: string, voice: 'v4' | 'kokoro', stage: Stage = {}) {
  const scene = wwContext(sessionId, stage);
  scene.ctx.settings.set(SettingsEnum.SCENE_PIPELINE_MODE, 'lean');
  scene.ctx.settings.ttsEnabled = true;
  if (voice === 'v4') {
    scene.ctx.settings.ttsApiType = ApiType.ElevenLabs;
    scene.ctx.settings.elevenLabsTtsSettings = {
      ...scene.ctx.settings.elevenLabsTtsSettings,
      model: ElevenLabsSpeechModel.ELEVEN_V4,
    };
  } else {
    scene.ctx.settings.ttsApiType = ApiType.Kokoro;
  }
  return scene;
}

const voicedLines = (scene: ReturnType<typeof wwContext>): DialogueLine[] =>
  scene.voiced.mock.calls.flatMap(([lines]) => lines);

describe('a WickedWhims act on the lean pipeline', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the tested wording byte for byte', () => {
    expect(speechRules('intimate', { lean: true })).toEqual(INTIMATE_RULES_NAME_FREE);
    expect(speechRules('intimate', { simName: 'Margo Calloway', lean: true })).toContain(
      '- Stay in character as Margo Calloway at all times.',
    );
  });

  it('gives a solo act its own rules: the same shape, said to nobody', () => {
    const solo = speechRules('intimateSolo', { lean: true });
    expect(speechRuleKind(false, false, true, true)).toBe('intimateSolo');
    // A solo act with the sounds-first setting off is not this kind (it stays a thought)
    expect(speechRuleKind(false, false, false, true)).toBe('pair');
    // The tested rules with three edits and nothing else
    expect(solo).toEqual(
      INTIMATE_RULES_NAME_FREE.replace(
        'This is sex, not a conversation.',
        'This is a solo sex scene, not a conversation.',
      )
        .replace('a few words at most: a name, a yes,', 'a few words at most, said to yourself: a yes,')
        .replace('Never repeat the last line; react to it.', 'Never repeat your last line.'),
    );
    expect(INTIMATE_SOLO_FRAMING).toEqual(
      'This is an intimate adult scene of one adult: the character talks to themself during it, explicit and uninhibited when the moment calls for it, true to their personality and mood.',
    );
    // The patter line loses "(names are fine)" and nothing else
    expect(patterLine(['oh'], true)).toEqual(patterLine(['oh']).replace(' (names are fine)', ''));
    expect(patterLine([], true)).toEqual(patterLine([]));
  });

  it('is the intimate kind only for a performer who speaks', () => {
    expect(speechRuleKind(false, false, true)).toBe('intimate');
    expect(speechRuleKind(false, true, true)).toBe('monologue');
    expect(speechRuleKind(false, false)).toBe('pair');
  });

  it('opens the actor prompt with the sounds-first rules, not the pair rules', async () => {
    const scene = leanWw('ww-lean-rules', 'v4');
    scene.ctx.settings.set(SettingsEnum.LEAN_NAME_FREE_RULES, true);

    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(scene.labels()).toEqual(['Actor: Margo Calloway', 'Actor: Desmond Calloway']);
    const actor = scene.calls.find((call) => call.label === 'Actor: Margo Calloway');
    expect(actor?.systemPrompt.startsWith(INTIMATE_RULES_NAME_FREE)).toBe(true);
    expect(actor?.systemPrompt).not.toContain('no delivery notes');
  });

  it('says the framing sentence once', async () => {
    const scene = leanWw('ww-lean-framing-once', 'v4');

    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.STARTING));

    const actor = scene.calls.find((call) => call.label === 'Actor: Margo Calloway');
    expect(actor?.userText.split(INTIMATE_SCENE_FRAMING)).toHaveLength(2);
  });

  it('shows and stores the words, and keeps the sounds for the voice', async () => {
    const scene = leanWw('ww-lean-tagged-line', 'v4', {
      actorText: (label) =>
        label === 'Actor: Margo Calloway'
          ? 'SAY: [moans] Desmond... [gasps]\nTHINK: Finally.'
          : 'SAY: Come here.\nTHINK: I have missed this.',
    });

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    const margo = voicedLines(scene).find((line) => line.speaker === 'Margo Calloway');
    expect(margo?.text).toEqual('Desmond...');
    expect(margo?.ttsText).toEqual('[moans] Desmond... [gasps]');
    expect(margo?.voiceOnly).toBeUndefined();
    expect(result.memory?.content).toContain('Margo Calloway: Desmond...');
    expect(result.memory?.content).not.toContain('[');
  });

  it('voices a line of sounds alone with no subtitle and no memory text on a voice that reads tags', async () => {
    const scene = leanWw('ww-lean-sounds-only-v4', 'v4', {
      actorText: (label) =>
        label === 'Actor: Margo Calloway'
          ? 'SAY: [moans] [gasps]\nTHINK: Finally.'
          : 'SAY: Come here.\nTHINK: I have missed this.',
    });

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    const margo = voicedLines(scene).find((line) => line.speaker === 'Margo Calloway');
    expect(margo).toMatchObject({ text: '', voiceOnly: true, ttsText: '[moans] [gasps]' });
    expect(result.memory?.content).not.toContain('Margo Calloway:');
    expect(result.memory?.content).toContain('Desmond Calloway: Come here.');
  });

  it('drops a line of sounds alone on a voice that cannot read tags', async () => {
    const scene = leanWw('ww-lean-sounds-only-kokoro', 'kokoro', {
      actorText: (label) =>
        label === 'Actor: Margo Calloway'
          ? 'SAY: [moans] [gasps]\nTHINK: Finally.'
          : 'SAY: Come here.\nTHINK: I have missed this.',
    });

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    // A voice that cannot perform sounds is never asked for them: the everyday rules
    const actor = scene.calls.find((call) => call.label === 'Actor: Margo Calloway');
    expect(actor?.systemPrompt).not.toContain('This is sex, not a conversation.');
    expect(actor?.systemPrompt).toContain('ONE short line, ten words or so');
    expect(voicedLines(scene).some((line) => line.speaker === 'Margo Calloway')).toBe(false);
    expect(result.memory?.content).not.toContain('Margo Calloway:');
  });

  it('still throws the act away when a sound names someone outside it', async () => {
    const scene = leanWw('ww-lean-sounds-guard', 'v4', {
      actorText: (label) =>
        label === 'Actor: Margo Calloway'
          ? 'SAY: [whispers Elliot Jr]\nTHINK: Finally.'
          : 'SAY: Come here.\nTHINK: I have missed this.',
    });

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(result.status).toEqual(InteractionEventStatus.NOOP);
    expect(scene.voiced).not.toHaveBeenCalled();
  });

  it('leaves the full pipeline on the pair rules', async () => {
    const scene = wwContext('ww-full-pair-rules');

    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    const actor = scene.calls.find((call) => call.label === 'Actor: Margo Calloway');
    expect(actor?.systemPrompt).toContain(speechRules('pair', { simName: 'Margo Calloway' }));
    expect(actor?.systemPrompt).not.toContain('This is sex, not a conversation.');
  });

  it('with the sounds-first setting off, gets the pair rules and drops a line of sounds alone', async () => {
    const scene = leanWw('ww-lean-sounds-first-off', 'v4', {
      actorText: (label) =>
        label === 'Actor: Margo Calloway'
          ? 'SAY: [moans] [gasps]\nTHINK: Finally.'
          : 'SAY: Come here.\nTHINK: I have missed this.',
    });
    expect(scene.ctx.settings.wwVoiceTags).toBe(true);
    scene.ctx.settings.set(SettingsEnum.WW_VOICE_TAGS, false);
    scene.ctx.settings.set(SettingsEnum.LEAN_NAME_FREE_RULES, true);

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    const actor = scene.calls.find((call) => call.label === 'Actor: Margo Calloway');
    expect(actor?.systemPrompt.startsWith(speechRules('pair', { lean: true }))).toBe(true);
    expect(actor?.systemPrompt).not.toContain('This is sex, not a conversation.');
    expect(voicedLines(scene).some((line) => line.speaker === 'Margo Calloway')).toBe(false);
    expect(result.memory?.content).toContain('Desmond Calloway: Come here.');
  });
});

// Between animation changes the patter pokes one more round, one Sim at a time
describe('the Wicked Whims patter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the tested wording byte for byte', () => {
    expect(patterLine(['oh', 'god'])).toEqual(
      'Still the same moment, a little later. Do not describe anything new: no new position, nobody arriving, no instructions to anyone. Words already said in this scene: oh, god. Use none of them again (names are fine). Never say your own name. Answer with a sound you have not made yet and a few new words, in your own voice, about how it feels right now.',
    );
    expect(patterLine([])).toEqual(
      'Still the same moment, a little later. Do not describe anything new: no new position, nobody arriving, no instructions to anyone. Never say your own name. Answer with a sound you have not made yet and a few new words, in your own voice, about how it feels right now.',
    );
  });

  it('lists the words said, once, first use first, without the other names or sounds-only lines', () => {
    expect(
      patterUsedWords(
        [{ text: "Oh, Lucas. Don't stop." }, { text: '', voiceOnly: true }, { text: 'Oh yes, Valentina... yes.' }],
        // Valentina speaks next: Lucas is exempt, her own name is not
        ['Lucas Hart'],
      ),
    ).toEqual(['oh', "don't", 'stop', 'yes', 'valentina']);
  });

  it('bans the last 8 lines, plus any word said 3 times anywhere in the scene', () => {
    const lines = [
      { text: 'deeper' },
      { text: 'deeper please' },
      { text: 'deeper now' },
      { text: 'wild' },
      ...['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'].map((text) => ({ text })),
    ];
    // 'wild' and 'please' fell out of the window; 'deeper' was said 3 times and stays banned
    expect(patterUsedWords(lines, [])).toEqual([
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'deeper',
    ]);
  });

  it('hears every lean round with its lines, its speakers and a way to poke the next', async () => {
    const scene = leanWw('ww-patter-round-aired', 'v4');
    const aired = vi.spyOn(scene.ctx.wwPatter, 'roundAired');

    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(aired).toHaveBeenCalledTimes(1);
    const [round] = aired.mock.calls[0];
    expect(round.round).toBe(1);
    expect(round.speakerIds).toEqual(['1', '2']);
    expect(round.lines.map((line) => [line.speaker, line.simId])).toEqual([
      ['Margo Calloway', '1'],
      ['Desmond Calloway', '2'],
    ]);
    expect(scene.ctx.scenePlayback.isHeld(round.sceneId)).toBe(true);
  });

  it('holds nothing and follows no act on the full pipeline: the patter is lean only', async () => {
    const scene = wwContext('ww-patter-full');
    const aired = vi.spyOn(scene.ctx.wwPatter, 'roundAired');

    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(aired).toHaveBeenCalledTimes(1);
    const [round] = aired.mock.calls[0];
    expect(scene.ctx.scenePlayback.isHeld(round.sceneId)).toBe(false);
    expect(scene.ctx.wwPatter.size).toBe(0);
  });

  it('pokes ONE actor call on the sounds-first rules (not a thought), carrying the patter line', async () => {
    const scene = leanWw('ww-patter-poke', 'v4', {
      actorText: (label) =>
        label === 'Actor: Desmond Calloway' ? 'SAY: [groans] Margo.\nTHINK: Yes.' : 'SAY: Come here.\nTHINK: Now.',
    });
    const aired = vi.spyOn(scene.ctx.wwPatter, 'roundAired');
    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));
    const [round] = aired.mock.calls[0];
    // The queue runs the poke at once
    scene.continued.mockImplementation((task) =>
      task({ yielded: new AbortController().signal, arrivedAt: Date.now() }),
    );
    scene.calls.length = 0;
    scene.voiced.mockClear();

    await round.poke('2', new AbortController().signal);

    expect(scene.labels()).toEqual(['Actor: Desmond Calloway']);
    const actor = scene.calls[0];
    expect(actor.systemPrompt).toContain('This is sex, not a conversation.');
    expect(actor.systemPrompt).not.toContain('THINK: <one short sentence');
    // Desmond only said his partner's name in round 1: the list is Margo's words alone
    expect(actor.userText).toContain(patterLine(['come', 'here']));
    expect(actor.userText).toContain('Margo Calloway: Come here.');
    expect(voicedLines(scene).map((line) => line.ttsText ?? line.text)).toEqual(['[groans] Margo.']);
    // The poke round reports back on the same scene
    expect(aired).toHaveBeenCalledTimes(2);
    expect(aired.mock.calls[1][0].sceneId).toBe(round.sceneId);
    expect(aired.mock.calls[1][0].round).toBe(2);
  });

  it('does not air a poke whose act moved on while it was written', async () => {
    const scene = leanWw('ww-patter-moved-on', 'v4');
    const aired = vi.spyOn(scene.ctx.wwPatter, 'roundAired');
    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));
    const [round] = aired.mock.calls[0];
    const pokeStop = new AbortController();
    scene.continued.mockImplementation((task) => {
      pokeStop.abort();
      return task({ yielded: new AbortController().signal, arrivedAt: Date.now() });
    });
    scene.voiced.mockClear();

    await round.poke('2', pokeStop.signal);

    expect(scene.voiced).not.toHaveBeenCalled();
  });

  it('leaves the ask and the walk-up alone: only an animation is the act', async () => {
    const scene = leanWw('ww-patter-walk-up', 'v4');
    const aired = vi.spyOn(scene.ctx.wwPatter, 'roundAired');

    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.STARTING));

    expect(aired).not.toHaveBeenCalled();
  });

  it('plays a solo act aloud on the sounds-first rules and holds its scene for the patter', async () => {
    const scene = leanWw('ww-patter-solo', 'v4', {
      actorText: () => 'SAY: [soft moan] Oh, yes.\nTHINK: Nobody is home.',
    });
    const aired = vi.spyOn(scene.ctx.wwPatter, 'roundAired');

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE, [MARGO]));

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(scene.labels()).toEqual(['Actor: Margo Calloway']);
    // Its own rules and framing: talking to themselves, nobody to answer or to open a scene with
    const [actor] = scene.calls;
    expect(actor.systemPrompt).toContain('This is a solo sex scene, not a conversation.');
    expect(actor.systemPrompt).toContain('a few words at most, said to yourself: a yes,');
    expect(actor.systemPrompt).not.toContain('This is sex, not a conversation.');
    expect(actor.userText).toContain(INTIMATE_SOLO_FRAMING);
    expect(actor.userText).not.toContain('talk to each other');
    expect(actor.userText).not.toContain('Open the scene');
    expect(voicedLines(scene).map((line) => [line.speaker, line.ttsText ?? line.text])).toEqual([
      ['Margo Calloway', '[soft moan] Oh, yes.'],
    ]);
    expect(aired).toHaveBeenCalledTimes(1);
    const [round] = aired.mock.calls[0];
    expect(round.speakerIds).toEqual(['1']);
    expect(scene.ctx.scenePlayback.isHeld(round.sceneId)).toBe(true);
  });

  it('pokes a solo act: one more line from the Sim alone, carrying the patter line', async () => {
    const scene = leanWw('ww-patter-solo-poke', 'v4', {
      actorText: () => 'SAY: [soft moan] Oh, yes.\nTHINK: Nobody is home.',
    });
    const aired = vi.spyOn(scene.ctx.wwPatter, 'roundAired');
    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE, [MARGO]));
    const [round] = aired.mock.calls[0];
    scene.continued.mockImplementation((task) =>
      task({ yielded: new AbortController().signal, arrivedAt: Date.now() }),
    );
    scene.calls.length = 0;
    scene.voiced.mockClear();

    await round.poke('1', new AbortController().signal);

    expect(scene.labels()).toEqual(['Actor: Margo Calloway']);
    expect(scene.calls[0].systemPrompt).toContain('This is a solo sex scene, not a conversation.');
    expect(scene.calls[0].userText).toContain(patterLine(['oh', 'yes'], true));
    expect(scene.calls[0].userText).toContain(INTIMATE_SOLO_FRAMING);
    expect(scene.calls[0].userText).not.toContain('names are fine');
    expect(voicedLines(scene).map((line) => line.speaker)).toEqual(['Margo Calloway']);
    expect(aired).toHaveBeenCalledTimes(2);
    expect(aired.mock.calls[1][0].sceneId).toBe(round.sceneId);
    expect(aired.mock.calls[1][0].round).toBe(2);
  });

  it('on a voice that cannot perform sounds, a solo act stays a thought aloud with no patter', async () => {
    const scene = leanWw('ww-patter-solo-kokoro', 'kokoro', {
      actorText: () => 'THINK: Nobody is home.',
    });
    const aired = vi.spyOn(scene.ctx.wwPatter, 'roundAired');

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE, [MARGO]));

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(scene.calls[0].systemPrompt).toContain('THINK: <one short sentence');
    expect(voicedLines(scene).map((line) => [line.speaker, line.text])).toEqual([
      ['Margo Calloway (to self)', 'Nobody is home.'],
    ]);
    expect(aired).not.toHaveBeenCalled();
  });

  it('does not say the same solo thought aloud twice in a row', async () => {
    const scene = leanWw('ww-solo-thought-echo', 'kokoro', {
      actorText: () => 'THINK: This is exactly what I needed on a hot Tuesday morning.',
    });

    // The walk-up and the first animation each ask for a thought, a second apart
    const walkUp = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.STARTING, [MARGO]));
    const animation = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE, [MARGO]));

    expect(walkUp.status).toEqual(InteractionEventStatus.GENERATED);
    expect(animation.status).toEqual(InteractionEventStatus.NOOP);
    expect(voicedLines(scene).map((line) => line.text)).toEqual([
      'This is exactly what I needed on a hot Tuesday morning.',
    ]);
  });

  it('says a new solo thought aloud after an earlier one', async () => {
    const answers = ['THINK: Finally some quiet.', 'THINK: Nobody is home until six.'];
    const scene = leanWw('ww-solo-thought-new', 'kokoro', { actorText: () => answers.shift() ?? '' });

    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.STARTING, [MARGO]));
    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE, [MARGO]));

    expect(voicedLines(scene).map((line) => line.text)).toEqual(['Finally some quiet.', 'Nobody is home until six.']);
  });

  it('tells a solo thought what the Sim has already said to themself', async () => {
    const answers = ['THINK: Finally some quiet.', 'THINK: Nobody is home until six.'];
    const scene = leanWw('ww-solo-already-said', 'kokoro', { actorText: () => answers.shift() ?? '' });

    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.STARTING, [MARGO]));
    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE, [MARGO]));

    const [walkUp, animation] = scene.calls;
    expect(walkUp.userText).not.toContain('Already said during this');
    expect(animation.userText).toContain(
      'Already said during this: "Finally some quiet.". Say none of it again, in any wording.',
    );
  });

  it('tells a partner act nothing of the kind', async () => {
    const scene = leanWw('ww-pair-not-told', 'kokoro');

    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE, [MARGO]));
    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE));

    expect(scene.calls.slice(1).some((call) => call.userText.includes('Already said during this'))).toBe(false);
  });

  it('plays a solo act whose opening has no line as the thought aloud', async () => {
    const scene = leanWw('ww-patter-solo-no-line', 'v4', {
      actorText: () => 'THINK: Nobody is home.',
    });
    const aired = vi.spyOn(scene.ctx.wwPatter, 'roundAired');

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE, [MARGO]));

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(voicedLines(scene).map((line) => [line.speaker, line.text])).toEqual([
      ['Margo Calloway (to self)', 'Nobody is home.'],
    ]);
    expect(aired).not.toHaveBeenCalled();
  });

  it('with the sounds-first setting off, a solo act stays a thought aloud with no patter', async () => {
    const scene = leanWw('ww-patter-solo-off', 'v4');
    scene.ctx.settings.set(SettingsEnum.WW_VOICE_TAGS, false);
    const aired = vi.spyOn(scene.ctx.wwPatter, 'roundAired');

    await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ACTIVE, [MARGO]));

    expect(scene.calls[0].systemPrompt).toContain('THINK: <one short sentence');
    expect(voicedLines(scene).map((line) => line.speaker)).toEqual(['Margo Calloway (to self)']);
    expect(aired).not.toHaveBeenCalled();
  });

  it('makes no scene of the act ending and never says it skipped one', async () => {
    const scene = leanWw('ww-patter-ended', 'v4');
    const heard = vi.spyOn(scene.ctx.wwPatter, 'wwEvent');
    const nsfw = vi.spyOn(scene.ctx.animations, 'isNsfwEnabled').mockReturnValue(true);

    const result = await scene.ctx.ai.interactionEvent(wwEvent(WWEventType.ENDED));

    expect(result.status).toEqual(InteractionEventStatus.NOOP);
    expect(scene.calls).toHaveLength(0);
    expect(heard).toHaveBeenCalledTimes(1);
    expect(nsfw).not.toHaveBeenCalled();
  });

  it('makes no scene of an animation that arrives after its act ended', async () => {
    const scene = leanWw('ww-patter-late-animation', 'v4');
    const aired = vi.spyOn(scene.ctx.wwPatter, 'roundAired');

    await scene.ctx.ai.interactionEvent({ ...wwEvent(WWEventType.ENDED), act_id: 'act-9' });
    const result = await scene.ctx.ai.interactionEvent({ ...wwEvent(WWEventType.ACTIVE), act_id: 'act-9' });

    expect(result.status).toEqual(InteractionEventStatus.NOOP);
    expect(scene.calls).toHaveLength(0);
    expect(aired).not.toHaveBeenCalled();
  });
});
