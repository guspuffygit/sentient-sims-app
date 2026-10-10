import log from 'electron-log';
import OpenAI from 'openai';
import { ChatCompletion, ResponseFormatJSONSchema } from 'openai/resources/index.js';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions.js';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { AIModel } from '../models/AIModel';
import { openaiDefaultEndpoint } from '../constants';
import { buildOpenRouterModels, isOpenRouterEndpoint, openrouterAttributionHeaders } from '../models/OpenRouterModels';
import { ApiContext } from './ApiContext';

// OpenRouter's reasoning control. The SDK types lack it, but the SDK sends extra body
// fields through untouched.
type OpenRouterCompletionParams = ChatCompletionCreateParamsNonStreaming & {
  reasoning: { effort: 'none' | 'minimal' };
};

// Reply-token allowance added for a model that must reason before it answers. Such models
// spent 150-500 tokens reasoning at minimal effort on a one-line dialogue prompt.
const mandatoryReasoningHeadroomTokens = 1024;

function isReasoningRejection(error: unknown): boolean {
  return error instanceof OpenAI.APIError && error.status === 400 && /reasoning/i.test(error.message);
}

export class OpenAIKeyNotSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIKeyNotSetError';
  }
}

export class OpenAIService implements GenerationService {
  protected readonly ctx: ApiContext;

  private openAIClient?: OpenAI;

  private openAIClientConfig?: string;

  // OpenRouter models that refused to run with reasoning off
  private readonly mandatoryReasoningModels = new Set<string>();

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  serviceUrl(): string {
    return this.ctx.settings.openaiEndpoint;
  }

  getOpenAIModel(): string {
    return this.ctx.settings.openaiModel;
  }

  // Only OpenAI itself is known to honour the strict json_schema response format used for
  // guided choice. Every other OpenAI-compatible backend gets a plain prompt instead.
  protected supportsJsonSchema(): boolean {
    return this.serviceUrl() === openaiDefaultEndpoint;
  }

  getOpenAIKey(): string | undefined {
    // Check app settings
    const openAIKeyFromSettings = this.ctx.settings.openaiKey;
    if (openAIKeyFromSettings) {
      log.debug('Using openai key from settings');
      return openAIKeyFromSettings;
    }

    // Check environment variable
    const openAIKeyFromEnv = process.env.OPENAI_KEY;
    if (openAIKeyFromEnv) {
      log.debug('Using openai key from environment');
      return openAIKeyFromEnv;
    }

    throw new OpenAIKeyNotSetError('No OpenAI Key set, Edit OpenAI Key to set it');
  }

  // Shared with OpenAIImageGenerationService so text and image generation
  // reuse the same key resolution and cached client
  getOpenAIClient(apiKey?: string): OpenAI {
    const newApiKey = apiKey ?? this.getOpenAIKey();
    const timeout = this.ctx.settings.generationTimeoutSeconds * 1000;
    const baseURL = this.serviceUrl();
    const clientConfig = `${baseURL}:${timeout}`;
    if (!this.openAIClient || this.openAIClient.apiKey !== newApiKey || this.openAIClientConfig !== clientConfig) {
      this.openAIClient = new OpenAI({
        dangerouslyAllowBrowser: process.env.NODE_ENV === 'test',
        apiKey: newApiKey,
        baseURL,
        timeout,
        maxRetries: 0,
        defaultHeaders: isOpenRouterEndpoint(baseURL) ? openrouterAttributionHeaders : undefined,
      });
      this.openAIClientConfig = clientConfig;
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
    } catch (error) {
      log.error('Error testing OpenAI API:', error);

      const message = error instanceof Error ? error.message : String(error);
      return {
        error: `not working, ${message}`,
      };
    }
  }

  async sentientSimsGenerate(request: OpenAICompatibleRequest): Promise<SimsGenerateResponse> {
    const completionRequest: ChatCompletionCreateParamsNonStreaming = {
      model: request.model ?? this.getOpenAIModel(),
      max_tokens: request.maxResponseTokens,
      messages: request.messages.map((message) => {
        return {
          role: message.role,
          content: message.content,
        };
      }),
    };

    if (request.guidedChoice && this.supportsJsonSchema()) {
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

    const result = await this.createCompletion(completionRequest, request.maxResponseTokens);
    let text = this.getOutputFromGeneration(result);

    if (request.guidedChoice && this.supportsJsonSchema()) {
      const parsed = JSON.parse(text) as { choice: string };
      text = parsed.choice.trim();
    }

    if (this.ctx.settings.localizationEnabled) {
      text = await this.translate(text, this.ctx.settings.localizationLanguage, completionRequest.model);
    }

    return {
      text,
      request,
    };
  }

  // Reasoning tokens count against max_tokens, so a reasoning model given the short reply
  // limits used here spends the whole limit thinking and returns no text. OpenRouter turns
  // reasoning off on request for most models; one that refuses runs at the lowest effort
  // with room for its reasoning on top of the reply.
  private async createCompletion(
    request: ChatCompletionCreateParamsNonStreaming,
    maxResponseTokens?: number,
  ): Promise<ChatCompletion> {
    const client = this.getOpenAIClient();
    if (!isOpenRouterEndpoint(this.serviceUrl())) {
      return client.chat.completions.create(request);
    }

    if (!this.mandatoryReasoningModels.has(request.model)) {
      const withoutReasoning: OpenRouterCompletionParams = { ...request, reasoning: { effort: 'none' } };
      try {
        return await client.chat.completions.create(withoutReasoning);
      } catch (error) {
        if (!isReasoningRejection(error)) {
          throw error;
        }
        log.info(`OpenRouter model ${request.model} cannot turn reasoning off, using minimal effort`);
        this.mandatoryReasoningModels.add(request.model);
      }
    }

    const minimalReasoning: OpenRouterCompletionParams = {
      ...request,
      max_tokens: maxResponseTokens === undefined ? undefined : maxResponseTokens + mandatoryReasoningHeadroomTokens,
      reasoning: { effort: 'minimal' },
    };
    return client.chat.completions.create(minimalReasoning);
  }

  getOutputFromGeneration(generation: ChatCompletion) {
    const choice = generation.choices[0];
    const output = choice.message.content;
    if (output) {
      return output.trim();
    }

    log.error(`Output wasnt truthy from OpenAI API:\n${JSON.stringify(generation)}`);

    const reasoningTokens = generation.usage?.completion_tokens_details?.reasoning_tokens ?? 0;
    if (choice.finish_reason === 'length' && reasoningTokens > 0) {
      throw new Error(
        `${generation.model} spent its whole reply limit on reasoning and wrote no reply. Choose a model that does not reason.`,
      );
    }

    throw new Error(`Output wasnt truthy from OpenAI API ${output}`);
  }

  async translate(text: string, language: string, model?: string) {
    const request: ChatCompletionCreateParamsNonStreaming = {
      model: model ?? this.getOpenAIModel(),
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
    const result = await this.createCompletion(request);
    return this.getOutputFromGeneration(result);
  }

  async getModels(): Promise<AIModel[]> {
    const models = await this.getOpenAIClient().models.list();

    if (isOpenRouterEndpoint(this.serviceUrl())) {
      return buildOpenRouterModels(models.data.map((model) => model.id));
    }

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
      if (!this.supportsJsonSchema()) {
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
