import { AIProviderConfig } from 'main/sentient-sims/models/AIProviderConfig';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import {
  geminiDefaultEmbeddingModel,
  openaiDefaultEmbeddingModel,
  sentientSimsAIDefaultEmbeddingModel,
} from 'main/sentient-sims/constants';
import { GeminiEmbeddingService } from 'main/sentient-sims/services/GeminiEmbeddingService';
import { NoopEmbeddingService } from 'main/sentient-sims/services/EmbeddingService';
import { SentientSimsEmbeddingService } from 'main/sentient-sims/services/SentientSimsEmbeddingService';
import { mockApiContext } from './util';

describe('Embedding Provider Configs', () => {
  let ctx: ApiContext;

  beforeEach(() => {
    ctx = mockApiContext();
  });

  function addConfig(config: AIProviderConfig) {
    ctx.settings.embeddingProviderConfigs = [...ctx.settings.embeddingProviderConfigs, config];
  }

  it('falls back to OpenAI with the default embedding model when nothing is configured', () => {
    const resolved = ctx.embeddingProviderConfigs.getResolvedConfig();
    expect(resolved.apiType).toEqual(ApiType.OpenAI);
    expect(resolved.model).toEqual(openaiDefaultEmbeddingModel);
  });

  it('Auto follows the main provider when it supports embeddings', () => {
    ctx.settings.aiApiType = ApiType.SentientSimsAI;

    const resolved = ctx.embeddingProviderConfigs.getResolvedConfig();
    expect(resolved.apiType).toEqual(ApiType.SentientSimsAI);
    expect(resolved.model).toEqual(sentientSimsAIDefaultEmbeddingModel);
  });

  it('Auto treats a CustomAI main provider as Sentient Sims AI', () => {
    ctx.settings.aiApiType = ApiType.CustomAI;

    expect(ctx.embeddingProviderConfigs.getResolvedConfig().apiType).toEqual(ApiType.SentientSimsAI);
  });

  it('Auto falls back to the first embedding-capable provider with credentials', () => {
    ctx.settings.aiApiType = ApiType.KoboldAI;
    ctx.settings.geminiKeys = 'key';

    expect(ctx.embeddingProviderConfigs.getResolvedConfig().apiType).toEqual(ApiType.Gemini);

    ctx.settings.openaiKey = 'sk-key';
    expect(ctx.embeddingProviderConfigs.getResolvedConfig().apiType).toEqual(ApiType.OpenAI);
  });

  it('Auto falls back to OpenAI when no embedding-capable provider has credentials', () => {
    ctx.settings.aiApiType = ApiType.KoboldAI;

    expect(ctx.embeddingProviderConfigs.getResolvedConfig().apiType).toEqual(ApiType.OpenAI);
  });

  it('a chosen default config wins over Auto derivation', () => {
    ctx.settings.aiApiType = ApiType.SentientSimsAI;
    addConfig({ id: 'gemini', name: 'Gemini', apiType: ApiType.Gemini });
    ctx.settings.defaultEmbeddingProviderConfigId = 'gemini';

    const resolved = ctx.embeddingProviderConfigs.getResolvedConfig();
    expect(resolved.apiType).toEqual(ApiType.Gemini);
    expect(resolved.model).toEqual(geminiDefaultEmbeddingModel);
  });

  it('resolves the pinned model and falls back to default for stale ids', () => {
    addConfig({ id: 'large', name: 'Large', apiType: ApiType.OpenAI, model: 'text-embedding-3-large' });
    ctx.settings.defaultEmbeddingProviderConfigId = 'large';

    expect(ctx.embeddingProviderConfigs.getResolvedConfig().model).toEqual('text-embedding-3-large');
    expect(ctx.embeddingProviderConfigs.getResolvedConfig('does-not-exist').model).toEqual('text-embedding-3-large');
  });

  it('deleting the default config falls back to Auto', () => {
    addConfig({ id: 'keep', name: 'Keep', apiType: ApiType.OpenAI });
    addConfig({ id: 'remove', name: 'Remove', apiType: ApiType.Gemini });
    ctx.settings.defaultEmbeddingProviderConfigId = 'remove';

    ctx.settings.embeddingProviderConfigs = ctx.settings.embeddingProviderConfigs.filter(
      (config) => config.id !== 'remove',
    );

    expect(ctx.settings.defaultEmbeddingProviderConfigId).toEqual('');
  });

  it('sanitizes malformed embedding provider configs', () => {
    ctx.settings.setSetting('embeddingProviderConfigs', [
      { id: 'valid', name: 'Valid', apiType: 'openai' },
      { name: 'missing id', apiType: 'openai' },
    ]);

    const configs = ctx.settings.embeddingProviderConfigs;
    expect(configs).toHaveLength(1);
    expect(configs[0].id).toEqual('valid');
  });

  describe('modelFor keys each provider service', () => {
    it('applies the pinned model only to the selected provider', () => {
      addConfig({ id: 'large', name: 'Large', apiType: ApiType.OpenAI, model: 'text-embedding-3-large' });
      ctx.settings.defaultEmbeddingProviderConfigId = 'large';

      expect(ctx.embeddingProviderConfigs.modelFor(ApiType.OpenAI)).toEqual('text-embedding-3-large');
      expect(ctx.embeddingProviderConfigs.modelFor(ApiType.Gemini)).toEqual(geminiDefaultEmbeddingModel);
      expect(ctx.embeddingProviderConfigs.modelFor(ApiType.SentientSimsAI)).toEqual(
        sentientSimsAIDefaultEmbeddingModel,
      );
    });

    it('service model getters reflect the resolved config', () => {
      ctx.settings.aiApiType = ApiType.SentientSimsAI;

      expect(ctx.getEmbeddingService(ApiType.OpenAI).model).toEqual(openaiDefaultEmbeddingModel);
      expect(ctx.getEmbeddingService(ApiType.SentientSimsAI).model).toEqual(sentientSimsAIDefaultEmbeddingModel);
      expect(ctx.getEmbeddingService(ApiType.Gemini).model).toEqual(geminiDefaultEmbeddingModel);

      addConfig({ id: 'pinned', name: 'Pinned', apiType: ApiType.SentientSimsAI, model: 'custom/embedder' });
      ctx.settings.defaultEmbeddingProviderConfigId = 'pinned';

      expect(ctx.getEmbeddingService(ApiType.SentientSimsAI).model).toEqual('custom/embedder');
    });

    it('a CustomAI config keys the Sentient Sims embedding service', () => {
      addConfig({ id: 'custom', name: 'Custom', apiType: ApiType.CustomAI, model: 'custom/embedder' });
      ctx.settings.defaultEmbeddingProviderConfigId = 'custom';

      expect(ctx.embeddingProviderConfigs.modelFor(ApiType.SentientSimsAI)).toEqual('custom/embedder');
    });
  });

  describe('ctx.embedding routing', () => {
    it('routes to the resolved provider service when it has credentials', () => {
      ctx.settings.aiApiType = ApiType.Gemini;
      ctx.settings.geminiKeys = 'key';

      expect(ctx.embedding).toBeInstanceOf(GeminiEmbeddingService);
    });

    it('routes CustomAI mains to the Sentient Sims embedding service', () => {
      ctx.settings.aiApiType = ApiType.CustomAI;
      ctx.settings.accessToken = 'token';

      expect(ctx.embedding).toBeInstanceOf(SentientSimsEmbeddingService);
    });

    it('is noop when the resolved provider has no credentials', () => {
      addConfig({ id: 'gemini', name: 'Gemini', apiType: ApiType.Gemini });
      ctx.settings.defaultEmbeddingProviderConfigId = 'gemini';

      expect(ctx.embedding).toBeInstanceOf(NoopEmbeddingService);
    });
  });

  describe('legacy embeddingApiType migration', () => {
    it('seeds a pinned config from a non-default legacy selection', () => {
      ctx.settings.embeddingApiType = ApiType.SentientSimsAI;

      ctx.settings.runMigrations();

      const configs = ctx.settings.embeddingProviderConfigs;
      expect(configs).toHaveLength(1);
      expect(configs[0].apiType).toEqual(ApiType.SentientSimsAI);
      expect(configs[0].model).toEqual(sentientSimsAIDefaultEmbeddingModel);
      expect(ctx.settings.defaultEmbeddingProviderConfigId).toEqual(configs[0].id);
    });

    it('leaves the OpenAI legacy default unseeded so Auto applies', () => {
      ctx.settings.runMigrations();

      expect(ctx.settings.embeddingProviderConfigs).toHaveLength(0);
      expect(ctx.settings.defaultEmbeddingProviderConfigId).toEqual('');
    });

    it('does not overwrite existing embedding configs', () => {
      ctx.settings.embeddingApiType = ApiType.Gemini;
      addConfig({ id: 'existing', name: 'Existing', apiType: ApiType.OpenAI });
      ctx.settings.defaultEmbeddingProviderConfigId = 'existing';

      ctx.settings.runMigrations();

      expect(ctx.settings.embeddingProviderConfigs).toHaveLength(1);
      expect(ctx.settings.embeddingProviderConfigs[0].id).toEqual('existing');
    });
  });
});
