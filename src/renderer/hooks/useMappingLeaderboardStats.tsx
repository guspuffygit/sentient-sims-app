import { useQuery } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';
import useSetting from './useSetting';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { UserMappingInfo } from 'main/sentient-sims/models/UserMappingInfo';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';
import { defaultSentientSimsAIHost } from 'main/sentient-sims/constants';

export const sortByMappedCount = (a: UserMappingInfo, b: UserMappingInfo) => {
  return b.mappedCount - a.mappedCount;
};

const client = new SentientSimsAppClient();

export function useMappingLeaderboardStats() {
  const sentientSimsAiEndpoint = useSetting(SettingsEnum.SENTIENTSIMSAI_ENDPOINT, defaultSentientSimsAIHost);

  const leaderboard = useQuery({
    queryKey: ['mappingLeaderboardData'],
    queryFn: async () => {
      const session = await fetchAuthSession();
      const jwtToken = session.tokens?.idToken?.toString();
      if (jwtToken) {
        const response = await client.sentientSimsAiApi.getMappingLeaderboard(jwtToken, sentientSimsAiEndpoint.value);
        response.sort(sortByMappedCount);
        return response;
      }

      return [];
    },
  });

  const me = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const session = await fetchAuthSession();
      const jwtToken = session.tokens?.idToken?.toString();

      if (jwtToken) {
        return await client.sentientSimsAiApi.getMe(jwtToken, sentientSimsAiEndpoint.value);
      }

      return {};
    },
  });

  async function setDisplayName(displayName: string) {
    const session = await fetchAuthSession();
    const jwtToken = session.tokens?.idToken?.toString();
    if (jwtToken) {
      await client.sentientSimsAiApi.setDisplayName({ displayName }, jwtToken, sentientSimsAiEndpoint.value);

      return Promise.all([me.refetch(), leaderboard.refetch()]);
    }

    return [];
  }

  async function deleteDisplayName() {
    const session = await fetchAuthSession();
    const jwtToken = session.tokens?.idToken?.toString();

    if (jwtToken) {
      await client.sentientSimsAiApi.deleteDisplayName(jwtToken, sentientSimsAiEndpoint.value);

      return Promise.all([me.refetch(), leaderboard.refetch()]);
    }

    return [];
  }

  return {
    leaderboard,
    me,
    setDisplayName,
    deleteDisplayName,
  };
}
