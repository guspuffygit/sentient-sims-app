import { useQuery } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';
import { AIActionOverrides } from 'main/sentient-sims/models/AIActionType';
import { AIProviderConfig } from 'main/sentient-sims/models/AIProviderConfig';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { RateCard } from 'main/sentient-sims/models/UserInfo';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';
import { sentientSimsAIDefaultModel } from 'main/sentient-sims/constants';
import { useMembership } from 'renderer/hooks/useMembership';
import useSetting from 'renderer/hooks/useSetting';
import { useAuth } from 'renderer/providers/AuthProvider';
import { hasSlowLane, sentientSimsModelsInUse } from './membershipView';

const client = new SentientSimsAppClient();

export async function fetchRateCard(host: string): Promise<RateCard> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) {
    throw new Error('Sign in to see pricing');
  }
  return client.sentientSimsAiApi.getRateCard(token, host);
}

// The relative costs the AI server publishes; the card changes only with a deploy
export function useRateCard(enabled: boolean = true) {
  const { authStatus } = useAuth();
  const { endpoint } = useMembership();
  return useQuery({
    queryKey: ['rate_card', endpoint],
    queryFn: () => fetchRateCard(endpoint),
    enabled: enabled && authStatus === 'authenticated',
    staleTime: Infinity,
  });
}

// True when a Sentient Sims AI model in use has a cheaper slow route, so the lane matters
export function useSlowLane(): boolean {
  const card = useRateCard();
  const configs = useSetting<AIProviderConfig[]>(SettingsEnum.AI_PROVIDER_CONFIGS, []);
  const defaultId = useSetting<string>(SettingsEnum.DEFAULT_AI_PROVIDER_CONFIG_ID, '');
  const overrides = useSetting<AIActionOverrides>(SettingsEnum.AI_ACTION_PROVIDER_OVERRIDES, {});
  const legacyModel = useSetting<string>(SettingsEnum.SENTIENTSIMSAI_MODEL, sentientSimsAIDefaultModel);
  const models = sentientSimsModelsInUse(configs.value, defaultId.value, overrides.value, legacyModel.value);
  return models.some((model) => hasSlowLane(card.data, model));
}
