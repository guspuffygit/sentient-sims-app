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
import { VLLMChatCompletionRequest } from '../models/VLLMChatCompletionRequest';
import { AllModelSettings } from '../modelSettings';

export class SentientSimsAIService implements GenerationService {
  private settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  serviceUrl(): string {
    return this.settingsService.get(
      SettingsEnum.SENTIENTSIMSAI_ENDPOINT
    ) as string;
  }

  async sentientSimsGenerate(
    request: OpenAICompatibleRequest
  ): Promise<SimsGenerateResponse> {
    const prompt = request.messages.map((m) => m.content).join('\n');
    const model = this.getModel();
    let modelSettings = AllModelSettings.default;
    if (model in AllModelSettings) {
      modelSettings = AllModelSettings[model];
    }
    const completionRequest: VLLMChatCompletionRequest = {
      model,
      max_tokens: request.maxResponseTokens,
      messages: request.messages.map((message) => {
        return {
          role: message.role,
          content: message.content,
        };
      }),
      temperature: modelSettings.temperature,
      top_p: modelSettings.top_p,
      top_k: modelSettings.top_k,
      min_tokens: 20,
      repetition_penalty: 1.15,
      chat_template: `{% for message in messages %}
{% if message['role'] == 'system' %}
{% elif message['role'] == 'user' %}
{% elif message['role'] == 'assistant' %}
{% endif %}
{{ message['content']|trim -}}
{{ '\n' }}
{% endfor %}
{% if add_generation_prompt and messages[-1]['role'] != 'assistant' %}
{% endif %}
`,
    };
    log.debug(`prompt: ${JSON.stringify(prompt)}`);

    const url = `${this.serviceUrl()}/v1/chat/completions`;
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    log.debug(`url: ${url}, auth: ${authHeader}`);
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

    const result: ChatCompletion = await response.json();
    log.debug(`Output: ${JSON.stringify(result, null, 2)}`);
    const text = this.getOutputFromGeneration(result);
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
