import log from 'electron-log';
import { ChatCompletion, ResponseFormatJSONSchema } from 'openai/resources/index.mjs';
import { RawAxiosRequestHeaders } from 'axios';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { AIModel, AIModelResponse, responseToAIModels } from '../models/AIModel';
import {
  VLLMChatCompletionRequest,
  VLLMRTokenizeResponse,
  VLLMTokenizeChatRequest,
  VLLMTokenizeTextRequest,
} from '../models/VLLMChatCompletionRequest';
import { OpenAIMessage } from '../models/OpenAIMessage';
import { tokenizerBreakString } from '../constants';
import { truncateMessages } from '../util/tokenTruncate';
import { TokenizeException } from '../exceptions/TokenizeException';
import { axiosClient } from '../clients/AxiosClient';
import { ApiContext } from './ApiContext';
import { ApiType } from '../models/ApiType';

export class VLLMAIService implements GenerationService {
  protected ctx: ApiContext;

  protected breakStringTokens: Map<string, number[]> = new Map();

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  serviceUrl(): string {
    return this.ctx.settings.vllmEndpoint;
  }

  getAuthorizationHeaders(): RawAxiosRequestHeaders {
    return {
      Authorization: `Bearer ${this.ctx.settings.vllmApiKey}`,
    };
  }

  getModel(): string {
    return `${this.ctx.settings.vllmModel}`;
  }

  // The provider type used when looking up model settings; SentientSimsAIService
  // overrides this so remote model settings sync only happens for that provider.
  protected modelSettingsApiType(): ApiType {
    return ApiType.VLLM;
  }

  async getBreakStringTokens(model: string, apiType?: ApiType): Promise<number[]> {
    try {
      const modelSettings = await this.ctx.modelSettings.getModelSettings(
        model,
        apiType ?? this.modelSettingsApiType(),
      );

      if (modelSettings.breakStringTokens) {
        log.debug('returning model settings break string tokens');
        return modelSettings.breakStringTokens;
      }

      if (this.breakStringTokens.has(model)) {
        return this.breakStringTokens.get(model) as number[];
      }

      const breakString = modelSettings.breakTokenString || tokenizerBreakString;

      const tokenizeResponse = await this.tokenize(model, breakString);

      this.breakStringTokens.set(model, tokenizeResponse.tokens);

      log.debug(`Set ${model} ${breakString} to ${JSON.stringify(tokenizeResponse.tokens)}`);

      return tokenizeResponse.tokens;
    } catch (err) {
      const errorMessage = `Unable to tokenize break string tokens`;
      log.error(errorMessage, err);
      throw new Error(errorMessage, { cause: err });
    }
  }

  async sentientSimsGenerate(request: OpenAICompatibleRequest): Promise<SimsGenerateResponse> {
    const model = request.model ?? this.getModel();
    const apiType = request.apiType ?? this.modelSettingsApiType();
    const modelSettings = await this.ctx.modelSettings.getModelSettings(model, apiType);

    const [messageTokens, breakTokens] = await Promise.all([
      this.tokenizeMessages(model, request.messages, apiType),
      this.getBreakStringTokens(model, apiType),
    ]);

    const messages = truncateMessages(modelSettings.max_tokens, breakTokens, messageTokens.tokens, request.messages);

    const completionRequest: VLLMChatCompletionRequest = {
      model,
      max_tokens: request.maxResponseTokens,
      messages: messages.map((m) => {
        return { content: m.content, role: m.role };
      }),
      temperature: modelSettings.temperature,
      top_p: modelSettings.top_p,
      top_k: modelSettings.top_k,
      min_tokens: 5,
      repetition_penalty: modelSettings.repetition_penalty,
      add_generation_prompt: !request.includesAssistantPreResponse,
      continue_final_message: request.includesAssistantPreResponse,
      stop: modelSettings.stop,
      chat_template_kwargs: modelSettings.chat_template_kwargs,
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
      completionRequest.min_tokens = undefined;
    }

    log.debug(`Request: ${JSON.stringify(completionRequest, null, 2)}`);

    const response = await axiosClient<ChatCompletion>({
      url: '/v1/chat/completions',
      method: 'POST',
      data: completionRequest,
      baseURL: this.serviceUrl(),
      headers: this.getAuthorizationHeaders(),
    });

    const result = response.data;
    log.debug(`Info about it: ${response.status} ${JSON.stringify(result, null, 2)}`);

    let text = this.getOutputFromGeneration(result);

    if (request.guidedChoice) {
      text = (JSON.parse(text) as { choice: string }).choice;
    }

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
    const response = await axiosClient<VLLMRTokenizeResponse>({
      url: '/tokenize',
      method: 'POST',
      data: tokenizeRequest,
      baseURL: this.serviceUrl(),
      headers: this.getAuthorizationHeaders(),
    });

    return response.data;
  }

  async tokenizeMessages(model: string, messages: OpenAIMessage[], apiType?: ApiType): Promise<VLLMRTokenizeResponse> {
    const modelSettings = await this.ctx.modelSettings.getModelSettings(model, apiType ?? this.modelSettingsApiType());
    const breakString = modelSettings.breakTokenString || tokenizerBreakString;

    const tokenizeRequest: VLLMTokenizeChatRequest = {
      model,
      messages: messages.map((message) => {
        return {
          role: message.role,
          content: `${message.content}${breakString}`,
        };
      }),
    };

    const tokenizeRequestResponse = await axiosClient<VLLMRTokenizeResponse>({
      url: '/tokenize',
      method: 'POST',
      data: tokenizeRequest,
      baseURL: this.serviceUrl(),
      headers: this.getAuthorizationHeaders(),
    });

    const result = tokenizeRequestResponse.data;

    if (result.tokens.length > 0 && result.count) {
      return result;
    }

    log.error(`tokenizeMessages response is not valid: ${JSON.stringify(result)}`);

    throw new TokenizeException(result);
  }

  getOutputFromGeneration(generation: ChatCompletion) {
    const output = generation.choices[0].message.content;
    if (output) {
      return output.trim();
    }

    log.error(`Output wasnt truthy from AI:\n${JSON.stringify(generation, null, 2)}`);

    throw new Error(`Output wasnt truthy from AI ${output}`);
  }

  async healthCheck() {
    try {
      await axiosClient({
        url: '/v1/models',
        timeout: 5000,
        responseType: 'text',
        baseURL: this.serviceUrl(),
        headers: this.getAuthorizationHeaders(),
      });
      return {
        status: 'OK',
      };
    } catch (e) {
      log.error('Error checking health', e);

      return {
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  async getModels(): Promise<AIModel[]> {
    try {
      const options = {
        url: '/v1/models',
        timeout: 5000,
        baseURL: this.serviceUrl(),
        headers: this.getAuthorizationHeaders(),
      };
      log.info(`Options: ${JSON.stringify(options, null, 2)}`);
      const response = await axiosClient<AIModelResponse>(options);
      return responseToAIModels(response.data);
    } catch (e) {
      log.error('Error getting models', e);

      throw e;
    }
  }
}
