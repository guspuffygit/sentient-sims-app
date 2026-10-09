import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import { Server } from 'http';
import { runApi } from 'main/sentient-sims/api';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { AIActionType } from 'main/sentient-sims/models/AIActionType';
import { ChatInteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { OpenAICompatibleRequest } from 'main/sentient-sims/models/OpenAICompatibleRequest';
import { PromptRequest } from 'main/sentient-sims/models/OpenAIRequestBuilder';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { SceneState } from 'main/sentient-sims/services/SceneService';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { mockApiContext, mockEnvironment } from './util';
import { TIER_REGISTRATIONS } from 'main/sentient-sims/tiers';

// The core build (release 4.5) runs with NO tiers registered: every ApiContext.ext slot is
// empty and core must carry on without the feature, never throw. `tiers: []` is exactly
// what the stripped build's generated index hands the context.

const sim: SentientSim = {
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

function soloChatEvent(action: string): ChatInteractionEvent {
  return {
    event_id: crypto.randomUUID(),
    event_type: SSEventType.CHAT,
    location_id: 0,
    sentient_sims: [sim],
    action,
    relationships: { relationship_bits: [] },
    environment: {
      location_id: 90336000,
      world_id: 0,
      time: { second: 0, minute: 0, hour: 14, day: 2, week: 1 },
    },
  };
}

// A sleep boundary the planner WOULD plan on: a goal pool, a known day, the feature on
function sleepReflectionFixture(ctx: ApiContext) {
  const scene: SceneState = { sceneId: 1, locationId: 10, startedAt: '2026-09-27T00:00:00.000Z' };
  const rows = [
    { id: '1', content: 'Marisol: dinner is ready', location_id: 10 },
    { id: '2', content: 'Travis: coming', location_id: 10 },
  ] as unknown as MemoryEntity[];
  vi.spyOn(ctx.memoryRepository, 'getSceneMemories').mockReturnValue(rows);
  vi.spyOn(ctx.memoryRepository, 'getSceneParticipantIds').mockReturnValue(['500', sim.sim_id]);
  vi.spyOn(ctx.participantRepository, 'getParticipantNames').mockReturnValue(['Travis Scott', sim.name]);
  vi.spyOn(ctx.locationRepository, 'getLocation').mockReturnValue({ id: 10, name: 'Sandtrap Flat' } as never);
  const oneShot = vi.spyOn(ctx.ai, 'runOneShot').mockResolvedValue({ text: 'A quiet dinner.', exchange: {} } as never);
  ctx.simStateCache.ingest({
    type: 'state_report',
    seq: 1,
    lot: { clock: { absolute_day: 12, day: 3, hour: 22 } },
    sims: [
      {
        sim_id: sim.sim_id,
        sim_name: sim.name,
        self: {
          age: 'ADULT',
          traits: ['Cheerful'],
          goal_pool: [{ id: 'want_MakeFriend', source: 'want', label: 'Make a friend' }],
        },
      },
    ],
  } as never);
  return { scene, oneShot };
}

describe('core without tiers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('leaves every capability slot empty', () => {
    const ctx = mockApiContext({ tiers: [] });
    expect(ctx.tiers).toEqual([]);
    expect(ctx.ext).toEqual({});
  });

  it('writes the plain diary at a sleep boundary with no planner', async () => {
    const core = mockApiContext({ tiers: [] });
    core.settings.set(SettingsEnum.DAILY_GOALS_ENABLED, true);
    const coreRun = sleepReflectionFixture(core);
    await core.ai.runSceneReflection(coreRun.scene, { simId: sim.sim_id, simName: sim.name }, 'sleep', {
      hour: 22,
      absolute_day: 12,
    });
    expect(coreRun.oneShot).toHaveBeenCalledTimes(1);
    expect(coreRun.oneShot.mock.calls[0][0]).toBe('Scene Reflection');
    expect(coreRun.oneShot.mock.calls[0][5]).toBe(AIActionType.REFLECTION);
    expect(coreRun.oneShot.mock.calls[0][1]).not.toContain('goal_review');
  });

  // The same fixture plans wherever the autonomy tier is built in, so the core run above is
  // the planner being absent and not the fixture failing to qualify. Skipped in the core
  // build's own run (scripts/strip-check.sh), which has no planner to show.
  it.runIf(TIER_REGISTRATIONS.some((tier) => tier.name === 'autonomy'))(
    'plans on that same fixture when the autonomy tier is present',
    async () => {
      const dev = mockApiContext();
      dev.settings.set(SettingsEnum.DAILY_GOALS_ENABLED, true);
      const devRun = sleepReflectionFixture(dev);
      await dev.ai.runSceneReflection(devRun.scene, { simId: sim.sim_id, simName: sim.name }, 'sleep', {
        hour: 22,
        absolute_day: 12,
      });
      expect(devRun.oneShot.mock.calls[0][0]).toBe('Scene Reflection + Daily Plan');
    },
  );

  it('answers a solo request with the ordinary reply when nothing can act on it', async () => {
    const ctx = mockApiContext({ tiers: [] });
    const promptRequest: PromptRequest = {
      location: '<LOCATION>A quiet living room.</LOCATION>',
      dateTime: 'It is midday.',
      season: '',
      participants: 'Marisol Vega is a cheerful adult.',
      systemPrompt: '',
      memories: [],
      maxResponseTokens: 200,
      maxTokens: 3900,
    };
    vi.spyOn(ctx.promptBuilder, 'buildPromptRequest').mockResolvedValue(promptRequest);
    ctx.settings.aiApiType = ApiType.OpenAI;
    ctx.settings.openaiKey = 'sk-test';
    const systemPrompts: string[] = [];
    vi.spyOn(ctx.getGenerationService(ApiType.OpenAI), 'sentientSimsGenerate').mockImplementation(
      (request: OpenAICompatibleRequest) => {
        const systemPrompt = request.messages.find((message) => message.role === 'system')?.content ?? '';
        systemPrompts.push(systemPrompt);
        let text = 'SAY: I was just thinking the same thing.';
        if (systemPrompt.includes('You are directing a scene')) {
          text = `=== SCENE ===\nA quiet living room, midday.\n=== PROMPT FOR Marisol Vega ===\nYou are playing Marisol Vega.`;
        } else if (systemPrompt.includes('You are scoring the scene')) {
          text = '{"Marisol Vega": {"memory": 3, "action": 9, "action_reason": "Wants to read."}}';
        }
        return Promise.resolve({ text, request });
      },
    );

    const result = await ctx.ai.interactionEvent(soloChatEvent('go read a book'));

    expect(result.status).toEqual(InteractionEventStatus.GENERATED);
    expect(result.exchanges?.map((exchange) => exchange.label)).toContain('Director Briefing');
    // Never triaged as a request, and a high action score arms nothing anywhere
    expect(systemPrompts.some((prompt) => prompt.includes('You triage one line'))).toBe(false);
  });

  it("serves the core routes, Gus's cognition routes among them, and not the autonomy ones", async () => {
    const ctx = mockApiContext({ tiers: [], port: 25197 });
    const server: Server = runApi(ctx);
    try {
      const base = `http://127.0.0.1:${ctx.port}`;
      const state = await fetch(`${base}/cognition/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'state_report', seq: 7, sims: [] }),
      });
      expect(state.status).toBe(200);
      // Gus's 4.1.0 cognition plumbing answers in core: each of these is his own reply to
      // a body with only a sim id
      const expected: Record<string, number> = {
        '/cognition/outcome': 400,
        '/cognition/perception': 200,
        '/cognition/debug/enqueue': 400,
      };
      for (const [route, status] of Object.entries(expected)) {
        const response = await fetch(`${base}${route}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sim_id: '1' }),
        });
        expect(response.status).toBe(status);
      }
      // The graded outcome log is autonomy's
      expect((await fetch(`${base}/ai/outcomes`)).status).toBe(404);
    } finally {
      await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    }
  });

  // Decision 16: the ai_exchange table persists in stream and dev only. With no tier to
  // attach it, the log is the in-memory ring and the loaded save's table stays empty.
  it('keeps the AI exchange log in memory only', async () => {
    const { directoryService, settingsService } = mockEnvironment();
    const ctx = mockApiContext({ tiers: [], directoryService, settingsService });
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: `core-exchange-${Math.random().toString(36).slice(2)}`, saveId: '1' });
    for (let i = 0; i < 600; i += 1) {
      await ctx.aiExchangeLog.runLabeled(`call ${i}`, AIActionType.COGNITION, () => {
        ctx.aiExchangeLog.record({
          request: { messages: [{ role: 'user', content: `line ${i}`, tokens: 1 }], maxResponseTokens: 1 },
          responseText: 'ok',
          durationMs: 1,
        });
        return Promise.resolve();
      });
    }
    const rows = ctx.db.getDb().prepare('SELECT COUNT(*) AS n FROM ai_exchange').get() as { n: number };
    expect(rows.n).toBe(0);
    const ring = ctx.aiExchangeLog.list(1000);
    expect(ring).toHaveLength(200);
    expect(ring[0].label).toBe('call 599');
  });
});
