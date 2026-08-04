import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import http, { Server } from 'http';
import { AddressInfo } from 'net';
import { runApi } from 'main/sentient-sims/api';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import {
  ChatInteractionEvent,
  DoSomethingInteractionEvent,
  SSEventType,
} from 'main/sentient-sims/models/InteractionEvents';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { AIActionType } from 'main/sentient-sims/models/AIActionType';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { mockApiContext } from './util';

type StubRequestBody = {
  model?: string;
  messages?: { role: string; content: string }[];
};

type SeenRequest = {
  url: string;
  auth: string | string[] | undefined;
  body: StubRequestBody;
};

const seen: SeenRequest[] = [];

// Minimal vLLM-compatible stub: /tokenize + /v1/chat/completions
function startStubAI(): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      const body = raw ? (JSON.parse(raw) as StubRequestBody) : {};
      const url = req.url ?? '';
      seen.push({
        url,
        auth: req.headers.authentication ?? req.headers.authorization,
        body,
      });
      res.setHeader('Content-Type', 'application/json');
      if (url.includes('tokenize')) {
        res.end(JSON.stringify({ count: 10, max_model_len: 4096, tokens: [1, 2, 3] }));
        return;
      }
      const systemPrompt = body.messages?.find((m) => m.role === 'system')?.content ?? '';
      let text = 'A plain narration line about the sims.';
      if (systemPrompt.includes('write one shared SCENE briefing plus one private briefing per actor')) {
        text = [
          '=== SCENE ===',
          'Sitcom, at home, mid-afternoon.',
          '=== PROMPT FOR Gus Puffy ===',
          'You are playing Gus Puffy.',
          '=== PROMPT FOR Katrina Caliente ===',
          'You are playing Katrina Caliente.',
        ].join('\n');
      } else if (systemPrompt.includes('Stay in character as')) {
        text = 'Sure, that sounds like a plan.';
      } else if (systemPrompt.includes('reviewing the newest lines')) {
        text = ['Gus Puffy: Sure, that sounds like a plan.', 'Katrina Caliente: Then let us do it today.'].join('\n');
      }
      res.end(
        JSON.stringify({
          id: 'stub',
          choices: [{ index: 0, message: { role: 'assistant', content: text }, finish_reason: 'stop' }],
        }),
      );
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

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

describe('Do Something wire-level requests (SentientSimsAI provider)', () => {
  const ctx = mockApiContext({ port: 25197 });
  const aiClient = new AIClient(`http://localhost:${ctx.port}`);
  let server: Server;
  let stub: http.Server;

  beforeAll(async () => {
    stub = await startStubAI();
    const { port } = stub.address() as AddressInfo;
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: 'wire-test', saveId: '1' });
    ctx.settings.sentientSimsAIEndpoint = `http://127.0.0.1:${port}`;
    ctx.settings.accessToken = 'test-jwt-token';
    ctx.settings.aiApiType = ApiType.SentientSimsAI;
    server = runApi(ctx);
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
    await new Promise<void>((resolve) => {
      stub.close(() => {
        resolve();
      });
    });
  });

  it('sends identical auth for chat and do something pipelines', async () => {
    const sims = [buildSim('Gus Puffy', '100', true), buildSim('Katrina Caliente', '200', false)];
    const base = {
      event_id: crypto.randomUUID(),
      location_id: 0,
      sentient_sims: sims,
      relationships: { relationship_bits: [] },
      environment: {
        location_id: 0,
        world_id: 0,
        time: { second: 0, minute: 0, hour: 12, day: 1, week: 1 },
      },
    };

    seen.length = 0;
    const chatEvent: ChatInteractionEvent = {
      ...base,
      event_type: SSEventType.CHAT,
      action: 'Gus Puffy says hello to Katrina Caliente.',
    };
    const chatResult = await aiClient.interactionEvent(chatEvent);
    const chatRequests = seen.map((r) => ({ ...r }));

    seen.length = 0;
    const doEvent: DoSomethingInteractionEvent = {
      ...base,
      event_id: crypto.randomUUID(),
      event_type: SSEventType.DO_SOMETHING,
      action: 'Gus Puffy asks Katrina Caliente to dance.',
    };
    const doResult = await aiClient.interactionEvent(doEvent);
    const doRequests = seen.map((r) => ({ ...r }));

    expect(chatResult.status).toEqual('generated');
    expect(doResult.status).toEqual('generated');

    // Every AI call in both pipelines must carry the same authentication
    const generationRequests = [...chatRequests, ...doRequests].filter((r) => !r.url.includes('modelsettings'));
    expect(generationRequests.length).toBeGreaterThan(0);
    generationRequests.forEach((r) => {
      expect(r.auth).toEqual('test-jwt-token');
    });
  }, 60000);

  it('routes the directed pipeline through the Do Something provider override', async () => {
    ctx.settings.aiProviderConfigs = [
      ...ctx.settings.aiProviderConfigs,
      {
        id: 'do-something-cfg',
        name: 'Do Something Override',
        apiType: ApiType.SentientSimsAI,
        model: 'override-model',
      },
    ];
    ctx.settings.aiActionProviderOverrides = { [AIActionType.DO_SOMETHING]: 'do-something-cfg' };
    try {
      seen.length = 0;
      const doEvent: DoSomethingInteractionEvent = {
        event_id: crypto.randomUUID(),
        event_type: SSEventType.DO_SOMETHING,
        location_id: 0,
        action: 'Gus Puffy shows Katrina Caliente his stamp collection.',
        sentient_sims: [buildSim('Gus Puffy', '100', true), buildSim('Katrina Caliente', '200', false)],
        relationships: { relationship_bits: [] },
        environment: {
          location_id: 0,
          world_id: 0,
          time: { second: 0, minute: 0, hour: 12, day: 1, week: 1 },
        },
      };
      const result = await aiClient.interactionEvent(doEvent);

      expect(result.status).toEqual('generated');
      const completions = seen.filter((r) => r.url.includes('chat/completions'));
      expect(completions.length).toBeGreaterThanOrEqual(3);
      completions.forEach((r) => {
        expect(r.body.model).toEqual('override-model');
      });
    } finally {
      ctx.settings.aiActionProviderOverrides = {};
    }
  }, 60000);
});
