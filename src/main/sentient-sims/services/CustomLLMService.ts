import log from 'electron-log';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';
import { LLMWorker } from '../models/LLMWorker';
import { fetchWithTimeout } from '../util/fetchWithTimeout';
import { PromptRequest } from '../models/PromptRequest';
import { MythoMaxPromptFormatter } from '../formatter/MythoMaxPromptFormatter';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { defaultCustomLLMPrompt } from '../constants';
import { sendPopUpNotification } from '../util/popupNotification';
import { fetchWithRetries } from '../util/fetchWithRetries';
import { formatWantsOutput } from '../formatter/PromptFormatter';

export class CustomLLMService implements GenerationService {
  private settingsService: SettingsService;

  private promptFormatter: MythoMaxPromptFormatter;

  constructor(
    settingsService: SettingsService,
    promptFormatter: MythoMaxPromptFormatter
  ) {
    this.settingsService = settingsService;
    this.promptFormatter = promptFormatter;
  }

  customLLMEnabled() {
    return this.settingsService.get(SettingsEnum.CUSTOM_LLM_ENABLED) as boolean;
  }

  customLLMHostname() {
    return this.settingsService.get(SettingsEnum.CUSTOM_LLM_HOSTNAME) as string;
  }

  async generate(prompt: string): Promise<string> {
    const url = `${this.customLLMHostname()}/api/v1/generate`;
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
        max_new_tokens: 90,
      }),
    });

    const result = await response.json();

    return result.results[0].text;
  }

  async sentientSimsGenerate(
    promptRequest: PromptRequest
  ): Promise<SimsGenerateResponse> {
    const prompt = promptRequest.pre_action
      ? this.promptFormatter.formatActionPrompt(promptRequest)
      : this.promptFormatter.formatPrompt(promptRequest);
    log.debug(`prompt: ${prompt}`);

    const response = await this.generate(prompt);
    const text = this.promptFormatter.formatOutput(response);
    return {
      text,
      systemPrompt: promptRequest.systemPrompt || defaultCustomLLMPrompt,
    };
  }

  async testHealth() {
    const url = `${this.customLLMHostname()}/health`;
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    log.debug(`testHealth: ${url}`);
    try {
      const response = await fetchWithTimeout(url, {
        headers: {
          Authentication: authHeader,
        },
        timeout: 5000,
      });
      return await response.text();
    } catch (e: any) {
      log.error('Error checking custom LLM health', e);
      sendPopUpNotification(e?.message);
      return 'Custom LLM Not healthy';
    }
  }

  async getWorkers() {
    const url = `${this.customLLMHostname()}/workers`;
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    log.debug(`getWorkers: ${url}, auth: ${authHeader}`);
    try {
      const response = await fetchWithTimeout(url, {
        headers: {
          'Content-Type': 'application/json',
          Authentication: authHeader,
        },
        timeout: 5000,
      });
      const result: LLMWorker[] = await response.json();
      return result;
    } catch (e: any) {
      log.error(`Unabled to get workers from custom llm`, e);
      sendPopUpNotification(e?.message);
      return [];
    }
  }

  async sentientSimsWants(
    promptRequest: PromptRequest
  ): Promise<SimsGenerateResponse> {
    promptRequest.systemPrompt =
      'You are the following character in the following location:';
    promptRequest.pre_action =
      'If you were the character in the story, what are your wants right now?';
    promptRequest.preResponse = 'I want to ';
    const prompt = this.promptFormatter.formatPrompt(promptRequest);

    log.debug(`prompt: ${prompt}`);

    const response = await this.generate(prompt);
    const output = this.promptFormatter.formatOutput(response);
    const text = formatWantsOutput(promptRequest.preResponse, output);
    return {
      text,
      systemPrompt: promptRequest.systemPrompt,
    };
  }
}
