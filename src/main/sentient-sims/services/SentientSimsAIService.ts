/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import log from 'electron-log';
import {
  ChatCompletion,
  ResponseFormatJSONSchema,
} from 'openai/resources/index.mjs';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { AIModel, AIModelResponse } from '../models/AIModel';
import {
  VLLMChatCompletionRequest,
  VLLMRTokenizeResponse,
  VLLMTokenizeChatRequest,
  VLLMTokenizeTextRequest,
} from '../models/VLLMChatCompletionRequest';
import { AllModelSettings } from '../modelSettings';
import { OpenAIMessage } from '../models/OpenAIMessage';
import { tokenizerBreakString } from '../constants';
import { truncateMessages } from '../util/tokenTruncate';
import { TokenizeException } from '../exceptions/TokenizeException';
import axiosClient from '../clients/AxiosClient';

export class SentientSimsAIService implements GenerationService {
  private settingsService: SettingsService;

  private breakStringTokens: Map<string, number[]> = new Map();

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  serviceUrl(): string {
    return this.settingsService.get(
      SettingsEnum.SENTIENTSIMSAI_ENDPOINT,
    ) as string;
  }

  async getBreakStringTokens(model: string): Promise<number[]> {
    try {
      if (this.breakStringTokens.has(model)) {
        return this.breakStringTokens.get(model) as number[];
      }

      let modelSettings = AllModelSettings.default;
      if (model in AllModelSettings) {
        modelSettings = AllModelSettings[model];
      }

      if (modelSettings.breakStringTokens) {
        log.debug('returning tokens as is');
        return modelSettings.breakStringTokens;
      }

      const breakString =
        modelSettings?.breakTokenString || tokenizerBreakString;

      const tokenizeResponse = await this.tokenize(model, breakString);

      this.breakStringTokens.set(model, tokenizeResponse.tokens);

      log.debug(
        `Set ${model} ${breakString} to ${JSON.stringify(
          tokenizeResponse.tokens,
        )}`,
      );

      return tokenizeResponse.tokens;
    } catch (err) {
      const errorMessage = `Unable to tokenize break string tokens`;
      log.error(errorMessage, err);
      throw new Error(errorMessage);
    }
  }

  async sentientSimsGenerate(
    request: OpenAICompatibleRequest,
  ): Promise<SimsGenerateResponse> {
    const model = this.getModel();
    let modelSettings = AllModelSettings.default;
    if (model in AllModelSettings) {
      modelSettings = AllModelSettings[model];
    }

    const [messageTokens, breakTokens] = await Promise.all([
      this.tokenizeMessages(model, request.messages),
      this.getBreakStringTokens(model),
    ]);

    const messages = truncateMessages(
      modelSettings.max_tokens,
      breakTokens,
      messageTokens.tokens,
      request.messages,
    );

    const completionRequest: VLLMChatCompletionRequest = {
      model,
      max_tokens: request.maxResponseTokens,
      messages: messages.map((m) => {
        return { content: m.content, role: m.role };
      }),
      temperature: modelSettings.temperature,
      top_p: modelSettings.top_p,
      top_k: modelSettings.top_k,
      min_tokens: 3,
      repetition_penalty: modelSettings.repetition_penalty,
      add_generation_prompt: !request.includesAssistantPreResponse,
      continue_final_message: request.includesAssistantPreResponse,
    };

    if (request.guidedChoice) {
      const schema: ResponseFormatJSONSchema = {
        json_schema: {
          name: 'thechoice',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['choice'],
            properties: {
              choice: {
                type: 'string',
                description: 'The choice',
                enum: request.guidedChoice,
              },
            },
          },
        },
        type: 'json_schema',
      };
      completionRequest.response_format = schema;
    }

    log.debug(`Request: ${JSON.stringify(completionRequest, null, 2)}`);

    const response = await axiosClient({
      url: '/v1/chat/completions',
      method: 'POST',
      data: completionRequest,
    });

    const result: ChatCompletion = response.data;
    log.debug(
      `Info about it: ${response.status} ${JSON.stringify(result, null, 2)}`,
    );

    const text = this.getOutputFromGeneration(result);
    return {
      text,
      request,
    };
  }

  async tokenize(model: string, text: string): Promise<VLLMRTokenizeResponse> {
    const tokenizeRequest: VLLMTokenizeTextRequest = {
      model,
      prompt: text,
      add_special_tokens: false,
    };
    const response = await axiosClient({
      url: '/tokenize',
      method: 'POST',
      data: tokenizeRequest,
    });

    return response.data;
  }

  async tokenizeMessages(
    model: string,
    messages: OpenAIMessage[],
  ): Promise<VLLMRTokenizeResponse> {
    let modelSettings = AllModelSettings.default;
    if (model in AllModelSettings) {
      modelSettings = AllModelSettings[model];
    }
    const breakString = modelSettings?.breakTokenString || tokenizerBreakString;

    const tokenizeRequest: VLLMTokenizeChatRequest = {
      model,
      messages: messages.map((message) => {
        return {
          role: message.role,
          content: `${message.content}${breakString}`,
        };
      }),
    };

    const tokenizeRequestResponse = await axiosClient({
      url: '/tokenize',
      method: 'POST',
      data: tokenizeRequest,
    });

    const result: VLLMRTokenizeResponse =
      // eslint-disable-next-line no-await-in-loop
      await tokenizeRequestResponse.data;

    if (result?.tokens && result?.count) {
      return result;
    }

    log.error(`tokenizeMessages response is not valid: ${result}`);

    throw new TokenizeException(result);
  }

  getOutputFromGeneration(generation: ChatCompletion) {
    const output = generation.choices[0].message.content;
    if (output) {
      return output.trim();
    }

    log.error(
      `Output wasnt truthy from SentientSims AI:\n${JSON.stringify(generation, null, 2)}`,
    );

    throw new Error(`Output wasnt truthy from SentientSims AI ${output}`);
  }

  async healthCheck() {
    try {
      const response = await axiosClient({
        url: '/health',
        timeout: 5000,
        responseType: 'text',
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

  async getModels(): Promise<AIModel[]> {
    try {
      const response = await axiosClient({
        url: '/models',
        timeout: 5000,
      });
      const modelsResponse: AIModelResponse = response.data;
      return modelsResponse.data;
    } catch (e: any) {
      log.error('Error getting sentient sims models', e);

      throw e;
    }
  }

  getModel(): string {
    return this.settingsService.get(
      SettingsEnum.SENTIENTSIMSAI_MODEL,
    ) as string;
  }
}
