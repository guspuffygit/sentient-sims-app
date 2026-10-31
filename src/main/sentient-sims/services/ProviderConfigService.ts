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

  // The config one Sim is pinned to, if any (a stale id counts as none)
  getConfigForSim(simId?: string): ResolvedProviderConfig | undefined {
    const configId = simId ? this.ctx.settings.aiSimProviderOverrides[simId] : undefined;
    const config = configId ? this.getConfig(configId) : undefined;
    return config ? this.resolve(config) : undefined;
  }

  /**
   * A directed scene runs as several stages (director, actors, reviewer) that can each be
   * pointed at their own provider. A stage with no override of its own inherits the one set
   * for the interaction that started the scene, so overriding a single action still covers
   * every AI call that action makes. A Sim's SPOKEN line (the actor call made as them)
   * goes to that Sim's own config first, ahead of every other override.
   */
  getConfigForDirectedStage(stage: AIActionType, interaction?: AIActionType, simId?: string): ResolvedProviderConfig {
    const simConfig = this.getConfigForSim(simId);
    if (simConfig) {
      return simConfig;
    }
    const overrides = this.ctx.settings.aiActionProviderOverrides;
    // A sexual act stays on the provider picked for Wicked Whims at every stage: that pick
    // is about who may write explicit content, which a stage's own pick never considered
    if (interaction === AIActionType.WICKED_WHIMS && overrides[interaction]) {
      return this.getResolvedConfig(overrides[interaction]);
    }
    return this.getResolvedConfig(overrides[stage] ?? (interaction ? overrides[interaction] : undefined));
  }

  resolve(config: AIProviderConfig): ResolvedProviderConfig {
    return {
      id: config.id,
      name: config.name,
      apiType: config.apiType,
      model: config.model ?? this.providerModel(config.apiType),
      contextTokens: config.contextTokens,
    };
  }

  // Safety net for configs that predate model pinning (or were sanitized):
  // fall back to the legacy per-provider model setting.
  providerModel(apiType: ApiType): string | undefined {
    return this.ctx.settings.providerModel(apiType);
  }
}
