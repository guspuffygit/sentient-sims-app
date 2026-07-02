import { AIActionType } from '../models/AIActionType';
import { AIProviderConfig, newAutoConfig, ResolvedProviderConfig } from '../models/AIProviderConfig';
import { ApiType } from '../models/ApiType';
import { ApiContext } from './ApiContext';

export class ProviderConfigService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  listConfigs(): AIProviderConfig[] {
    return this.ctx.settings.aiProviderConfigs;
  }

  getConfig(configId: string): AIProviderConfig | undefined {
    return this.listConfigs().find((config) => config.id === configId);
  }

  getDefaultConfig(): AIProviderConfig {
    return (
      this.getConfig(this.ctx.settings.defaultAiProviderConfigId) ??
      // Nothing configured yet: behave exactly like the legacy single-provider selection
      newAutoConfig(this.ctx.settings.aiApiType)
    );
  }

  getResolvedConfig(configId?: string): ResolvedProviderConfig {
    const config = (configId ? this.getConfig(configId) : undefined) ?? this.getDefaultConfig();
    return this.resolve(config);
  }

  getConfigForAction(actionType?: AIActionType): ResolvedProviderConfig {
    const overrideId = actionType ? this.ctx.settings.aiActionProviderOverrides[actionType] : undefined;
    return this.getResolvedConfig(overrideId);
  }

  resolve(config: AIProviderConfig): ResolvedProviderConfig {
    return {
      id: config.id,
      name: config.name,
      apiType: config.apiType,
      model: config.model ?? this.providerModel(config.apiType),
    };
  }

  // Safety net for configs that predate model pinning (or were sanitized):
  // fall back to the legacy per-provider model setting.
  providerModel(apiType: ApiType): string | undefined {
    return this.ctx.settings.providerModel(apiType);
  }
}
