import '@testing-library/jest-dom';
import {
  getGenerationService,
  getTokenCounter,
} from 'main/sentient-sims/factories/generationServiceFactory';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { OpenAIService } from 'main/sentient-sims/services/OpenAIService';
import { SentientSimsAIService } from 'main/sentient-sims/services/SentientSimsAIService';
import { SettingsService } from 'main/sentient-sims/services/SettingsService';
import { LLaMaTokenCounter } from 'main/sentient-sims/tokens/LLaMaTokenCounter';
import { OpenAITokenCounter } from 'main/sentient-sims/tokens/OpenAITokenCounter';

describe('Settings', () => {
  it('should return default value', () => {
    const settings = new SettingsService();
    const model = settings.get(SettingsEnum.OPENAI_MODEL);
    expect(model).toEqual('gpt-3.5-turbo');
  });

  it('get token counter custon llm enabled', () => {
    const settings = new SettingsService();
    settings.set(SettingsEnum.CUSTOM_LLM_ENABLED, true);
    const tokenCounter = getTokenCounter(settings);
    expect(tokenCounter instanceof LLaMaTokenCounter).toBeTruthy();
  });

  it('get token counter openai', () => {
    const settings = new SettingsService();
    settings.set(SettingsEnum.CUSTOM_LLM_ENABLED, false);
    const tokenCounter = getTokenCounter(settings);
    expect(tokenCounter instanceof OpenAITokenCounter).toBeTruthy();
  });

  it('get generation service openai', () => {
    const settings = new SettingsService();
    settings.set(SettingsEnum.CUSTOM_LLM_ENABLED, false);
    const service = getGenerationService(settings);
    expect(service instanceof OpenAIService).toBeTruthy();
  });

  it('get generation service custom llm', () => {
    const settings = new SettingsService();
    settings.set(SettingsEnum.CUSTOM_LLM_ENABLED, true);
    const service = getGenerationService(settings);
    expect(service instanceof SentientSimsAIService).toBeTruthy();
  });
});
