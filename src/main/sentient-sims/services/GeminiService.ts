import log from 'electron-log';
import { GenerateContentParameters, GoogleGenAI, HarmBlockThreshold, HarmCategory, Model } from '@google/genai';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { AIModel } from '../models/AIModel';
import { getRandomItem } from '../util/getRandomItem';
import { GeminiKeysNotSetError } from '../exceptions/GeminiKeyNotSetError';
import { isApiError } from '../exceptions/GeminiAPIError';
import { ApiContext } from './ApiContext';

const maxRetries = 3;

export class GeminiService implements GenerationService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  serviceUrl(): string {
    return this.ctx.settings.geminiEndpoint;
  }

  getGeminiModel(): string {
    return this.ctx.settings.geminiModel;
  }

  getGeminiKeys(): string[] {
    const keysString = this.ctx.settings.geminiKeys;
    if (!keysString || keysString.trim() === '') {
      throw new GeminiKeysNotSetError(
        'No Gemini API keys set. Please configure them in settings (e.g., key1,key2,key3).',
      );
    }
    return keysString
      .split(',')
      .map((key) => key.trim())
      .filter((key) => key.length > 0);
  }

  private getGenAIClient(): GoogleGenAI {
    const keys = this.getGeminiKeys();
    const randomKey = getRandomItem(keys);
    return new GoogleGenAI({ apiKey: randomKey });
  }

  private readonly safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  async sentientSimsGenerate(request: OpenAICompatibleRequest): Promise<SimsGenerateResponse> {
    const model = request.model ?? this.getGeminiModel();
    const generateRequest: GenerateContentParameters = {
      model,
      config: {
        safetySettings: this.safetySettings,
        systemInstruction: request.messages.find((msg) => msg.role === 'system')?.content,
        maxOutputTokens: request.maxResponseTokens,
        temperature: 0.8,
        topP: 0.9,
      },
      contents: request.messages
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
    };

    log.debug(`Full Gemini Request: ${JSON.stringify(generateRequest, null, 2)}`);

    let text = await this.generate(generateRequest);

    if (this.ctx.settings.localizationEnabled && text) {
      const language = this.ctx.settings.localizationLanguage;
      if (language) {
        const translationRequest: GenerateContentParameters = {
          model,
          contents: `Do not include any additional text like "Here is your translation" or other explanations—just the response itself in ${language}. Translate this text to ${language}: ${text}`,
          config: {
            safetySettings: this.safetySettings,
            maxOutputTokens: request.maxResponseTokens,
            temperature: 0.8,
            topP: 0.9,
          },
        };

        log.debug(`Gemini Translation Request: ${JSON.stringify(translationRequest, null, 2)}`);

        text = await this.generate(translationRequest);
      }
    }

    return {
      text: text?.trim() ?? '',
      request,
    };
  }

  async healthCheck(): Promise<{ status?: string; error?: string }> {
    try {
      const text = await this.generate({
        model: this.getGeminiModel(),
        config: {
          maxOutputTokens: 5,
          safetySettings: this.safetySettings,
        },
        contents: 'Test health check',
      });
      if (text) {
        return { status: 'Gemini API OK' };
      }

      return { error: 'Gemini API returned no text' };
    } catch (error) {
      if (error instanceof Error && error.message) {
        return { error: `Gemini API not working: ${error.message}` };
      }

      return { error: `Gemini API not working, check logs` };
    }
  }

  async getModels(): Promise<AIModel[]> {
    const genAI = this.getGenAIClient();

    const models: Model[] = [];

    try {
      const pager = await genAI.models.list();
      let page = pager.page;
      page.forEach((model) => models.push(model));
      while (pager.hasNextPage()) {
        page = await pager.nextPage();
        page.forEach((model) => models.push(model));
      }

      const filteredModels = models
        .filter((model) => {
          return model.supportedActions?.includes('generateContent');
        })
        .filter((model) => {
          // Exclude these models
          return ![
            'models/gemini-2.0-flash-exp-image-generation',
            'models/gemini-2.5-flash-preview-tts',
            'models/gemini-2.5-pro-preview-tts',
            'models/gemini-2.5-flash-image-preview',
            'models/gemini-2.5-flash-image',
            'models/gemini-3-pro-image-preview',
            'models/nano-banana-pro-preview',
            'models/gemini-robotics-er-1.5-preview',
            'models/gemini-2.5-computer-use-preview-10-2025',
            'models/deep-research-pro-preview-12-2025',
            'models/gemma-3-1b-it',
            'models/gemma-3-4b-it',
            'models/gemma-3-12b-it',
            'models/gemma-3-27b-it',
            'models/gemma-3n-e4b-it',
            'models/gemma-3n-e2b-it',
          ].includes(model.name ?? 'Unknown');
        });

      log.debug(`Filtered gemini models: ${JSON.stringify(filteredModels, null, 2)}`);

      return filteredModels.map((model) => ({
        name: model.name ?? 'Unknown',
        displayName: model.displayName ?? 'Unknown',
      }));
    } catch (error: any) {
      log.error('Error fetching Gemini models', error);
      throw error;
    }
  }

  async generate(request: GenerateContentParameters): Promise<string | undefined> {
    const genAI = this.getGenAIClient();

    for (let attempt = 0; attempt < maxRetries; attempt += 1) {
      try {
        const result = await genAI.models.generateContent(request);
        log.debug(`Gemini Response: ${result.text}`);

        return result.text;
      } catch (error: unknown) {
        let message = 'Unknown error';
        if (isApiError(error)) {
          message = error.message;
          log.debug(`the error?: ${JSON.stringify(error, null, 2)}`);
          if (error.status === 429) {
            throw new Error(
              `The Gemini AI free trial is restricted to not allow any free usage. To use Gemini AI, you need to setup a billing account https://aistudio.google.com/usage?tab=billing`,
              { cause: error },
            );
          } else if (error.status === 400 && error.message.includes('Developer instruction is not enabled for')) {
            throw new Error(
              `This Gemini AI model is not compatible with Sentient Sims, please choose a different Gemini AI model`,
              { cause: error },
            );
          }
        }

        log.error(`Gemini Error on attempt ${attempt}/${maxRetries}: ${message}`, error);
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
  }
}
