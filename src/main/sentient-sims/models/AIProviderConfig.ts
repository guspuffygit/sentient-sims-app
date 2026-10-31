import { ApiType, ApiTypeFromValue, ApiTypeName } from './ApiType';

export type AIProviderConfig = {
  id: string;
  name: string;
  apiType: ApiType;
  // undefined means "use the provider's globally configured model" so that
  // auto-created configs keep tracking the legacy per-provider model setting
  model?: string;
  // The most tokens one request may hold, prompt and reply together, when the server
  // is smaller than the model's own table says (a self-hosted endpoint with an input
  // cap). Undefined = the model's table entry, or the 3900 default.
  contextTokens?: number;
};

// A config with the model resolved against the provider-level model setting
export type ResolvedProviderConfig = {
  id: string;
  name: string;
  apiType: ApiType;
  model?: string;
  contextTokens?: number;
};

// Sim id -> provider config id. A Sim with an entry speaks and thinks through that config
// in every call made as them, ahead of the action and stage overrides.
export type SimProviderOverrides = Record<string, string>;

export function sanitizeSimProviderOverrides(value: unknown): SimProviderOverrides {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  const overrides: SimProviderOverrides = {};
  Object.entries(value as Record<string, unknown>).forEach(([simId, configId]) => {
    if (simId !== '' && typeof configId === 'string' && configId !== '') {
      overrides[simId] = configId;
    }
  });
  return overrides;
}

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

// Which provider an unset capability default (images, embeddings) follows: the main
// text provider when it supports the capability, otherwise the first capable provider
// the user has credentials for, otherwise OpenAI. Pure so the renderer can mirror the
// resolution when displaying the "Auto" choice.
export function deriveAutoApiType(
  mainApiType: ApiType,
  capableTypes: ApiType[],
  hasCredentials: (apiType: ApiType) => boolean,
): ApiType {
  // CustomAI endpoints share the Sentient Sims AI connection and services
  const main = mainApiType === ApiType.CustomAI ? ApiType.SentientSimsAI : mainApiType;
  if (capableTypes.includes(main)) {
    return main;
  }
  return capableTypes.find(hasCredentials) ?? ApiType.OpenAI;
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
    const { id, name, apiType, model, contextTokens } = item as Record<string, unknown>;
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
    if (typeof contextTokens === 'number' && Number.isInteger(contextTokens) && contextTokens > 0) {
      config.contextTokens = contextTokens;
    }
    configs.push(config);
  });

  return configs;
}
