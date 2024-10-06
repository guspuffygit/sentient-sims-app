import '@testing-library/jest-dom';
import {
  getGenerationService,
  getTokenCounter,
} from 'main/sentient-sims/factories/generationServiceFactory';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { NovelAIService } from 'main/sentient-sims/services/NovelAIService';
import { OpenAIService } from 'main/sentient-sims/services/OpenAIService';
import { SentientSimsAIService } from 'main/sentient-sims/services/SentientSimsAIService';
import { SettingsService } from 'main/sentient-sims/services/SettingsService';
import { LLaMaTokenCounter } from 'main/sentient-sims/tokens/LLaMaTokenCounter';
import { NovelAITokenCounter } from 'main/sentient-sims/tokens/NovelAITokenCounter';
import { OpenAITokenCounter } from 'main/sentient-sims/tokens/OpenAITokenCounter';

describe('Settings', () => {
  it('should return default value', () => {
    const settings = new SettingsService();
    const model = settings.get(SettingsEnum.OPENAI_MODEL);
    expect(model).toEqual('gpt-4o-mini');
  });

  it('get ai type openai', () => {
    const settings = new SettingsService();
    settings.set(SettingsEnum.AI_API_TYPE, ApiType.OpenAI);
    const tokenCounter = getTokenCounter(settings);
    expect(tokenCounter instanceof OpenAITokenCounter).toBeTruthy();

    const service = getGenerationService(settings);
    expect(service instanceof OpenAIService).toBeTruthy();
  });

  it('get ai type novelai', () => {
    const settings = new SettingsService();
    settings.set(SettingsEnum.AI_API_TYPE, ApiType.NovelAI);
    const tokenCounter = getTokenCounter(settings);
    expect(tokenCounter instanceof NovelAITokenCounter).toBeTruthy();

    const service = getGenerationService(settings);
    expect(service instanceof NovelAIService).toBeTruthy();
  });

  it('get ai type custom', () => {
    const settings = new SettingsService();
    settings.set(SettingsEnum.AI_API_TYPE, ApiType.CustomAI);
    const tokenCounter = getTokenCounter(settings);
    expect(tokenCounter instanceof LLaMaTokenCounter).toBeTruthy();

    const service = getGenerationService(settings);
    expect(service instanceof SentientSimsAIService).toBeTruthy();
  });

  it('get ai type sentient sims', () => {
    const settings = new SettingsService();
    settings.set(SettingsEnum.AI_API_TYPE, ApiType.SentientSimsAI);
    const tokenCounter = getTokenCounter(settings);
    expect(tokenCounter instanceof LLaMaTokenCounter).toBeTruthy();

    const service = getGenerationService(settings);
    expect(service instanceof SentientSimsAIService).toBeTruthy();
  });
});
