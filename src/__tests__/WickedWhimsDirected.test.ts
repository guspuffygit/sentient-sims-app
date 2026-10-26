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
import { INTIMATE_SCENE_FRAMING } from 'main/sentient-sims/util/intimateScene';
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
    expect(actor?.userText).toContain(INTIMATE_SCENE_FRAMING);
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
