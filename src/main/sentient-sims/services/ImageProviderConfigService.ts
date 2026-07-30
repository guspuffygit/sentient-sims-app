import { AIProviderConfig, newAutoConfig, ResolvedProviderConfig } from '../models/AIProviderConfig';
import { ApiType } from '../models/ApiType';
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
      // Nothing configured yet: OpenAI with its default image model
      newAutoConfig(ApiType.OpenAI)
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
