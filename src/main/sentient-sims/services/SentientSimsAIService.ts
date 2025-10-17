import log from 'electron-log';
import { RawAxiosRequestHeaders } from 'axios';
import { axiosClient } from '../clients/AxiosClient';
import { VLLMAIService } from './VLLMAIService';
import { DecodeToken, isTokenExpired } from '../auth/tokenVerifier';

export class SentientSimsAIService extends VLLMAIService {
  serviceUrl(): string {
    return this.ctx.settings.sentientSimsAIEndpoint;
  }

  getAuthorizationHeaders(): RawAxiosRequestHeaders {
    return {
      Authentication: this.ctx.settings.accessToken,
    };
  }

  getModel(): string {
    return this.ctx.settings.sentientSimsAIModel;
  }

  async healthCheck() {
    for (let i = 0; i < 60; i++) {
      const payload = DecodeToken(`${this.ctx.settings.accessToken}`);
      if (isTokenExpired(payload)) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    try {
      const response = await axiosClient({
        url: '/health',
        timeout: 5000,
        responseType: 'text',
        baseURL: this.serviceUrl(),
        headers: this.getAuthorizationHeaders(),
      });
      return {
        status: await response.data,
      };
    } catch (e: any) {
      log.error('Error checking Sentient Sims AI health', e);

      return {
        error: e?.message || `${e}`,
      };
    }
  }
}
