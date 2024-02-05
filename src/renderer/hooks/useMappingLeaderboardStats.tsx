import { useQuery } from '@tanstack/react-query';
import { Auth } from 'aws-amplify';

export type UserAnimationInfo = {
  displayName: string;
  mappedCount: number;
};

export type UserInfo = {
  displayName?: string;
  id?: string;
};

const sortByMappedCount = (a: UserAnimationInfo, b: UserAnimationInfo) => {
  return b.mappedCount - a.mappedCount;
};

export function useMappingLeaderboardStats() {
  const leaderboard = useQuery({
    queryKey: ['mappingLeaderboardData'],
    queryFn: async () => {
      const session = await Auth.currentSession();
      const jwtToken = session.getIdToken().getJwtToken();

      return fetch(`https://ai.sentientsimulations.com/leaderboard`, {
        headers: {
          Authentication: jwtToken,
        },
      })
        .then((res) => res.json())
        .then((userAnimationStats: UserAnimationInfo[]) => {
          return userAnimationStats.sort(sortByMappedCount);
        });
    },
  });

  const me = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const session = await Auth.currentSession();
      const jwtToken = session.getIdToken().getJwtToken();

      return fetch(`https://ai.sentientsimulations.com/me`, {
        headers: {
          Authentication: jwtToken,
        },
      })
        .then((res) => res.json())
        .then((userInfo: UserInfo) => {
          return userInfo;
        });
    },
  });

  async function setDisplayName(displayName: string) {
    const session = await Auth.currentSession();
    const jwtToken = session.getIdToken().getJwtToken();
    return fetch(`https://ai.sentientsimulations.com/users`, {
      method: 'POST',
      headers: {
        Authentication: jwtToken,
      },
      body: JSON.stringify({ displayName }),
    }).then(() => {
      return Promise.all([me.refetch(), leaderboard.refetch()]);
    });
  }

  async function deleteDisplayName() {
    const session = await Auth.currentSession();
    const jwtToken = session.getIdToken().getJwtToken();
    return fetch(`https://ai.sentientsimulations.com/users`, {
      method: 'DELETE',
      headers: {
        Authentication: jwtToken,
      },
    }).then(() => {
      return Promise.all([me.refetch(), leaderboard.refetch()]);
    });
  }

  return {
    leaderboard,
    me,
    setDisplayName,
    deleteDisplayName,
  };
}
