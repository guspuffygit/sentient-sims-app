import { AIProviderConfig, deriveAutoApiType, newAutoConfig, ResolvedProviderConfig } from '../models/AIProviderConfig';
import { ApiType, imageGenerationApiTypes } from '../models/ApiType';
import { defaultImageModelFor } from '../models/ImageGeneration';
import { ApiContext } from './ApiContext';

export class ImageProviderConfigService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  listConfigs(): AIProviderConfig[] {
    return this.ctx.settings.imageProviderConfigs;
  }

  getConfig(configId: string): AIProviderConfig | undefined {
    return this.listConfigs().find((config) => config.id === configId);
  }

  getDefaultConfig(): AIProviderConfig {
    return (
      this.getConfig(this.ctx.settings.defaultImageProviderConfigId) ??
      // Nothing chosen: follow the main provider so picking e.g. Sentient Sims AI
      // carries image generation along instead of silently pointing at OpenAI
      newAutoConfig(this.autoApiType())
    );
  }

  autoApiType(): ApiType {
    return deriveAutoApiType(this.ctx.settings.aiApiType, imageGenerationApiTypes, (apiType) =>
      this.ctx.settings.hasProviderCredentials(apiType),
    );
  }

  getResolvedConfig(configId?: string): ResolvedProviderConfig {
    const config = (configId ? this.getConfig(configId) : undefined) ?? this.getDefaultConfig();
    return {
      id: config.id,
      name: config.name,
      apiType: config.apiType,
      model: config.model ?? defaultImageModelFor(config.apiType),
    };
  }
}
