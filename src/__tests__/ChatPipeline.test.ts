import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { ChatInteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { OpenAICompatibleRequest } from 'main/sentient-sims/models/OpenAICompatibleRequest';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { mockApiContext } from './util';

const playerSim: SentientSim = {
  careers: [],
  name: 'Marisol Vega',
  age: SimAge.ADULT,
  sim_id: '882730689256095860',
  gender: 'Female',
  traits: ['trait_Cheerful'],
  moods: ['Mood_Playful'],
  is_ghost: false,
  grubby: false,
  in_pool: false,
  is_at_home: false,
  is_dying: false,
  is_human: true,
  is_inside_building: true,
  is_outside: false,
  is_pet: false,
  on_fire: false,
  on_home_lot: false,
  sleeping: false,
  is_pregnant: false,
  is_player_sim: true,
};

const targetSim: SentientSim = {
  ...playerSim,
  name: 'Nancy Landgraab',
  sim_id: '52942350254217326',
  traits: ['trait_Snob'],
  moods: ['Mood_Flirty'],
  is_player_sim: false,
};

function buildChatEvent(action: string, sims: SentientSim[]): ChatInteractionEvent {
  return {
    event_id: crypto.randomUUID(),
    event_type: SSEventType.CHAT,
    location_id: 0,
    sentient_sims: sims,
    action,
    relationships: { relationship_bits: [] },
    environment: {
      location_id: 90336000,
      world_id: 0,
      time: { second: 0, minute: 0, hour: 14, day: 2, week: 1 },
    },
  };
}

const briefing = `=== SCENE ===
A gym, midday. The two are chatting between sets.
=== PROMPT FOR Nancy Landgraab ===
You are playing Nancy Landgraab. Answer warmly and keep it moving.`;

const actorLine = 'Same here, this place beats my old gym.';

describe('Chat pipeline', () => {
  let ctx: ApiContext;
  // What the mocked reviewer returns; a test can widen it to include the player's line
  let reviewerOutput: string;

  function mockGeneration() {
    const service = ctx.getGenerationService(ApiType.OpenAI);
    return vi.spyOn(service, 'sentientSimsGenerate').mockImplementation((request: OpenAICompatibleRequest) => {
      const systemPrompt = request.messages.find((message) => message.role === 'system')?.content ?? '';
      let text = actorLine;
      if (systemPrompt.includes('You are directing a scene')) {
        text = briefing;
      } else if (systemPrompt.includes('You are the director of a show')) {
        text = reviewerOutput;
      } else if (systemPrompt.includes('You are scoring the scene')) {
        text = '{"Nancy Landgraab": {"memory": 3, "action": 2, "action_reason": "Happy chatting."}}';
      }
      return Promise.resolve({ text, request });
    });
  }

  beforeEach(() => {
    ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: `chat-${Math.random().toString(36).slice(2)}`, saveId: '1' });
    ctx.settings.aiApiType = ApiType.OpenAI;
    ctx.settings.openaiKey = 'sk-test';
    reviewerOutput = `Nancy Landgraab: ${actorLine}`;
  });

  it('runs a chat through the directed pipeline with only the target sim performing', async () => {
    mockGeneration();

    const result = await ctx.ai.interactionEvent(buildChatEvent('Nice, me too!', [playerSim, targetSim]));

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    const labels = result.exchanges?.map((exchange) => exchange.label);
    expect(labels).toEqual(['Director Briefing', 'Actor: Nancy Landgraab', 'Director Review', 'Scene Scores']);
    // The player already spoke, so their sim takes no actor turn
    expect(labels).not.toContain('Actor: Marisol Vega');
  });

  it('airs only the reply and remembers the player line attributed', async () => {
    mockGeneration();

    const result = await ctx.ai.interactionEvent(buildChatEvent('Nice, me too!', [playerSim, targetSim]));

    expect(result.text).toContain(`Nancy Landgraab: ${actorLine}`);
    // The mod already showed the player's line in the chat box; airing it again would double it
    expect(result.text).not.toContain('Marisol Vega');
    expect(result.memory?.content).toEqual(`Nancy Landgraab: ${actorLine}`);
    expect(result.memory?.action).toEqual('Marisol Vega: Nice, me too!');
  });

  it('drops the player line when the reviewer echoes it back', async () => {
    reviewerOutput = `Marisol Vega: Nice, me too!\nNancy Landgraab: ${actorLine}`;
    mockGeneration();

    const result = await ctx.ai.interactionEvent(buildChatEvent('Nice, me too!', [playerSim, targetSim]));

    expect(result.text).not.toContain('Marisol Vega');
    expect(result.memory?.content).toEqual(`Nancy Landgraab: ${actorLine}`);
  });

  it('cuts the reviewer off when it extends the scene past the delivered lines', async () => {
    // The known rogue behavior: instead of reviewing, the reviewer keeps writing the scene
    reviewerOutput = `Nancy Landgraab: ${actorLine}\nNancy Landgraab: Anyway, want to grab a smoothie after?\nMarisol Vega: Sure, sounds great!`;
    mockGeneration();

    const result = await ctx.ai.interactionEvent(buildChatEvent('Nice, me too!', [playerSim, targetSim]));

    // Only the one delivered line airs; the reviewer's continuation is dropped
    expect(result.text).toEqual(`Nancy Landgraab: ${actorLine}`);
    expect(result.memory?.content).toEqual(`Nancy Landgraab: ${actorLine}`);
  });

  it('carries the running conversation into the next chat beat', async () => {
    const generate = mockGeneration();

    const first = await ctx.ai.interactionEvent(buildChatEvent('Nice, me too!', [playerSim, targetSim]));
    expect(first.memory).toBeDefined();
    // The mod persists the memory it gets back; do the same so the next beat can retrieve it
    ctx.memoryRepository.createMemory({
      memory: { ...first.memory, location_id: 90336000 },
      participants: ctx.participantRepository.getParticipants(
        [playerSim, targetSim].map((sim) => ({ id: sim.sim_id, fullName: sim.name })),
      ),
    });

    generate.mockClear();
    await ctx.ai.interactionEvent(buildChatEvent('What are you training for?', [playerSim, targetSim]));

    const briefingRequest = generate.mock.calls[0][0];
    const userText = briefingRequest.messages.find((message) => message.role === 'user')?.content ?? '';
    expect(userText).toContain('Previously in this scene');
    expect(userText).toContain(actorLine);
    expect(userText).toContain('What are you training for?');
  });

  it('plays a solo chat as The Voice speaking to the sim', async () => {
    // Nobody in earshot: the player talks directly TO their sim, who answers aloud
    // through the directed pipeline — not a monologue beat
    reviewerOutput = `Marisol Vega: ${actorLine}`;
    mockGeneration();

    const result = await ctx.ai.interactionEvent(buildChatEvent('How are you feeling today?', [playerSim]));

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    const labels = result.exchanges?.map((exchange) => exchange.label);
    expect(labels).toEqual(['Director Briefing', 'Actor: Marisol Vega', 'Director Review', 'Scene Scores']);
    // The sim replies out loud; the player's line is remembered attributed to The Voice
    expect(result.text).toContain(`Marisol Vega: ${actorLine}`);
    expect(result.text).not.toContain('The Voice:');
    expect(result.memory?.content).toEqual(`Marisol Vega: ${actorLine}`);
    expect(result.memory?.action).toEqual('The Voice: How are you feeling today?');
  });

  it('plays a solo chat single-shot when Directed Scenes is off', async () => {
    ctx.settings.directedScenesEnabled = false;
    const generate = mockGeneration();

    const result = await ctx.ai.interactionEvent(buildChatEvent('How are you feeling today?', [playerSim]));

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    // Gus's classic single-shot generation: no director briefing, no actor turns
    const systemPrompts = generate.mock.calls.map(
      ([request]) => request.messages.find((message) => message.role === 'system')?.content ?? '',
    );
    expect(systemPrompts.some((prompt) => prompt.includes('You are directing a scene'))).toBe(false);
    expect(result.exchanges).toBeUndefined();
    expect(result.memory?.action).toEqual('How are you feeling today?');
  });
});
