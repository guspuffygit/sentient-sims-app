import { vi } from 'vitest';
import { AIActionType } from 'main/sentient-sims/models/AIActionType';
import { AIProviderConfig } from 'main/sentient-sims/models/AIProviderConfig';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import {
  reasoningEffortBody,
  reasoningEffortFromValue,
  reasoningEffortName,
  reasoningEfforts,
  supportsReasoningEffort,
} from 'main/sentient-sims/models/ReasoningEffort';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { mockApiContext } from './util';

describe('ReasoningEffort', () => {
  it('knows the six values an OpenAI-compatible server takes', () => {
    expect([...reasoningEfforts]).toEqual(['none', 'minimal', 'low', 'medium', 'high', 'xhigh']);
    reasoningEfforts.forEach((effort) => {
      expect(reasoningEffortFromValue(effort)).toEqual(effort);
    });
  });

  it('rejects anything else, including near misses like mid and off', () => {
    ['mid', 'off', 'NONE', '', undefined, null, 3].forEach((value) => {
      expect(reasoningEffortFromValue(value)).toBeUndefined();
    });
  });

  it('names every effort for the settings dropdown', () => {
    expect(reasoningEffortName('none')).toEqual('None (thinking off)');
    expect(reasoningEffortName('xhigh')).toEqual('Extra high');
    reasoningEfforts.forEach((effort) => {
      expect(reasoningEffortName(effort)).not.toEqual('');
    });
  });

  it('takes the setting on the OpenAI-compatible provider only', () => {
    expect(supportsReasoningEffort(ApiType.OpenAI)).toBe(true);
    [ApiType.OpenRouter, ApiType.Gemini, ApiType.VLLM, ApiType.SentientSimsAI, ApiType.KoboldAI].forEach((apiType) => {
      expect(supportsReasoningEffort(apiType)).toBe(false);
    });
  });

  it('builds the request field, or nothing when unset or aimed at OpenRouter', () => {
    expect(reasoningEffortBody('none', false)).toEqual({ reasoning_effort: 'none' });
    expect(reasoningEffortBody(undefined, false)).toBeUndefined();
    expect(reasoningEffortBody('none', true)).toBeUndefined();
  });
});

describe('Reasoning effort on provider configs', () => {
  let ctx: ApiContext;

  beforeEach(() => {
    ctx = mockApiContext();
  });

  function addConfig(config: AIProviderConfig) {
    ctx.settings.aiProviderConfigs = [...ctx.settings.aiProviderConfigs, config];
  }

  it('keeps a valid effort on an OpenAI-compatible config', () => {
    ctx.settings.setSetting('aiProviderConfigs', [
      { id: 'lm', name: 'LM Studio', apiType: 'openai', model: 'gemma', reasoningEffort: 'none' },
    ]);

    expect(ctx.settings.aiProviderConfigs[0].reasoningEffort).toEqual('none');
  });

  it('drops an invalid effort, and an effort on a provider that does not take one', () => {
    ctx.settings.setSetting('aiProviderConfigs', [
      { id: 'bad', name: 'Bad', apiType: 'openai', reasoningEffort: 'mid' },
      { id: 'gemini', name: 'Gemini', apiType: 'gemini', reasoningEffort: 'none' },
    ]);

    const configs = ctx.settings.aiProviderConfigs;
    expect(configs).toHaveLength(2);
    expect(configs[0].reasoningEffort).toBeUndefined();
    expect(configs[1].reasoningEffort).toBeUndefined();
  });

  it('resolves the effort with the config', () => {
    addConfig({ id: 'lm', name: 'LM Studio', apiType: ApiType.OpenAI, model: 'gemma', reasoningEffort: 'none' });

    expect(ctx.providerConfigs.getResolvedConfig('lm').reasoningEffort).toEqual('none');
  });

  it('AIService classification stamps the config effort on the request', async () => {
    addConfig({ id: 'lm', name: 'LM Studio', apiType: ApiType.OpenAI, model: 'gemma', reasoningEffort: 'none' });
    ctx.settings.aiActionProviderOverrides = { [AIActionType.CLASSIFICATION]: 'lm' };
    const spy = vi
      .spyOn(ctx.getGenerationService(ApiType.OpenAI), 'sentientSimsGenerate')
      .mockResolvedValue({ text: 'happy', request: { messages: [], maxResponseTokens: 15 } });

    await ctx.ai.runClassification({ name: 'test', classifiers: ['happy', 'sad'], messages: ['a nice chat'] });

    expect(spy.mock.calls[0][0].reasoningEffort).toEqual('none');
  });

  it('AIService generate stamps the default config effort, and a config without one sends nothing', async () => {
    addConfig({ id: 'lm', name: 'LM Studio', apiType: ApiType.OpenAI, model: 'gemma', reasoningEffort: 'low' });
    addConfig({ id: 'plain', name: 'Plain', apiType: ApiType.OpenAI, model: 'gpt-4o-mini' });
    const spy = vi
      .spyOn(ctx.getGenerationService(ApiType.OpenAI), 'sentientSimsGenerate')
      .mockResolvedValue({ text: 'hi', request: { messages: [], maxResponseTokens: 90 } });

    ctx.settings.defaultAiProviderConfigId = 'lm';
    await ctx.ai.generate({ messages: [], maxResponseTokens: 90 });
    ctx.settings.defaultAiProviderConfigId = 'plain';
    await ctx.ai.generate({ messages: [], maxResponseTokens: 90 });

    expect(spy.mock.calls[0][0].reasoningEffort).toEqual('low');
    expect(spy.mock.calls[1][0].reasoningEffort).toBeUndefined();
  });
});
