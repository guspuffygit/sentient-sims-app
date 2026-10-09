import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { AIActionType } from 'main/sentient-sims/models/AIActionType';
import { OpenAICompatibleRequest } from 'main/sentient-sims/models/OpenAICompatibleRequest';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { AIExchangeLogService } from 'main/sentient-sims/services/AIExchangeLogService';
import { OpenAIService } from 'main/sentient-sims/services/OpenAIService';
import { mockApiContext } from './util';

describe('AIExchangeLogService', () => {
  it('labels concurrent calls independently', async () => {
    const log = new AIExchangeLogService();

    const record = (text: string) => {
      log.record({
        request: { messages: [{ role: 'user', content: text, tokens: 1 }], maxResponseTokens: 1 },
        responseText: 'ok',
        durationMs: 1,
      });
    };

    // Two overlapping labeled scopes: without async-local isolation the second would
    // overwrite the first's label
    await Promise.all([
      log.runLabeled('Cognition: Alice', AIActionType.COGNITION, async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 5);
        });
        record('alice');
      }),
      log.runLabeled('Director Briefing', AIActionType.DIRECTED_SCENE_DIRECTOR, () => {
        record('director');
        return Promise.resolve();
      }),
    ]);

    const byResponse = Object.fromEntries(log.list().map((entry) => [entry.promptChars, entry.label]));
    // 'alice' is 5 chars, 'director' is 8
    expect(byResponse[5]).toBe('Cognition: Alice');
    expect(byResponse[8]).toBe('Director Briefing');
  });

  it('falls back to a generic label outside a labeled scope', () => {
    const log = new AIExchangeLogService();
    log.record({ request: { messages: [], maxResponseTokens: 1 }, responseText: '', durationMs: 0 });
    expect(log.list()[0].label).toBe('AI Generation');
  });

  it('keeps the full prompt for the detail view but not the list', () => {
    const log = new AIExchangeLogService();
    const request: OpenAICompatibleRequest = {
      messages: [{ role: 'system', content: 'a long system prompt', tokens: 4 }],
      maxResponseTokens: 10,
      model: 'gpt-test',
    };
    const id = log.record({ request, responseText: 'the reply', durationMs: 42 });

    const [summary] = log.list();
    expect(summary).not.toHaveProperty('request');
    expect(summary.model).toBe('gpt-test');
    expect(summary.durationMs).toBe(42);

    const detail = log.get(id);
    expect(detail?.request.messages[0].content).toBe('a long system prompt');
    expect(detail?.responseText).toBe('the reply');
  });

  it('stamps the memory a set of calls produced onto their rows', () => {
    const log = new AIExchangeLogService();
    const request: OpenAICompatibleRequest = { messages: [], maxResponseTokens: 1 };
    log.record({ request, responseText: '', durationMs: 1 });
    log.record({ request: { messages: [], maxResponseTokens: 1 }, responseText: '', durationMs: 1 });

    log.linkRequestsToMemory([request], '77');

    const linked = log.list().filter((entry) => entry.memoryId === '77');
    expect(linked).toHaveLength(1);
  });
});

describe('AI exchange capture', () => {
  let ctx: ApiContext;

  beforeEach(() => {
    ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.settings.aiApiType = ApiType.OpenAI;
    ctx.settings.openaiKey = 'sk-test';
  });

  it('logs every provider call made through the shared seam', async () => {
    // Mock the provider itself, not the logging wrapper getGenerationService returns —
    // spying on the wrapper would replace the very code under test
    vi.spyOn(OpenAIService.prototype, 'sentientSimsGenerate').mockImplementation((request: OpenAICompatibleRequest) =>
      Promise.resolve({ text: 'rated 4', request }),
    );

    await ctx.ai.runOneShot('Memory Importance', 'rate it', 'something happened', 5);

    const [entry] = ctx.aiExchangeLog.list();
    expect(entry.label).toBe('Memory Importance');
    expect(entry.responsePreview).toBe('rated 4');
    expect(ctx.aiExchangeLog.get(entry.id)?.request.messages.length).toBeGreaterThan(0);
  });

  it('records failures with the error message instead of swallowing them', async () => {
    vi.spyOn(OpenAIService.prototype, 'sentientSimsGenerate').mockRejectedValue(new Error('provider exploded'));

    await expect(ctx.ai.runOneShot('Cognition: Alice', 'decide', 'state', 5)).rejects.toThrow('provider exploded');

    const [entry] = ctx.aiExchangeLog.list();
    expect(entry.label).toBe('Cognition: Alice');
    expect(entry.error).toBe('provider exploded');
  });

  it('hands back the same wrapper for repeated lookups', () => {
    expect(ctx.getGenerationService(ApiType.OpenAI)).toBe(ctx.getGenerationService(ApiType.OpenAI));
  });
});
