import log from 'electron-log';
import { AxiosError, RawAxiosRequestHeaders } from 'axios';
import { axiosClient } from '../clients/AxiosClient';
import { VLLMAIService } from './VLLMAIService';
import { DecodeToken, isTokenExpired } from '../auth/tokenVerifier';
import { ApiType } from '../models/ApiType';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { notifyRefreshAuth } from '../util/notifyRenderer';

const tokenRefreshWaitMs = 10000;
const tokenRefreshPollMs = 250;
// After a refresh request goes unanswered (user logged out, renderer gone), don't stall
// every subsequent request on another doomed wait
const tokenRefreshRetryCooldownMs = 60000;

export class SentientSimsAIService extends VLLMAIService {
  serviceUrl(): string {
    return this.ctx.settings.sentientSimsAIEndpoint;
  }

  getAuthorizationHeaders(): RawAxiosRequestHeaders {
    return {
      Authentication: this.ctx.settings.accessToken,
      ...this.ctx.version.getVersionHeaders(),
    };
  }

  getModel(): string {
    return this.ctx.settings.sentientSimsAIModel;
  }

  protected modelSettingsApiType(): ApiType {
    return ApiType.SentientSimsAI;
  }

  // Undecodable tokens (empty, or a CustomAI server's non-JWT key) are left alone;
  // only a real JWT can be expired and renewed
  private tokenIsExpired(): boolean {
    try {
      return isTokenExpired(DecodeToken(this.ctx.settings.accessToken));
    } catch {
      return false;
    }
  }

  private hasDecodableToken(): boolean {
    try {
      DecodeToken(this.ctx.settings.accessToken);
      return true;
    } catch {
      return false;
    }
  }

  private lastFailedRefreshAt = 0;

  // The renderer owns the Cognito session, so an expired token can only be renewed by
  // asking it to refresh and waiting for the new token to land in settings. The renderer
  // only refreshes on a 15 minute timer otherwise, and a token can expire between timer
  // ticks or mid-way through a multi-call directed scene.
  private async waitForFreshToken(): Promise<void> {
    if (!this.tokenIsExpired()) {
      return;
    }
    if (Date.now() - this.lastFailedRefreshAt < tokenRefreshRetryCooldownMs) {
      return;
    }

    log.info('Sentient Sims AI access token is expired, asking the renderer to refresh it');
    const staleToken = this.ctx.settings.accessToken;
    notifyRefreshAuth();

    const waitUntil = Date.now() + tokenRefreshWaitMs;
    while (Date.now() < waitUntil) {
      await new Promise((resolve) => {
        setTimeout(resolve, tokenRefreshPollMs);
      });
      if (!this.tokenIsExpired() || this.ctx.settings.accessToken !== staleToken) {
        this.lastFailedRefreshAt = 0;
        return;
      }
    }
    this.lastFailedRefreshAt = Date.now();
    log.error('Access token is still expired after waiting for a refresh');
  }

  async sentientSimsGenerate(request: OpenAICompatibleRequest): Promise<SimsGenerateResponse> {
    await this.waitForFreshToken();
    const tokenAtRequest = this.ctx.settings.accessToken;
    try {
      return await super.sentientSimsGenerate(request);
    } catch (err) {
      const unauthorized = err instanceof AxiosError && err.response?.status === 401;
      if (!unauthorized || !this.hasDecodableToken()) {
        throw err;
      }
      log.info('Sentient Sims AI rejected the token mid-request, refreshing and retrying once');
      notifyRefreshAuth();
      await this.waitForFreshToken();
      if (this.ctx.settings.accessToken === tokenAtRequest) {
        // Nothing changed, a retry would just 401 again
        throw err;
      }
      return super.sentientSimsGenerate(request);
    }
  }

  async healthCheck() {
    await this.waitForFreshToken();

    try {
      const response = await axiosClient<string>({
        url: '/health',
        timeout: 5000,
        responseType: 'text',
        baseURL: this.serviceUrl(),
        headers: this.getAuthorizationHeaders(),
      });
      return {
        status: response.data,
      };
    } catch (e) {
      log.error('Error checking Sentient Sims AI health', e);

      return {
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }
}
