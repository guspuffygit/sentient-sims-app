/* eslint-disable class-methods-use-this */
import log from 'electron-log';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';
import { fetchWithTimeout } from '../util/fetchWithTimeout';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { fetchWithRetries } from '../util/fetchWithRetries';
import { sendPopUpNotification } from '../util/notifyRenderer';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { SentientSimsAIError } from '../exceptions/SentientSimsAIError';
import { AIModel } from '../models/AIModel';

export class SentientSimsAIService implements GenerationService {
  private settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  serviceUrl(): string {
    return this.settingsService.get(SettingsEnum.CUSTOM_LLM_HOSTNAME) as string;
  }

  async generate(prompt: string, maxResponseTokens: number): Promise<string> {
    const url = `${this.serviceUrl()}/api/v1/generate`;
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    log.debug(`url: ${url}, auth: ${authHeader}`);
    const response = await fetchWithRetries(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authentication: authHeader,
      },
      body: JSON.stringify({
        prompt,
        max_new_tokens: maxResponseTokens,
      }),
    });

    if (!response.ok) {
      try {
        const errorResponse = await response.json();
        const errorMessage =
          errorResponse.error || 'Unknown JSON error occurred';
        throw new SentientSimsAIError(`SentientSimsAI error: ${errorMessage}`);
      } catch (e: any) {
        if (e instanceof SentientSimsAIError) {
          throw e;
        }

        // If JSON parsing fails, fall back to plain text error message
        const textMessage = await response.text();
        throw new Error(`SentientSimsAI text error: ${textMessage}`);
      }
    }

    const result = await response.json();
    return result.results[0].text;
  }

  async sentientSimsGenerate(
    request: OpenAICompatibleRequest
  ): Promise<SimsGenerateResponse> {
    const prompt = request.messages.map((m) => m.content).join('\n');
    log.debug(`prompt: ${JSON.stringify(prompt)}`);

    const response = await this.generate(prompt, request.maxResponseTokens);
    return {
      text: response,
      request,
    };
  }

  async healthCheck() {
    const url = `${this.serviceUrl()}/health`;
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    log.debug(`testHealth: ${url}`);
    try {
      const response = await fetchWithTimeout(url, {
        headers: {
          Authentication: authHeader,
        },
        timeout: 5000,
      });
      return {
        status: await response.text(),
      };
    } catch (e: any) {
      log.error('Error checking custom LLM health', e);
      sendPopUpNotification(e?.message);
      return {
        status: 'Sentient Sims AI Not healthy',
      };
    }
  }

  async getModels(): Promise<AIModel[]> {
    return [
      {
        name: '',
        displayName: 'Gryphe/MythoMax-L2-13b',
      },
    ];
  }
}
