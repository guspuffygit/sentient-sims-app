import log from 'electron-log';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { AIModel } from '../models/AIModel';
import { getRandomItem } from '../util/getRandomItem';
import { GeminiKeysNotSetError } from '../exceptions/GeminiKeyNotSetError';
import { GeminiAPIError } from '../exceptions/GeminiAPIError';
import { axiosClient } from '../clients/AxiosClient';
import { ApiContext } from './ApiContext';

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

  private getGenAIClient(): GoogleGenerativeAI {
    const keys = this.getGeminiKeys();
    const randomKey = getRandomItem(keys);
    return new GoogleGenerativeAI(randomKey);
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

  async sentientSimsGenerate(request: OpenAICompatibleRequest, retries: number = 3): Promise<SimsGenerateResponse> {
    const genAI = this.getGenAIClient();
    const model = genAI.getGenerativeModel({
      model: this.getGeminiModel(),
      safetySettings: this.safetySettings,
      systemInstruction: request.messages.find((msg) => msg.role === 'system')?.content,
    });

    const contents = request.messages
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    log.debug(`Gemini Request Contents: ${JSON.stringify(contents, null, 2)}`);
    const fullRequest = {
      contents,
      generationConfig: {
        maxOutputTokens: request.maxResponseTokens,
        temperature: 0.8,
        topP: 0.9,
      },
      safetySettings: this.safetySettings,
    };
    log.debug(`Full Gemini Request: ${JSON.stringify(fullRequest, null, 2)}`);

    let text: string | undefined;
    for (let attempt = 0; attempt < retries; attempt += 1) {
      try {
        const result = await model.generateContent(fullRequest);
        text = result.response.text();
        log.debug(`Gemini Response: ${text}`);
        break;
      } catch (error: any) {
        const message = error.message || 'Unknown error';
        log.error(`Gemini Error on attempt ${attempt}/${retries}: ${message}`, error);
        if (attempt === retries) throw error;
      }
    }

    if (this.ctx.settings.localizationEnabled && text) {
      const language = this.ctx.settings.localizationLanguage;
      if (language) {
        const translationGenAI = this.getGenAIClient();
        const translationModel = translationGenAI.getGenerativeModel({
          model: this.getGeminiModel(),
          safetySettings: this.safetySettings,
        });

        const translationRequest = {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Do not include any additional text like "Here is your translation" or other explanations—just the response itself in ${language}. Translate this text to ${language}: ${text}`,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: request.maxResponseTokens,
            temperature: 0.8,
            topP: 0.9,
          },
          safetySettings: this.safetySettings,
        };
        log.debug(`Gemini Translation Request: ${JSON.stringify(translationRequest, null, 2)}`);

        for (let attempt = 0; attempt < retries; attempt += 1) {
          try {
            const translationResult = await translationModel.generateContent(translationRequest);
            text = translationResult.response.text();
            log.debug(`Gemini Translated Response: ${text}`);
            break;
          } catch (error: any) {
            const message = error.message || 'Unknown error';
            log.error(`Gemini Translation Error on attempt ${attempt}/${retries}: ${message}`, error);
            if (attempt === retries) throw error;
          }
        }
      }
    }

    return {
      text: text!.trim(),
      request,
    };
  }

  async healthCheck(): Promise<{ status?: string; error?: string }> {
    try {
      const genAI = this.getGenAIClient();
      const model = genAI.getGenerativeModel({
        model: this.getGeminiModel(),
        safetySettings: this.safetySettings,
      });
      const result = await model.generateContent('Test health check');
      if (result.response.text()) {
        return { status: 'Gemini API OK' };
      }
      return { error: 'Gemini API returned no text' };
    } catch (error: any) {
      log.error('Error checking Gemini API health', error);
      if (error instanceof GeminiAPIError) {
        return { error: `Gemini API error ${error.status}: ${error.message}` };
      }
      return { error: `Gemini API not working: ${error.message}` };
    }
  }

  async getModels(): Promise<AIModel[]> {
    const keys = this.getGeminiKeys();
    const randomKey = getRandomItem(keys);
    const url = `${this.serviceUrl()}/models?key=${randomKey}`;

    try {
      const response = await axiosClient({
        url,
        method: 'GET',
      });

      const { data } = response;
      log.debug(`Gemini Models Response: ${JSON.stringify(data, null, 2)}`);

      return (data.models || []).map((model: any) => ({
        name: model.name.split('/').pop(),
        displayName: model.displayName || model.name.split('/').pop(),
      }));
    } catch (error: any) {
      log.error('Error fetching Gemini models', error);
      throw error;
    }
  }
}
