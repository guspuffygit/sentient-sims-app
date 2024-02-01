import { GenerationService } from '../services/GenerationService';
import { SettingsEnum } from '../models/SettingsEnum';
import { OpenAIService } from '../services/OpenAIService';
import { SettingsService } from '../services/SettingsService';
import { SentientSimsAIService } from '../services/SentientSimsAIService';
import { TokenCounter } from '../tokens/TokenCounter';
import { LLaMaTokenCounter } from '../tokens/LLaMaTokenCounter';
import { OpenAITokenCounter } from '../tokens/OpenAITokenCounter';

export function getGenerationService(
  settingsService: SettingsService
): GenerationService {
  if (settingsService.get(SettingsEnum.CUSTOM_LLM_ENABLED)) {
    return new SentientSimsAIService(settingsService);
  }

  return new OpenAIService(settingsService);
}

export function getTokenCounter(
  settingsService: SettingsService
): TokenCounter {
  if (settingsService.get(SettingsEnum.CUSTOM_LLM_ENABLED)) {
    return new LLaMaTokenCounter();
  }

  return new OpenAITokenCounter();
}
