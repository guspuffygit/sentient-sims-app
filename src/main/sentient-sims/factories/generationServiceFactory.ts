import { GenerationService } from '../services/GenerationService';
import { SettingsEnum } from '../models/SettingsEnum';
import { OpenAIService } from '../services/OpenAIService';
import { SettingsService } from '../services/SettingsService';
import { SentientSimsAIService } from '../services/SentientSimsAIService';
import { TokenCounter } from '../tokens/TokenCounter';
import { LLaMaTokenCounter } from '../tokens/LLaMaTokenCounter';
import { OpenAITokenCounter } from '../tokens/OpenAITokenCounter';
import { ApiType } from '../models/ApiType';
import { NovelAIService } from '../services/NovelAIService';
import { NovelAITokenCounter } from '../tokens/NovelAITokenCounter';
import { KoboldAIService } from '../services/KoboldAIService';
import { AllModelSettings, ModelSettings } from '../modelSettings';
import { stringType } from '../util/typeChecks';
import { GeminiService } from '../services/GeminiService';

export function getGenerationService(
  settingsService: SettingsService
): GenerationService {
  const aiType = settingsService.get(SettingsEnum.AI_API_TYPE);
  if (aiType === ApiType.SentientSimsAI || aiType === ApiType.CustomAI) {
    return new SentientSimsAIService(settingsService);
  }

  if (aiType === ApiType.KoboldAI) {
    return new KoboldAIService(settingsService);
  }

  if (aiType === ApiType.NovelAI) {
    return new NovelAIService(settingsService);
  }

  if (aiType === ApiType.Gemini) {
    return new GeminiService(settingsService);
  }

  return new OpenAIService(settingsService);
}

export function getTokenCounter(
  settingsService: SettingsService
): TokenCounter {
  const aiType = settingsService.get(SettingsEnum.AI_API_TYPE);

  if (aiType === ApiType.NovelAI) {
    return new NovelAITokenCounter();
  }

  if (aiType === ApiType.OpenAI) {
    return new OpenAITokenCounter();
  }

  return new LLaMaTokenCounter();
}

export function getModelSettings(
  settingsService: SettingsService
): ModelSettings {
  const aiType = settingsService.get(SettingsEnum.AI_API_TYPE);

  let modelSettings = AllModelSettings.default;
  let model: string | unknown = null;

  if (aiType === ApiType.OpenAI) {
    model = settingsService.get(SettingsEnum.OPENAI_MODEL);
  }

  if (aiType === ApiType.SentientSimsAI) {
    model = settingsService.get(SettingsEnum.SENTIENTSIMSAI_MODEL);
  }

  if (aiType === ApiType.Gemini) {
    model = settingsService.get(SettingsEnum.GEMINI_MODEL);
  }

  if (stringType(model) && model in AllModelSettings) {
    modelSettings = AllModelSettings[model];
  }

  return modelSettings;
}
