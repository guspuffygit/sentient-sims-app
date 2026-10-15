import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { NoopEmbeddingService } from 'main/sentient-sims/services/EmbeddingService';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { InteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { SimStateReport } from 'main/sentient-sims/models/SimStateReport';
import { canSpeak, isNonControllable } from 'main/sentient-sims/util/speechCapability';
import { mockApiContext } from './util';

// The "pets can't talk" toggle (2026-10-15): with nonControllableSimsSpeak off, a pet, a
// baby or an infant takes its turn in a directed scene as thought only - briefed, scored
// and remembered, never aired. Everyone else, toddlers up, speaks as before.
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

const ANKER = makeSim('Anker Solheim', '1');
const BOSUN = makeSim('Bosun Solheim', '2', { is_pet: true, is_human: false });
const SKIPPER = makeSim('Skipper Solheim', '3', { is_pet: true, is_human: false });

function sceneEvent(sims: SentientSim[]): InteractionEvent {
  return {
    event_id: 'event-1',
    event_type: SSEventType.INTERACTION,
    location_id: 5,
    environment: {
      location_id: 5,
      world_id: 0,
      time: { second: 0, minute: 0, hour: 0, day: 0, week: 0 },
    },
    sentient_sims: sims,
    interaction_name: 'social_Chat',
  };
}

const SCORES = JSON.stringify({
  'Anker Solheim': { memory: 5, action: 1, action_reason: '', done: true },
  'Bosun Solheim': { memory: 6, action: 1, action_reason: '', done: true },
  'Skipper Solheim': { memory: 6, action: 1, action_reason: '', done: true },
});

function sceneContext(sessionId: string, petsSpeak: boolean) {
  const ctx: ApiContext = mockApiContext();
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
  ctx.db.loadDatabase({ sessionId, saveId: '1' });
  ctx.settings.set(SettingsEnum.NON_CONTROLLABLE_SIMS_SPEAK, petsSpeak);
  ctx.settings.set(SettingsEnum.GENERATED_DEFAULT_DESCRIPTIONS, false);
  ctx.settings.set(SettingsEnum.SCENE_MAX_ROUNDS, 1);
  vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());
  vi.spyOn(ctx.modelSettings, 'getModelSettings').mockResolvedValue({
    temperature: undefined,
    top_p: undefined,
    top_k: undefined,
    repetition_penalty: undefined,
    max_tokens: 5000,
  });

  const prompts = new Map<string, string>();
  vi.spyOn(ctx.ai, 'runOneShot').mockImplementation((label: string, systemPrompt: string) => {
    prompts.set(label, systemPrompt);
    let text = 'SAY: Who is a good boy?\nTHINK: He always knows when I am sad.';
    if (label === 'Scene Scores') {
      text = SCORES;
    } else if (label === 'Director Briefing' || label === 'Director Review') {
      text = '';
    } else if (label.startsWith('Actor: ') && !label.includes('Anker')) {
      // A silenced actor is told to think only; a talking one answers in both tags
      text = systemPrompt.includes('SAY:')
        ? 'SAY: Woof, I love you.\nTHINK: Ball. Ball. Ball.'
        : 'THINK: Ball. Ball. Ball.';
    }
    return Promise.resolve({
      exchange: { label, request: { messages: [], maxResponseTokens: 120 }, responseText: text },
      text,
    });
  });
  const voiced = vi.spyOn(ctx.ai, 'playTtsLines').mockReturnValue(undefined);
  const stored = vi.spyOn(ctx.memoryRepository, 'createMemory');
  const voicedSpeakers = () => voiced.mock.calls.flatMap(([lines]) => lines.map((line) => line.speaker));

  return { ctx, prompts, voiced, stored, voicedSpeakers };
}

describe('silent pets', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('by default a dog takes a speaking turn like anyone else', async () => {
    const { ctx, prompts, voicedSpeakers } = sceneContext('silent-pets-default', true);

    const result = await ctx.ai.runDirectedGeneration(sceneEvent([ANKER, BOSUN]), {
      action: 'Anker Solheim plays with Bosun Solheim.',
    });

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(prompts.get('Actor: Bosun Solheim')).toContain('SAY:');
    expect(voicedSpeakers()).toEqual(['Anker Solheim', 'Bosun Solheim']);
  });

  it('switched off, the dog thinks through the scene and the human carries the dialogue', async () => {
    const { ctx, prompts, voicedSpeakers, stored } = sceneContext('silent-pets-mixed', false);

    const result = await ctx.ai.runDirectedGeneration(sceneEvent([ANKER, BOSUN]), {
      action: 'Anker Solheim plays with Bosun Solheim.',
    });

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(prompts.get('Director Briefing')).toContain('Bosun Solheim cannot speak');
    expect(prompts.get('Actor: Bosun Solheim')).not.toContain('SAY:');
    expect(prompts.get('Actor: Anker Solheim')).toContain('SAY:');
    expect(prompts.get('Director Review')).not.toContain('Both characters must speak');
    expect(voicedSpeakers()).toEqual(['Anker Solheim']);
    const monologues = stored.mock.calls
      .map((call) => call[0].memory)
      .filter((memory) => memory.event_type === 'monologue');
    expect(monologues.map((memory) => memory.content)).toContain('Ball. Ball. Ball.');
  });

  it('switched off, two pets alone keep their thoughts to themselves: stored, never voiced', async () => {
    const { ctx, voiced, stored } = sceneContext('silent-pets-alone', false);

    const result = await ctx.ai.runDirectedGeneration(sceneEvent([BOSUN, SKIPPER]), {
      action: 'Bosun Solheim sniffs Skipper Solheim.',
      saveMemory: true,
    });

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(result.text).toContain('(thinking)');
    expect(voiced).not.toHaveBeenCalled();
    const rows = stored.mock.calls.map((call) => call[0].memory).filter((memory) => memory.event_type === 'monologue');
    expect(rows.map((memory) => memory.content)).toEqual([
      'Bosun Solheim (thinking): Ball. Ball. Ball.',
      'Skipper Solheim (thinking): Ball. Ball. Ball.',
    ]);
  });

  it('a lone sim who may speak still voices the solo thought as before', async () => {
    const { ctx, voicedSpeakers } = sceneContext('silent-pets-solo-human', false);

    await ctx.ai.runDirectedGeneration(sceneEvent([ANKER]), { action: 'Anker Solheim repairs the boat.' });

    expect(voicedSpeakers()).toEqual(['Anker Solheim (to self)']);
  });

  it('the player asking a silenced dog gets a thought back and opens no thread', async () => {
    const { ctx, voiced } = sceneContext('silent-pets-player', false);
    const begin = vi.spyOn(ctx.playerConversations, 'begin');

    const result = await ctx.ai.runDirectedGeneration(sceneEvent([BOSUN]), {
      playerLine: { speaker: 'The Voice', text: 'Who is a good boy?' },
    });

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(result.text).toContain('(thinking)');
    expect(voiced).not.toHaveBeenCalled();
    expect(begin).not.toHaveBeenCalled();
  });
});

describe('who can speak', () => {
  const quiet = { settings: { nonControllableSimsSpeak: false } };
  const report = (sims: { sim_id: string; self: { age?: string; species?: string } }[]): SimStateReport =>
    ({
      type: 'state_report',
      seq: 1,
      lot: {},
      sims: sims.map((sim) => ({ ...sim, sims: [] })),
    }) as unknown as SimStateReport;

  it('is everyone while the setting is on', () => {
    const open = { settings: { nonControllableSimsSpeak: true } };
    expect(canSpeak(open, BOSUN)).toBe(true);
    expect(canSpeak(open, makeSim('Baby', '9', { age: SimAge.INFANT }))).toBe(true);
  });

  it('silences pets, babies and infants from the event fields, and nobody else', () => {
    expect(canSpeak(quiet, BOSUN)).toBe(false);
    expect(canSpeak(quiet, makeSim('Baby', '9', { age: SimAge.BABY }))).toBe(false);
    expect(canSpeak(quiet, makeSim('Infant', '9', { age: SimAge.INFANT }))).toBe(false);
    expect(canSpeak(quiet, makeSim('Toddler', '9', { age: SimAge.TODDLER }))).toBe(true);
    expect(canSpeak(quiet, makeSim('Ghost', '9', { is_ghost: true }))).toBe(true);
    expect(canSpeak(quiet, ANKER)).toBe(true);
  });

  it('trusts the state report over the event: a Twitch-shaped ask still knows a dog is a dog', () => {
    const ctx = mockApiContext();
    ctx.settings.set(SettingsEnum.NON_CONTROLLABLE_SIMS_SPEAK, false);
    ctx.simStateCache.ingest(
      report([
        { sim_id: '20', self: { species: 'DOG', age: 'ADULT' } },
        { sim_id: '21', self: { age: 'INFANT' } },
        { sim_id: '22', self: { age: 'ADULT' } },
      ]),
    );
    // util/twitchSimTarget.ts builds every target as a human adult
    expect(isNonControllable(ctx, makeSim('Bosun', '20'))).toBe(true);
    expect(isNonControllable(ctx, makeSim('Infant', '21'))).toBe(true);
    // The report wins the other way too: an adult reported as such speaks whatever the event says
    expect(isNonControllable(ctx, makeSim('Adult', '22', { age: SimAge.INFANT }))).toBe(false);
    // Unknown fails open
    expect(isNonControllable(ctx, makeSim('Stranger', '23'))).toBe(false);
  });
});
