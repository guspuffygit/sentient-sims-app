import log from 'electron-log';
import { AxiosError, RawAxiosRequestHeaders } from 'axios';
import { axiosClient } from '../clients/AxiosClient';
import { VLLMAIService } from './VLLMAIService';
import { DecodeToken, isTokenExpired } from '../auth/tokenVerifier';
import { ApiType } from '../models/ApiType';
import { resolveSentientSimsAIModel, sentientSimsAIDefaultImageModel } from '../constants';
import { ImageGenerationRequest, ImageGenerationResponse } from '../models/ImageGeneration';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { ImageGenerationService } from './ImageGenerationService';
import { notifyRefreshAuth } from '../util/notifyRenderer';

const tokenRefreshWaitMs = 10000;
const tokenRefreshPollMs = 250;
// After a refresh request goes unanswered (user logged out, renderer gone), don't stall
// every subsequent request on another doomed wait
const tokenRefreshRetryCooldownMs = 60000;

// The server cuts image generation off at 120 seconds; outlast that so its
// timeout response arrives instead of a client-side abort
const imageGenerationTimeoutMs = 130000;

// OpenAI-compatible response shape of the server's /v1/images/generations
type SentientSimsImageGenerationResponse = {
  created: number;
  data: { b64_json?: string; url?: string }[];
};

export class SentientSimsAIService extends VLLMAIService implements ImageGenerationService {
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

  // Runs a request with a fresh token, refreshing and retrying once when the
  // server rejects a token that expired or was revoked mid-request
  private async withAuthRetry<T>(makeRequest: () => Promise<T>): Promise<T> {
    await this.waitForFreshToken();
    const tokenAtRequest = this.ctx.settings.accessToken;
    try {
      return await makeRequest();
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
      return makeRequest();
    }
  }

  async sentientSimsGenerate(request: OpenAICompatibleRequest): Promise<SimsGenerateResponse> {
    // Provider configs already resolve away replaced models; this catches requests that
    // carry an explicit model pick (chat page, scenario tester stages). CustomAI requests
    // are stamped with their own apiType and pass through untouched.
    const apiType = request.apiType ?? this.modelSettingsApiType();
    if (apiType === ApiType.SentientSimsAI) {
      request = { ...request, model: resolveSentientSimsAIModel(request.model ?? this.getModel()) };
    }
    return this.withAuthRetry(() => super.sentientSimsGenerate(request));
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const model = request.model ?? sentientSimsAIDefaultImageModel;

    log.debug(`Sentient Sims AI image request: model=${model}`);

    const response = await this.withAuthRetry(() =>
      axiosClient<SentientSimsImageGenerationResponse>({
        url: '/v1/images/generations',
        method: 'POST',
        data: { model, prompt: request.prompt },
        baseURL: this.serviceUrl(),
        timeout: imageGenerationTimeoutMs,
        headers: this.getAuthorizationHeaders(),
      }),
    );

    const imageBase64 = await this.toImageBase64(response.data);
    if (!imageBase64) {
      log.error(`No image data returned from Sentient Sims AI:\n${JSON.stringify(response.data)}`);
      throw new Error('No image data returned from Sentient Sims AI');
    }

    return {
      imageBase64,
      model,
      apiType: ApiType.SentientSimsAI,
    };
  }

  // The server normally returns base64, but passes provider-hosted image URLs
  // through as-is; those get downloaded so callers always receive base64
  private async toImageBase64(response: SentientSimsImageGenerationResponse): Promise<string | undefined> {
    const image = response.data.at(0);
    if (image?.b64_json) {
      return image.b64_json;
    }
    if (image?.url) {
      const download = await axiosClient<ArrayBuffer>({
        url: image.url,
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      return Buffer.from(download.data).toString('base64');
    }
    return undefined;
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
