import { ApiType } from 'main/sentient-sims/models/ApiType';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import {
  defaultVLLMEndpoint,
  geminiDefaultEndpoint,
  koboldaiDefaultEndpoint,
  novelaiDefaultEndpoint,
  openaiDefaultEndpoint,
} from 'main/sentient-sims/constants';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import { useAuth } from 'renderer/providers/AuthProvider';
import useSetting from './useSetting';

export type ProviderConnectionStatus = {
  // All required connection fields are present. This is a configuration
  // completeness check, not a reachability check - use Test for that.
  ready: boolean;
  loading: boolean;
  // Short status for chips, e.g. "Ready", "No API key", "Login required"
  label: string;
};

export function useProviderConnectionStatus(apiType: ApiType): ProviderConnectionStatus {
  // Hooks must run unconditionally, so subscribe to every provider's
  // connection settings and pick per apiType below
  const openaiKey = useSetting(SettingsEnum.OPENAI_KEY, '');
  const openaiEndpoint = useSetting(SettingsEnum.OPENAI_ENDPOINT, openaiDefaultEndpoint);
  const novelaiKey = useSetting(SettingsEnum.NOVELAI_KEY, '');
  const novelaiEndpoint = useSetting(SettingsEnum.NOVELAI_ENDPOINT, novelaiDefaultEndpoint);
  const geminiKeys = useSetting(SettingsEnum.GEMINI_KEYS, '');
  const geminiEndpoint = useSetting(SettingsEnum.GEMINI_ENDPOINT, geminiDefaultEndpoint);
  const vllmEndpoint = useSetting(SettingsEnum.VLLM_ENDPOINT, defaultVLLMEndpoint);
  const koboldEndpoint = useSetting(SettingsEnum.KOBOLDAI_ENDPOINT, koboldaiDefaultEndpoint);
  const { userAttributes } = useAuth();

  function keyStatus(key: SettingsHookLike, endpoint: SettingsHookLike): ProviderConnectionStatus {
    const loading = key.isLoading || endpoint.isLoading;
    if (endpoint.value.trim() === '') {
      return { ready: false, loading, label: 'No endpoint' };
    }
    if (key.value.trim() === '') {
      return { ready: false, loading, label: 'No API key' };
    }
    return { ready: true, loading, label: 'Ready' };
  }

  function endpointStatus(endpoint: SettingsHookLike): ProviderConnectionStatus {
    if (endpoint.value.trim() === '') {
      return { ready: false, loading: endpoint.isLoading, label: 'No endpoint' };
    }
    return { ready: true, loading: endpoint.isLoading, label: 'Ready' };
  }

  switch (apiType) {
    case ApiType.OpenAI:
      return keyStatus(openaiKey, openaiEndpoint);
    case ApiType.NovelAI:
      return keyStatus(novelaiKey, novelaiEndpoint);
    case ApiType.Gemini:
      return keyStatus(geminiKeys, geminiEndpoint);
    case ApiType.VLLM:
      // API key is optional for VLLM servers
      return endpointStatus(vllmEndpoint);
    case ApiType.KoboldAI:
      return endpointStatus(koboldEndpoint);
    case ApiType.SentientSimsAI:
    case ApiType.CustomAI: {
      if (!userAttributes) {
        return { ready: false, loading: false, label: 'Login required' };
      }
      if (!new PatreonUser(userAttributes).isMember()) {
        return { ready: false, loading: false, label: 'Patreon membership required' };
      }
      return { ready: true, loading: false, label: 'Connected' };
    }
    default:
      return { ready: true, loading: false, label: 'Ready' };
  }
}

type SettingsHookLike = {
  value: string;
  isLoading: boolean;
};
