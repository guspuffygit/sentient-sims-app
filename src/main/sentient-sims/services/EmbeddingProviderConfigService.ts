import { openaiDefaultEmbeddingModel } from '../constants';
import { AIProviderConfig, deriveAutoApiType, newAutoConfig, ResolvedProviderConfig } from '../models/AIProviderConfig';
import { ApiType, embeddingApiTypes } from '../models/ApiType';
import { defaultEmbeddingModelFor } from '../models/EmbeddingModels';
import { ApiContext } from './ApiContext';

export class EmbeddingProviderConfigService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  listConfigs(): AIProviderConfig[] {
    return this.ctx.settings.embeddingProviderConfigs;
  }

  getConfig(configId: string): AIProviderConfig | undefined {
    return this.listConfigs().find((config) => config.id === configId);
  }

  getDefaultConfig(): AIProviderConfig {
    return (
      this.getConfig(this.ctx.settings.defaultEmbeddingProviderConfigId) ??
      // Nothing chosen: follow the main provider so picking e.g. Sentient Sims AI
      // carries embeddings along instead of silently pointing at OpenAI
      newAutoConfig(this.autoApiType())
    );
  }

  autoApiType(): ApiType {
    return deriveAutoApiType(this.ctx.settings.aiApiType, embeddingApiTypes, (apiType) =>
      this.ctx.settings.hasProviderCredentials(apiType),
    );
  }

  getResolvedConfig(configId?: string): ResolvedProviderConfig {
    const config = (configId ? this.getConfig(configId) : undefined) ?? this.getDefaultConfig();
    return {
      id: config.id,
      name: config.name,
      apiType: config.apiType,
      model: config.model ?? this.defaultModelFor(config.apiType),
    };
  }

  // The model a provider's embedding service should use: the selected config's
  // pinned model when that provider is the one selected, the provider default
  // otherwise. Embeddings are keyed by model, so this is also the retrieval key.
  modelFor(apiType: ApiType): string {
    const resolved = this.getResolvedConfig();
    const resolvedType = resolved.apiType === ApiType.CustomAI ? ApiType.SentientSimsAI : resolved.apiType;
    if (resolvedType === apiType && resolved.model) {
      return resolved.model;
    }
    return this.defaultModelFor(apiType);
  }

  private defaultModelFor(apiType: ApiType): string {
    if (apiType === ApiType.SentientSimsAI || apiType === ApiType.CustomAI) {
      // Legacy per-provider model setting kept as the unpinned-model fallback
      return this.ctx.settings.sentientSimsAIEmbeddingModel;
    }
    return defaultEmbeddingModelFor(apiType) ?? openaiDefaultEmbeddingModel;
  }
}
