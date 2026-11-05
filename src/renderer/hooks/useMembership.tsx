import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { UserInfo } from 'main/sentient-sims/models/UserInfo';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';
import { defaultSentientSimsAIHost } from 'main/sentient-sims/constants';
import { Membership } from 'main/sentient-sims/wrappers/Membership';
import { useAuth } from 'renderer/providers/AuthProvider';
import { meQueryKey, meQueryKeyFor } from 'renderer/billing/meQuery';
import useSetting from './useSetting';

export { meQueryKey } from 'renderer/billing/meQuery';

const client = new SentientSimsAppClient();

// The usage header keeps the meter current during play; the poll only catches a plan
// change made on Patreon while the app is open
const refetchMs = 5 * 60 * 1000;

export async function fetchMe(host: string): Promise<UserInfo> {
  const session = await fetchAuthSession();
  const jwtToken = session.tokens?.idToken?.toString();
  if (!jwtToken) {
    return {};
  }
  return client.sentientSimsAiApi.getMe(jwtToken, host);
}

export function useMembership() {
  const { userAttributes, authStatus } = useAuth();
  const endpoint = useSetting(SettingsEnum.SENTIENTSIMSAI_ENDPOINT, defaultSentientSimsAIHost);
  const queryClient = useQueryClient();

  const sub = userAttributes?.sub;
  const me = useQuery({
    queryKey: meQueryKeyFor(endpoint.value, sub),
    enabled: authStatus === 'authenticated' && !!sub,
    queryFn: () => fetchMe(endpoint.value),
    refetchInterval: refetchMs,
    refetchIntervalInBackground: false,
  });

  const info = me.data?.membership;
  const membership = useMemo(() => new Membership(userAttributes, info), [userAttributes, info]);

  const refresh = useCallback(() => queryClient.invalidateQueries({ queryKey: meQueryKey }), [queryClient]);

  return {
    membership,
    info,
    me,
    endpoint: endpoint.value,
    refresh,
  };
}
