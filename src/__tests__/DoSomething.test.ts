import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import { Server } from 'http';
import { runApi } from 'main/sentient-sims/api';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import { DoSomethingInteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { OpenAICompatibleRequest } from 'main/sentient-sims/models/OpenAICompatibleRequest';
import { SimsGenerateResponse } from 'main/sentient-sims/models/SimsGenerateResponse';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { mockApiContext } from './util';

function buildSim(name: string, simId: string, isPlayerSim: boolean): SentientSim {
  return {
    careers: [],
    name,
    age: SimAge.ADULT,
    sim_id: simId,
    gender: 'Male',
    moods: [],
    traits: [],
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

function buildDoSomethingEvent(sims: SentientSim[], action: string): DoSomethingInteractionEvent {
  return {
    event_id: crypto.randomUUID(),
    event_type: SSEventType.DO_SOMETHING,
    location_id: 0,
    action,
    sentient_sims: sims,
    relationships: { relationship_bits: [] },
    environment: {
      location_id: 0,
      world_id: 0,
      time: { second: 0, minute: 0, hour: 12, day: 1, week: 1 },
    },
  };
}

type PipelineStage = 'briefing' | 'actor' | 'review' | 'classic';

function stageOf(request: OpenAICompatibleRequest): PipelineStage {
  const systemPrompt = request.messages.find((message) => message.role === 'system')?.content ?? '';
  if (systemPrompt.includes('write one shared SCENE briefing plus one private briefing per actor')) {
    return 'briefing';
  }
  if (systemPrompt.includes('Stay in character as')) {
    return 'actor';
  }
  if (systemPrompt.includes('reviewing the newest lines')) {
    return 'review';
  }
  return 'classic';
}

// Stages listed here fail with an HTTP-ish error, simulating a struggling provider
let failingStages: PipelineStage[] = [];

// Canned provider that answers each stage of the directed pipeline plausibly,
// so the test exercises the full app-side flow without a live AI backend
function fakeGenerate(request: OpenAICompatibleRequest): Promise<SimsGenerateResponse> {
  const stage = stageOf(request);
  if (failingStages.includes(stage)) {
    return Promise.reject(new Error(`Simulated provider failure during ${stage}`));
  }
  const systemPrompt = request.messages.find((message) => message.role === 'system')?.content ?? '';
  let text = 'Gus Puffy walks over and says hello to everyone in the room.';
  if (stage === 'briefing') {
    text = [
      '=== SCENE ===',
      'Sitcom. A sunny afternoon at home. Gus is pitching his big idea.',
      '=== PROMPT FOR Gus Puffy ===',
      'You are playing Gus Puffy. You want to convince Katrina.',
      '=== PROMPT FOR Katrina Caliente ===',
      'You are playing Katrina Caliente. You are skeptical.',
    ].join('\n');
  } else if (stage === 'actor') {
    text = systemPrompt.includes('Gus Puffy') ? 'Trust me, this plan cannot fail.' : 'That is what you said last time.';
  } else if (stage === 'review') {
    text = ['Gus Puffy: Trust me, this plan cannot fail.', 'Katrina Caliente: That is what you said last time.'].join(
      '\n',
    );
  }
  return Promise.resolve({ text, request });
}

describe('Do Something event', () => {
  const ctx = mockApiContext({ port: 25199 });
  const aiClient = new AIClient(`http://localhost:${ctx.port}`);
  let server: Server;

  beforeAll(() => {
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: 'do-something-test', saveId: '1' });
    const fakeService = {
      serviceUrl: () => 'http://fake',
      sentientSimsGenerate: fakeGenerate,
      healthCheck: () => Promise.resolve({ status: 'OK' }),
      getModels: () => Promise.resolve([]),
    };
    vi.spyOn(ctx, 'getGenerationService').mockImplementation(() => fakeService);
    server = runApi(ctx);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err: Error | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  it('generates a directed scene for two sims', async () => {
    expect(ctx.settings.directedScenesEnabled).toBe(true);

    const event = buildDoSomethingEvent(
      [buildSim('Gus Puffy', '100', true), buildSim('Katrina Caliente', '200', false)],
      'Gus Puffy pitches Katrina Caliente on his new business idea.',
    );
    const result = await aiClient.interactionEvent(event);

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(result.text).toContain('Gus Puffy:');
    expect(result.text).toContain('Katrina Caliente:');
    expect(result.memory?.content).toBeTruthy();
  }, 30000);

  it('generates classic output for a single sim', async () => {
    const event = buildDoSomethingEvent(
      [buildSim('Gus Puffy', '100', true)],
      'Gus Puffy practices his speech in the mirror.',
    );
    const result = await aiClient.interactionEvent(event);

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(result.text).toBeTruthy();
  }, 30000);

  it('generates classic output for two sims when directed scenes are disabled', async () => {
    ctx.settings.directedScenesEnabled = false;
    try {
      const event = buildDoSomethingEvent(
        [buildSim('Gus Puffy', '100', true), buildSim('Katrina Caliente', '200', false)],
        'Gus Puffy tells Katrina Caliente about his day.',
      );
      const result = await aiClient.interactionEvent(event);

      expect(result.status).toEqual(InteractionEventStatus.GENERATED);
      expect(result.text).toBeTruthy();
    } finally {
      ctx.settings.directedScenesEnabled = true;
    }
  }, 30000);

  it('still airs the scene when the director briefing and review fail', async () => {
    failingStages = ['briefing', 'review'];
    try {
      const event = buildDoSomethingEvent(
        [buildSim('Gus Puffy', '100', true), buildSim('Katrina Caliente', '200', false)],
        'Gus Puffy asks Katrina Caliente about her garden.',
      );
      const result = await aiClient.interactionEvent(event);

      expect(result.status).toEqual(InteractionEventStatus.GENERATED);
      expect(result.text).toContain('Gus Puffy:');
      expect(result.text).toContain('Katrina Caliente:');
    } finally {
      failingStages = [];
    }
  }, 30000);

  it('falls back to classic generation when the whole directed pipeline fails', async () => {
    failingStages = ['briefing', 'actor', 'review'];
    try {
      const event = buildDoSomethingEvent(
        [buildSim('Gus Puffy', '100', true), buildSim('Katrina Caliente', '200', false)],
        'Gus Puffy challenges Katrina Caliente to a cook-off.',
      );
      const result = await aiClient.interactionEvent(event);

      expect(result.status).toEqual(InteractionEventStatus.GENERATED);
      expect(result.text).toContain('Gus Puffy walks over');
    } finally {
      failingStages = [];
    }
  }, 30000);

  it('returns the provider error when every generation path fails', async () => {
    failingStages = ['briefing', 'actor', 'review', 'classic'];
    try {
      const event = buildDoSomethingEvent(
        [buildSim('Gus Puffy', '100', true), buildSim('Katrina Caliente', '200', false)],
        'Gus Puffy tries to tell Katrina Caliente a story.',
      );
      const result = (await aiClient.interactionEvent(event)) as { error?: string };

      expect(result.error).toContain('Simulated provider failure');
    } finally {
      failingStages = [];
    }
  }, 30000);
});
