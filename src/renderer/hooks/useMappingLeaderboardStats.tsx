import { useQuery } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';
import { sentientSimsAIHost } from 'main/sentient-sims/constants';

export type UserAnimationInfo = {
  displayName: string;
  mappedCount: number;
};

export type UserInfo = {
  displayName?: string;
  id?: string;
};

export const sortByMappedCount = (a: UserAnimationInfo, b: UserAnimationInfo) => {
  return b.mappedCount - a.mappedCount;
};

export function useMappingLeaderboardStats() {
  const leaderboard = useQuery({
    queryKey: ['mappingLeaderboardData'],
    queryFn: async () => {
      const session = await fetchAuthSession();
      const jwtToken = session.tokens?.idToken?.toString();
      if (jwtToken) {
        return fetch(`${sentientSimsAIHost}/leaderboard`, {
          headers: {
            Authentication: jwtToken,
          },
        })
          .then((res) => res.json())
          .then((userAnimationStats: UserAnimationInfo[]) => {
            return userAnimationStats.sort(sortByMappedCount);
          });
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
        return fetch(`${sentientSimsAIHost}/me`, {
          headers: {
            Authentication: jwtToken,
          },
        })
          .then((res) => res.json())
          .then((userInfo: UserInfo) => {
            return userInfo;
          });
      }

      return {};
    },
  });

  async function setDisplayName(displayName: string) {
    const session = await fetchAuthSession();
    const jwtToken = session.tokens?.idToken?.toString();
    if (jwtToken) {
      return fetch(`${sentientSimsAIHost}/users`, {
        method: 'POST',
        headers: {
          Authentication: jwtToken,
        },
        body: JSON.stringify({ displayName }),
      }).then(() => {
        return Promise.all([me.refetch(), leaderboard.refetch()]);
      });
    }

    return [];
  }

  async function deleteDisplayName() {
    const session = await fetchAuthSession();
    const jwtToken = session.tokens?.idToken?.toString();

    if (jwtToken) {
      return fetch(`${sentientSimsAIHost}/users`, {
        method: 'DELETE',
        headers: {
          Authentication: jwtToken,
        },
      }).then(() => {
        return Promise.all([me.refetch(), leaderboard.refetch()]);
      });
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
