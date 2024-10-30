/* eslint-disable max-classes-per-file,class-methods-use-this */
/* eslint-disable promise/always-return */
import log from 'electron-log';
import OpenAI from 'openai';
import {
  ChatCompletion,
  CompletionCreateParamsNonStreaming,
} from 'openai/src/resources/chat/completions';
import { ResponseFormatJSONSchema } from 'openai/resources';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { sendPopUpNotification } from '../util/notifyRenderer';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { AIModel } from '../models/AIModel';
import { openaiDefaultEndpoint } from '../constants';

export class OpenAIKeyNotSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIKeyNotSetError';
  }
}

export class OpenAIService implements GenerationService {
  private readonly settingsService: SettingsService;

  private openAIClient?: OpenAI;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  serviceUrl(): string {
    return this.settingsService.get(SettingsEnum.OPENAI_ENDPOINT) as string;
  }

  getOpenAIModel(): string {
    return this.settingsService.get(SettingsEnum.OPENAI_MODEL) as string;
  }

  getOpenAIKey(): string | undefined {
    // Check app settings
    const openAIKeyFromSettings = this.settingsService.get(
      SettingsEnum.OPENAI_KEY
    );
    if (openAIKeyFromSettings) {
      log.debug('Using openai key from settings');
      return openAIKeyFromSettings as string;
    }

    // Check environment variable
    const openAIKeyFromEnv = process.env.OPENAI_KEY;
    if (openAIKeyFromEnv) {
      log.debug('Using openai key from environment');
      return openAIKeyFromEnv;
    }

    throw new OpenAIKeyNotSetError(
      'No OpenAI Key set, Edit OpenAI Key to set it'
    );
  }

  private getOpenAIClient(apiKey?: string): OpenAI {
    const newApiKey = apiKey ?? this.getOpenAIKey();
    if (!this.openAIClient || this.openAIClient.apiKey !== newApiKey) {
      this.openAIClient = new OpenAI({
        dangerouslyAllowBrowser: process.env.NODE_ENV === 'test',
        apiKey: newApiKey,
        baseURL: this.serviceUrl(),
      });
    }

    return this.openAIClient;
  }

  async healthCheck(apiKey?: string) {
    const client: OpenAI = this.getOpenAIClient(apiKey);

    const request: CompletionCreateParamsNonStreaming = {
      stream: false,
      model: this.getOpenAIModel(),
      max_tokens: 100,
      temperature: 0,
      top_p: 0,
      messages: [
        {
          role: 'user',
          content: 'Return the text "OK"',
        },
      ],
    };

    try {
      const response = await client.chat.completions.create(request);
      const text = this.getOutputFromGeneration(response);
      return {
        status: text,
      };
    } catch (error: any) {
      log.error('Error testing OpenAI API:', error);

      sendPopUpNotification(error?.message);

      return {
        status: 'not working, send logs to debug',
      };
    }
  }

  async sentientSimsGenerate(
    request: OpenAICompatibleRequest
  ): Promise<SimsGenerateResponse> {
    const completionRequest: CompletionCreateParamsNonStreaming = {
      model: this.getOpenAIModel(),
      max_tokens: request.maxResponseTokens,
      messages: request.messages.map((message) => {
        return {
          role: message.role,
          content: message.content,
        };
      }),
    };

    if (
      request.guidedChoice &&
      this.settingsService.get(SettingsEnum.OPENAI_ENDPOINT) ===
        openaiDefaultEndpoint
    ) {
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

    const result = await this.getOpenAIClient().chat.completions.create(
      completionRequest
    );
    let text = this.getOutputFromGeneration(result);

    if (
      request.guidedChoice &&
      this.settingsService.get(SettingsEnum.OPENAI_ENDPOINT) ===
        openaiDefaultEndpoint
    ) {
      text = JSON.parse(text).choice.trim();
    }

    if (this.settingsService.get(SettingsEnum.LOCALIZATION_ENABLED)) {
      text = await this.translate(
        text,
        this.settingsService.get(SettingsEnum.LOCALIZATION_LANGUAGE) as string
      );
    }

    return {
      text,
      request,
    };
  }

  getOutputFromGeneration(generation: ChatCompletion) {
    const output = generation.choices[0].message.content;
    if (output) {
      return output.trim();
    }

    throw new Error(`Output wasnt truthy ${output}`);
  }

  async translate(text: string, language: string) {
    const request: CompletionCreateParamsNonStreaming = {
      stream: false,
      model: this.getOpenAIModel(),
      messages: [
        {
          role: 'system',
          content: `Translate the user input from English to ${language}`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
    };
    const result = await this.getOpenAIClient().chat.completions.create(
      request
    );
    return this.getOutputFromGeneration(result);
  }

  async getModels(): Promise<AIModel[]> {
    const models = await this.getOpenAIClient().models.list();

    const aiModels: AIModel[] = [];
    models.data.forEach((model) => {
      aiModels.push({
        name: model.id,
        displayName: model.id,
      });
    });

    return aiModels;
  }
}
