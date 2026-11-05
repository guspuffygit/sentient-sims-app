import { defaultSentientSimsAIHost as defaultSentientSimsAIHost } from '../constants';
import {
  BillingSettingsRequest,
  BillingUrlResponse,
  CheckoutRequest,
  PlansResponse,
  MembershipInfo,
  PortalRequest,
  RateCard,
  UserInfo,
} from '../models/UserInfo';
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

  async getPlans(authToken: string, sentientSimsAIHost?: string): Promise<PlansResponse> {
    const response = await axiosClient.get<PlansResponse>(
      `${sentientSimsAIHost ?? defaultSentientSimsAIHost}/billing/plans`,
      {
        headers: {
          Authentication: authToken,
        },
      },
    );
    return response.data;
  }

  async createCheckout(request: CheckoutRequest, authToken: string, sentientSimsAIHost?: string): Promise<string> {
    const response = await axiosClient.post<BillingUrlResponse>(
      `${sentientSimsAIHost ?? defaultSentientSimsAIHost}/billing/checkout`,
      request,
      {
        headers: {
          Authentication: authToken,
        },
      },
    );
    return response.data.url;
  }

  async createPortal(request: PortalRequest, authToken: string, sentientSimsAIHost?: string): Promise<string> {
    const response = await axiosClient.post<BillingUrlResponse>(
      `${sentientSimsAIHost ?? defaultSentientSimsAIHost}/billing/portal`,
      request,
      {
        headers: {
          Authentication: authToken,
        },
      },
    );
    return response.data.url;
  }

  async updateBillingSettings(
    request: BillingSettingsRequest,
    authToken: string,
    sentientSimsAIHost?: string,
  ): Promise<MembershipInfo> {
    const response = await axiosClient.put<MembershipInfo>(
      `${sentientSimsAIHost ?? defaultSentientSimsAIHost}/billing/settings`,
      request,
      {
        headers: {
          Authentication: authToken,
        },
      },
    );
    return response.data;
  }

  async getRateCard(authToken: string, sentientSimsAIHost?: string): Promise<RateCard> {
    const response = await axiosClient.get<RateCard>(`${sentientSimsAIHost ?? defaultSentientSimsAIHost}/rate_card`, {
      headers: {
        Authentication: authToken,
      },
    });
    return response.data;
  }
}
