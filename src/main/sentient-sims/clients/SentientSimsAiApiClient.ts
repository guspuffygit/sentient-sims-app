import { defaultSentientSimsAIHost as defaultSentientSimsAIHost } from '../constants';
import { UserInfo } from '../models/UserInfo';
import { UserMappingInfo } from '../models/UserMappingInfo';
import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export type SetDisplayNameRequest = {
  displayName: string;
};

export class SentientSimsAiApiClient extends ApiClient {
  async getMappingLeaderboard(authToken: string, sentientSimsAIHost?: string): Promise<UserMappingInfo[]> {
    const response = await axiosClient.get<UserMappingInfo[]>(
      `${sentientSimsAIHost ?? defaultSentientSimsAIHost}/leaderboard`,
      {
        headers: {
          Authentication: authToken,
        },
      },
    );
    return response.data;
  }

  async getMe(authToken: string, sentientSimsAIHost?: string): Promise<UserInfo> {
    const response = await axiosClient.get<UserInfo>(`${sentientSimsAIHost ?? defaultSentientSimsAIHost}/me`, {
      headers: {
        Authentication: authToken,
      },
    });
    return response.data;
  }

  async setDisplayName(request: SetDisplayNameRequest, authToken: string, sentientSimsAIHost?: string) {
    return axiosClient.post(`${sentientSimsAIHost ?? defaultSentientSimsAIHost}/users`, request, {
      headers: {
        Authentication: authToken,
      },
    });
  }

  async deleteDisplayName(authToken: string, sentientSimsAIHost?: string) {
    return axiosClient.delete(`${sentientSimsAIHost ?? defaultSentientSimsAIHost}/users`, {
      headers: {
        Authentication: authToken,
      },
    });
  }
}
