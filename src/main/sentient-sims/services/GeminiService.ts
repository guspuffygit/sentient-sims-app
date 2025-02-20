import log from 'electron-log';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { AIModel } from '../models/AIModel';
import { fetchWithRetries } from '../util/fetchWithRetries';

export class GeminiKeysNotSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiKeysNotSetError';
  }
}

export class GeminiAPIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export class GeminiService implements GenerationService {
  private readonly settingsService: SettingsService;
  private genAI?: GoogleGenerativeAI;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  serviceUrl(): string {
    return this.settingsService.get(SettingsEnum.GEMINI_ENDPOINT) as string;
  }

  getGeminiModel(): string {
    return this.settingsService.get(SettingsEnum.GEMINI_MODEL) as string;
  }

  getGeminiKeys(): string[] {
    const keysString = this.settingsService.get(SettingsEnum.GEMINI_KEYS) as string;
    if (!keysString || keysString.trim() === '') {
      throw new GeminiKeysNotSetError('No Gemini API keys set. Please configure them in settings (e.g., key1,key2,key3).');
    }
    return keysString.split(',').map(key => key.trim()).filter(key => key.length > 0);
  }

  private getGenAIClient(): GoogleGenerativeAI {
    const keys = this.getGeminiKeys();
    const randomKey = getRandomItem(keys);
    log.debug(`Using Gemini API key: ${randomKey.substring(0, 5)}... (randomly selected from ${keys.length} keys)`);
    return new GoogleGenerativeAI(randomKey);
  }

  private readonly safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];

  async sentientSimsGenerate(request: OpenAICompatibleRequest, retries: number = 3): Promise<SimsGenerateResponse> {
    const genAI = this.getGenAIClient();
    const model = genAI.getGenerativeModel({
      model: this.getGeminiModel(),
      safetySettings: this.safetySettings,
      systemInstruction: request.messages.find(msg => msg.role === 'system')?.content,
    });

    const contents = request.messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
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

    let text: string;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await model.generateContent(fullRequest);
        text = result.response.text();
        log.debug(`Gemini Response: ${text}`);
        break;
      } catch (error: any) {
        const status = error.status || (error.response?.status);
        const message = error.message || 'Unknown error';
        log.error(`Gemini Error on attempt ${attempt}/${retries}: ${message}`, error);
        if (attempt === retries) throw error;
      }
    }

    // [CHANGED] Перевод применяем только к сгенерированному тексту, не меняя основной запрос
    if (this.settingsService.get(SettingsEnum.LOCALIZATION_ENABLED) && text) {
      const language = this.settingsService.get(SettingsEnum.LOCALIZATION_LANGUAGE);
      if (language) {
        const translationGenAI = this.getGenAIClient(); // Случайный ключ для перевода
        const translationModel = translationGenAI.getGenerativeModel({
          model: this.getGeminiModel(), // Та же модель, что и для генерации
          safetySettings: this.safetySettings,
        });

        const translationRequest = {
          contents: [{
            role: 'user',
            parts: [{ text: `Do not include any additional text like "Here is your translation" or other explanations—just the response itself in ${language}. Translate this text to ${language}: ${text}` }],
          }],
          generationConfig: {
            maxOutputTokens: request.maxResponseTokens,
            temperature: 0.8,
            topP: 0.9,
          },
          safetySettings: this.safetySettings,
        };
        log.debug(`Gemini Translation Request: ${JSON.stringify(translationRequest, null, 2)}`);

        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            const translationResult = await translationModel.generateContent(translationRequest);
            text = translationResult.response.text();
            log.debug(`Gemini Translated Response: ${text}`);
            break;
          } catch (error: any) {
            const status = error.status || (error.response?.status);
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
      const response = await fetchWithRetries(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new GeminiAPIError(response.status, `Failed to fetch Gemini models: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      log.debug(`Gemini Models Response: ${JSON.stringify(data, null, 2)}`);

      return (data.models || []).map((model: any) => ({
        name: model.name.split('/').pop(),
        displayName: model.displayName || model.name.split('/').pop(),
      }));
    } catch (error: any) {
      log.error('Error fetching Gemini models', error);
      if (error instanceof GeminiAPIError) {
        throw error;
      }
      return [
        { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' },
        { name: 'gemini-2.0-flash-exp', displayName: 'Gemini 2.0 Flash Experimental' },
      ];
    }
  }
}
