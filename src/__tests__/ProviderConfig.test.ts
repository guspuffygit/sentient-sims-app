import { vi } from 'vitest';
import { AIActionType } from 'main/sentient-sims/models/AIActionType';
import { AIProviderConfig, autoConfigId } from 'main/sentient-sims/models/AIProviderConfig';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { GeminiService } from 'main/sentient-sims/services/GeminiService';
import { OpenAIService } from 'main/sentient-sims/services/OpenAIService';
import { SentientSimsAIService } from 'main/sentient-sims/services/SentientSimsAIService';
import { VLLMAIService } from 'main/sentient-sims/services/VLLMAIService';
import { LLaMaTokenCounter } from 'main/sentient-sims/tokens/LLaMaTokenCounter';
import { OpenAITokenCounter } from 'main/sentient-sims/tokens/OpenAITokenCounter';
import { mockApiContext } from './util';

describe('Provider Configs', () => {
  let ctx: ApiContext;

  beforeEach(() => {
    ctx = mockApiContext();
  });

  function addConfig(config: AIProviderConfig) {
    ctx.settings.aiProviderConfigs = [...ctx.settings.aiProviderConfigs, config];
  }

  it('runMigrations seeds a default config from the legacy api type', () => {
    ctx.settings.aiApiType = ApiType.Gemini;
    ctx.settings.aiProviderConfigs = [];
    ctx.settings.defaultAiProviderConfigId = '';

    ctx.settings.runMigrations();

    const configs = ctx.settings.aiProviderConfigs;
    expect(configs).toHaveLength(1);
    expect(configs[0].id).toEqual(autoConfigId(ApiType.Gemini));
    expect(configs[0].apiType).toEqual(ApiType.Gemini);
    expect(ctx.settings.defaultAiProviderConfigId).toEqual(autoConfigId(ApiType.Gemini));
  });

  it('setting the legacy api type creates and selects an auto config', () => {
    ctx.settings.aiApiType = ApiType.NovelAI;

    expect(ctx.settings.defaultAiProviderConfigId).toEqual(autoConfigId(ApiType.NovelAI));
    expect(ctx.settings.aiProviderConfigs.some((config) => config.id === autoConfigId(ApiType.NovelAI))).toBeTruthy();
  });

  it('setting the default config id syncs the legacy api type', () => {
    addConfig({ id: 'custom-vllm', name: 'Local VLLM', apiType: ApiType.VLLM, model: 'my-model' });

    ctx.settings.defaultAiProviderConfigId = 'custom-vllm';

    expect(ctx.settings.aiApiType).toEqual(ApiType.VLLM);
    // the custom config stays default, no auto config takes over
    expect(ctx.settings.defaultAiProviderConfigId).toEqual('custom-vllm');
  });

  it('legacy api type set leaves default alone when default already matches type', () => {
    addConfig({ id: 'custom-openai', name: 'OpenAI 4.1', apiType: ApiType.OpenAI, model: 'gpt-4.1-2025-04-14' });
    ctx.settings.defaultAiProviderConfigId = 'custom-openai';

    ctx.settings.aiApiType = ApiType.OpenAI;

    expect(ctx.settings.defaultAiProviderConfigId).toEqual('custom-openai');
  });

  it('default config resolution falls back to legacy api type when nothing is configured', () => {
    ctx.settings.aiApiType = ApiType.KoboldAI;
    ctx.settings.aiProviderConfigs = [];

    const resolved = ctx.providerConfigs.getConfigForAction(AIActionType.CHAT);
    expect(resolved.apiType).toEqual(ApiType.KoboldAI);
  });

  it('resolves pinned model over the provider model setting', () => {
    ctx.settings.openaiModel = 'gpt-4o-mini';
    addConfig({ id: 'pinned', name: 'Pinned', apiType: ApiType.OpenAI, model: 'gpt-4.1-2025-04-14' });
    ctx.settings.defaultAiProviderConfigId = 'pinned';

    const resolved = ctx.providerConfigs.getConfigForAction();
    expect(resolved.model).toEqual('gpt-4.1-2025-04-14');
  });

  it('resolves provider model setting when config does not pin a model', () => {
    ctx.settings.aiApiType = ApiType.OpenAI;
    ctx.settings.openaiModel = 'gpt-4o-mini';

    const resolved = ctx.providerConfigs.getConfigForAction();
    expect(resolved.model).toEqual('gpt-4o-mini');
  });

  it('per-action override routes to the override config', () => {
    ctx.settings.aiApiType = ApiType.OpenAI;
    addConfig({ id: 'classification', name: 'Classifier', apiType: ApiType.VLLM, model: 'small-model' });
    ctx.settings.aiActionProviderOverrides = {
      [AIActionType.CLASSIFICATION]: 'classification',
    };

    const classification = ctx.providerConfigs.getConfigForAction(AIActionType.CLASSIFICATION);
    expect(classification.apiType).toEqual(ApiType.VLLM);
    expect(classification.model).toEqual('small-model');

    const chat = ctx.providerConfigs.getConfigForAction(AIActionType.CHAT);
    expect(chat.apiType).toEqual(ApiType.OpenAI);
  });

  it('deleting a config prunes the default id and overrides', () => {
    ctx.settings.aiApiType = ApiType.OpenAI;
    addConfig({ id: 'gemini-config', name: 'Gemini', apiType: ApiType.Gemini });
    ctx.settings.aiActionProviderOverrides = {
      [AIActionType.BUFF]: 'gemini-config',
    };
    ctx.settings.defaultAiProviderConfigId = 'gemini-config';

    ctx.settings.aiProviderConfigs = ctx.settings.aiProviderConfigs.filter((config) => config.id !== 'gemini-config');

    expect(ctx.settings.defaultAiProviderConfigId).not.toEqual('gemini-config');
    expect(ctx.settings.aiActionProviderOverrides[AIActionType.BUFF]).toBeUndefined();
    // default fell back to a remaining config and the legacy api type follows it
    const fallbackDefault = ctx.providerConfigs.getDefaultConfig();
    expect(ctx.settings.aiApiType).toEqual(fallbackDefault.apiType);
  });

  it('override falls back to default when the override id is stale', () => {
    ctx.settings.aiApiType = ApiType.OpenAI;
    // bypass the prune by writing an override for a config that never existed
    ctx.settings.aiActionProviderOverrides = {
      [AIActionType.WANTS]: 'does-not-exist',
    };

    const resolved = ctx.providerConfigs.getConfigForAction(AIActionType.WANTS);
    expect(resolved.apiType).toEqual(ApiType.OpenAI);
  });

  it('getGenerationService routes by api type', () => {
    expect(ctx.getGenerationService(ApiType.OpenAI) instanceof OpenAIService).toBeTruthy();
    expect(ctx.getGenerationService(ApiType.Gemini) instanceof GeminiService).toBeTruthy();
    expect(ctx.getGenerationService(ApiType.SentientSimsAI) instanceof SentientSimsAIService).toBeTruthy();
    expect(ctx.getGenerationService(ApiType.CustomAI) instanceof SentientSimsAIService).toBeTruthy();
    // SentientSimsAIService extends VLLMAIService, check VLLM maps to the base service
    const vllmService = ctx.getGenerationService(ApiType.VLLM);
    expect(vllmService instanceof VLLMAIService).toBeTruthy();
    expect(vllmService instanceof SentientSimsAIService).toBeFalsy();
  });

  it('genai and tokenCounter follow the default config, not just the legacy setting', () => {
    addConfig({ id: 'openai-config', name: 'OpenAI', apiType: ApiType.OpenAI });
    ctx.settings.defaultAiProviderConfigId = 'openai-config';

    expect(ctx.genai instanceof OpenAIService).toBeTruthy();
    expect(ctx.tokenCounter instanceof OpenAITokenCounter).toBeTruthy();

    addConfig({ id: 'ss-config', name: 'Sentient Sims', apiType: ApiType.SentientSimsAI });
    ctx.settings.defaultAiProviderConfigId = 'ss-config';

    expect(ctx.genai instanceof SentientSimsAIService).toBeTruthy();
    expect(ctx.tokenCounter instanceof LLaMaTokenCounter).toBeTruthy();
  });

  it('model settings lookup uses the requested model without touching the network for non sentient sims providers', async () => {
    const settings = await ctx.modelSettings.getModelSettings('gpt-4.1-2025-04-14', ApiType.OpenAI);
    expect(settings.max_tokens).toEqual(32000);

    const fallback = await ctx.modelSettings.getModelSettings('unknown-model', ApiType.OpenAI);
    expect(fallback.max_tokens).toEqual(3900);
  });

  it('AIService routes classification to the override provider and stamps model and api type', async () => {
    ctx.settings.aiApiType = ApiType.VLLM;
    addConfig({ id: 'openai-cls', name: 'Classifier', apiType: ApiType.OpenAI, model: 'gpt-4o-mini' });
    ctx.settings.aiActionProviderOverrides = {
      [AIActionType.CLASSIFICATION]: 'openai-cls',
    };

    const openAIService = ctx.getGenerationService(ApiType.OpenAI);
    const vllmService = ctx.getGenerationService(ApiType.VLLM);
    const openAISpy = vi
      .spyOn(openAIService, 'sentientSimsGenerate')
      .mockResolvedValue({ text: 'happy', request: { messages: [], maxResponseTokens: 15 } });
    const vllmSpy = vi.spyOn(vllmService, 'sentientSimsGenerate');

    const result = await ctx.ai.runClassification({
      name: 'test',
      classifiers: ['happy', 'sad'],
      messages: ['they had a great conversation'],
    });

    expect(vllmSpy).not.toHaveBeenCalled();
    expect(openAISpy).toHaveBeenCalledOnce();
    const request = openAISpy.mock.calls[0][0];
    expect(request.model).toEqual('gpt-4o-mini');
    expect(request.apiType).toEqual(ApiType.OpenAI);
    expect(result.status).toEqual(InteractionEventStatus.CLASSIFIED);
    expect(result.text).toEqual('happy');
  });

  it('AIService generate uses the default config when no override exists', async () => {
    addConfig({ id: 'gemini-default', name: 'Gemini', apiType: ApiType.Gemini, model: 'gemini-2.0-flash-exp' });
    ctx.settings.defaultAiProviderConfigId = 'gemini-default';

    const geminiService = ctx.getGenerationService(ApiType.Gemini);
    const geminiSpy = vi
      .spyOn(geminiService, 'sentientSimsGenerate')
      .mockResolvedValue({ text: 'generated', request: { messages: [], maxResponseTokens: 90 } });

    const response = await ctx.ai.generate({ messages: [], maxResponseTokens: 90 });

    expect(geminiSpy).toHaveBeenCalledOnce();
    const request = geminiSpy.mock.calls[0][0];
    expect(request.model).toEqual('gemini-2.0-flash-exp');
    expect(request.apiType).toEqual(ApiType.Gemini);
    expect(response.text).toEqual('generated');
  });

  it('sanitizes malformed provider configs', () => {
    ctx.settings.setSetting('aiProviderConfigs', [
      { id: 'valid', name: 'Valid', apiType: 'openai' },
      { name: 'missing id', apiType: 'openai' },
    ]);

    const configs = ctx.settings.aiProviderConfigs;
    expect(configs).toHaveLength(1);
    expect(configs[0].id).toEqual('valid');
  });
});
