import { ApiType, ApiTypeFromValue, ApiTypeName } from './ApiType';

export type AIProviderConfig = {
  id: string;
  name: string;
  apiType: ApiType;
  // undefined means "use the provider's globally configured model" so that
  // auto-created configs keep tracking the legacy per-provider model setting
  model?: string;
};

// A config with the model resolved against the provider-level model setting
export type ResolvedProviderConfig = {
  id: string;
  name: string;
  apiType: ApiType;
  model?: string;
};

export function autoConfigId(apiType: ApiType): string {
  return `auto-${apiType}`;
}

export function isAutoConfig(config: AIProviderConfig): boolean {
  return config.id === autoConfigId(config.apiType);
}

export function newAutoConfig(apiType: ApiType): AIProviderConfig {
  return {
    id: autoConfigId(apiType),
    name: ApiTypeName(apiType),
    apiType,
  };
}

export function sanitizeProviderConfigs(value: unknown): AIProviderConfig[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const configs: AIProviderConfig[] = [];
  value.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }
    const { id, name, apiType, model } = item as Record<string, unknown>;
    if (typeof id !== 'string' || id === '' || typeof name !== 'string') {
      return;
    }
    const config: AIProviderConfig = {
      id,
      name,
      apiType: ApiTypeFromValue(apiType),
    };
    if (typeof model === 'string' && model !== '') {
      config.model = model;
    }
    configs.push(config);
  });

  return configs;
}
