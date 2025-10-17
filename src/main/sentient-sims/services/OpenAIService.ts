import log from 'electron-log';
import OpenAI from 'openai';
import { ChatCompletion, ResponseFormatJSONSchema } from 'openai/resources/index.js';
import { ChatCompletionCreateParams } from 'openai/resources/chat/completions.js';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { AIModel } from '../models/AIModel';
import { openaiDefaultEndpoint } from '../constants';
import { ApiContext } from './ApiContext';

export class OpenAIKeyNotSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIKeyNotSetError';
  }
}

export class OpenAIService implements GenerationService {
  private readonly ctx: ApiContext;

  private openAIClient?: OpenAI;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  serviceUrl(): string {
    return this.ctx.settings.openaiEndpoint;
  }

  getOpenAIModel(): string {
    return this.ctx.settings.openaiModel;
  }

  getOpenAIKey(): string | undefined {
    // Check app settings
    const openAIKeyFromSettings = this.ctx.settings.openaiKey;
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

    throw new OpenAIKeyNotSetError('No OpenAI Key set, Edit OpenAI Key to set it');
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

    try {
      const response = await client.models.list();

      if (response.data.length > 0) {
        return {
          status: 'OK',
        };
      }

      const noModelsAvailableErrorMessage = 'No models available';

      log.error(noModelsAvailableErrorMessage);

      return {
        error: noModelsAvailableErrorMessage,
      };
    } catch (error: any) {
      log.error('Error testing OpenAI API:', error);

      return {
        error: `not working, ${error?.message}`,
      };
    }
  }

  async sentientSimsGenerate(request: OpenAICompatibleRequest): Promise<SimsGenerateResponse> {
    const completionRequest: ChatCompletionCreateParams = {
      model: this.getOpenAIModel(),
      max_tokens: request.maxResponseTokens,
      messages: request.messages.map((message) => {
        return {
          role: message.role,
          content: message.content,
        };
      }),
    };

    if (request.guidedChoice && this.ctx.settings.openaiEndpoint === openaiDefaultEndpoint) {
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

    log.debug(`OpenAI Request:\n${JSON.stringify(completionRequest, null, 2)}`);

    const result = await this.getOpenAIClient().chat.completions.create(completionRequest);
    let text = this.getOutputFromGeneration(result);

    if (request.guidedChoice && this.ctx.settings.openaiEndpoint === openaiDefaultEndpoint) {
      text = JSON.parse(text).choice.trim();
    }

    if (this.ctx.settings.localizationEnabled) {
      text = await this.translate(text, this.ctx.settings.localizationLanguage);
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

    log.error(`Output wasnt truthy from OpenAI API:\n${generation}`);

    throw new Error(`Output wasnt truthy from OpenAI API ${output}`);
  }

  async translate(text: string, language: string) {
    const request: ChatCompletionCreateParams = {
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
    const result = await this.getOpenAIClient().chat.completions.create(request);
    return this.getOutputFromGeneration(result);
  }

  async getModels(): Promise<AIModel[]> {
    const models = await this.getOpenAIClient().models.list();

    // These models are the only ones that work with json_schema
    const jsonSchemaModels: Record<string, AIModel> = {
      'gpt-4o-2024-08-06': {
        name: 'gpt-4o-2024-08-06',
        displayName: 'gpt-4o 2024-08-06',
      },
      'gpt-4o-2024-11-20': {
        name: 'gpt-4o-2024-11-20',
        displayName: 'gpt-4o 2024-11-20',
      },
      'gpt-4o-mini-2024-07-18': {
        name: 'gpt-4o-mini-2024-07-18',
        displayName: 'gpt-4o-mini 2024-07-18',
      },
      'gpt-4.1-2025-04-14': {
        name: 'gpt-4.1-2025-04-14',
        displayName: 'gpt-4.1 2025-04-14',
      },
      'gpt-4.1-mini-2025-04-14': {
        name: 'gpt-4.1-mini-2025-04-14',
        displayName: 'gpt-4.1-mini 2025-04-14',
      },
      'gpt-4.1-nano-2025-04-14': {
        name: 'gpt-4.1-nano-2025-04-14',
        displayName: 'gpt-4.1-nano 2025-04-14',
      },
    };

    const aiModels: AIModel[] = [];
    models.data.forEach((model) => {
      if (this.ctx.settings.openaiEndpoint !== openaiDefaultEndpoint) {
        aiModels.push({
          name: model.id,
          displayName: model.id,
        });
      } else if (model.id in jsonSchemaModels) {
        aiModels.push({
          name: model.id,
          displayName: jsonSchemaModels[model.id].displayName,
        });
      }
    });

    return aiModels;
  }
}
