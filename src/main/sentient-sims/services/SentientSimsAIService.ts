/* eslint-disable class-methods-use-this */
import log from 'electron-log';
import { ChatCompletion, ModelsPage } from 'openai/resources';
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
import {
  VLLMChatCompletionRequest,
  VLLMRTokenizeResponse,
  VLLMTokenizeChatRequest,
  VLLMTokenizeTextRequest,
} from '../models/VLLMChatCompletionRequest';
import { AllModelSettings } from '../modelSettings';
import { VLLMError } from '../models/VLLMError';
import { OpenAIMessage } from '../models/OpenAIMessage';
import { tokenizerBreakString } from '../constants';
import { truncateMessages } from '../util/tokenTruncate';

export class SentientSimsAIService implements GenerationService {
  private settingsService: SettingsService;

  private breakStringTokens: Map<string, number[]> = new Map();

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  serviceUrl(): string {
    return this.settingsService.get(
      SettingsEnum.SENTIENTSIMSAI_ENDPOINT
    ) as string;
  }

  async getBreakStringTokens(model: string): Promise<number[]> {
    if (this.breakStringTokens.has(model)) {
      return this.breakStringTokens.get(model) as number[];
    }

    const tokenizeResponse = await this.tokenize(model, tokenizerBreakString);

    this.breakStringTokens.set(model, tokenizeResponse.tokens);

    log.debug(
      `Set ${model} ${tokenizerBreakString} to ${JSON.stringify(
        tokenizeResponse.tokens
      )}`
    );

    return tokenizeResponse.tokens;
  }

  async sentientSimsGenerate(
    request: OpenAICompatibleRequest
  ): Promise<SimsGenerateResponse> {
    const model = this.getModel();
    let modelSettings = AllModelSettings.default;
    if (model in AllModelSettings) {
      modelSettings = AllModelSettings[model];
    }

    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;

    const breakTokensPromise = this.getBreakStringTokens(model);
    const messageTokens = await this.tokenizeMessages(model, request.messages);
    const breakTokens = await breakTokensPromise;

    const messages = truncateMessages(
      modelSettings.max_tokens,
      breakTokens,
      messageTokens.tokens,
      request.messages
    );

    const completionRequest: VLLMChatCompletionRequest = {
      model,
      max_tokens: request.maxResponseTokens,
      messages,
      temperature: modelSettings.temperature,
      top_p: modelSettings.top_p,
      top_k: modelSettings.top_k,
      min_tokens: 3,
      repetition_penalty: modelSettings.repetition_penalty,
      guided_choice: request.guidedChoice,
    };

    log.debug(`Request: ${JSON.stringify(completionRequest, null, 2)}`);

    const url = `${this.serviceUrl()}/v1/chat/completions`;
    const response = await fetchWithRetries(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authentication: authHeader,
      },
      body: JSON.stringify(completionRequest),
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

    const result: ChatCompletion | any = await response.json();
    log.debug(`Info about it: ${response.ok} ${response.status} ${result}`);
    const error: VLLMError = <VLLMError>result;
    if (error?.message && result?.object === 'error' && result?.type) {
      throw new SentientSimsAIError(`${result.type}: ${result.message}`);
    }

    log.debug(`Output: ${JSON.stringify(result, null, 2)}`);

    const text = this.getOutputFromGeneration(result);
    return {
      text,
      request,
    };
  }

  async tokenize(model: string, text: string): Promise<VLLMRTokenizeResponse> {
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    const tokenizeRequest: VLLMTokenizeTextRequest = {
      model,
      prompt: text,
    };
    const response = await fetchWithRetries(`${this.serviceUrl()}/tokenize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authentication: authHeader,
      },
      body: JSON.stringify(tokenizeRequest),
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

    const result: ChatCompletion | any = await response.json();
    const error: VLLMError = <VLLMError>result;
    if (error?.message && result?.object === 'error' && result?.type) {
      throw new SentientSimsAIError(`${result.type}: ${result.message}`);
    }

    return result;
  }

  async tokenizeMessages(
    model: string,
    messages: OpenAIMessage[]
  ): Promise<VLLMRTokenizeResponse> {
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    const tokenizeRequest: VLLMTokenizeChatRequest = {
      model,
      messages: messages.map((message) => {
        return {
          role: message.role,
          content: `${message.content}${tokenizerBreakString}`,
        };
      }),
    };
    const tokenizeRequestResponse = await fetchWithRetries(
      `${this.serviceUrl()}/tokenize`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authentication: authHeader,
        },
        body: JSON.stringify(tokenizeRequest),
      }
    );

    return tokenizeRequestResponse.json();
  }

  getOutputFromGeneration(generation: ChatCompletion) {
    const output = generation.choices[0].message.content;
    if (output) {
      return output.trim();
    }

    throw new Error(`Output wasnt truthy ${output}`);
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
    const url = `${this.serviceUrl()}/models`;
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    log.debug(`getModels: ${url}`);
    try {
      const response = await fetchWithTimeout(url, {
        headers: {
          Authentication: authHeader,
        },
        timeout: 5000,
      });
      const modelsResponse: ModelsPage = await response.json();

      const aiModels: AIModel[] = [];
      modelsResponse.data.forEach((model) =>
        aiModels.push({
          name: model.id,
          displayName: model.id,
        })
      );

      return aiModels;
    } catch (e: any) {
      log.error('Error getting sentient sims models', e);

      throw e;
    }
  }

  getModel(): string {
    return this.settingsService.get(
      SettingsEnum.SENTIENTSIMSAI_MODEL
    ) as string;
  }
}
