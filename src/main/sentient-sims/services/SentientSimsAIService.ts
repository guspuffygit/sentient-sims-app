/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import log from 'electron-log';
import { RawAxiosRequestHeaders } from 'axios';
import { SettingsEnum } from '../models/SettingsEnum';
import { axiosClient } from '../clients/AxiosClient';
import { VLLMAIService } from './VLLMAIService';
import { DecodeToken, isTokenExpired } from '../auth/tokenVerifier';

export class SentientSimsAIService extends VLLMAIService {
  serviceUrl(): string {
    return this.settingsService.get(
      SettingsEnum.SENTIENTSIMSAI_ENDPOINT,
    ) as string;
  }

  getAuthorizationHeaders(): RawAxiosRequestHeaders {
    return {
      Authentication: `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`,
    };
  }

  getModel(): string {
    return this.settingsService.get(
      SettingsEnum.SENTIENTSIMSAI_MODEL,
    ) as string;
  }

  async healthCheck() {
    for (let i = 0; i < 60; i++) {
      const payload = DecodeToken(
        `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`,
      );
      if (isTokenExpired(payload)) {
        // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
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
