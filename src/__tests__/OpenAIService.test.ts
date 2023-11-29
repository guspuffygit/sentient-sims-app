/* eslint-disable no-console */
import '@testing-library/jest-dom';
import { OpenAIPromptFormatter } from 'main/sentient-sims/formatter/OpenAIPromptFormatter';
import { OpenAIService } from 'main/sentient-sims/services/OpenAIService';
import { SettingsService } from 'main/sentient-sims/services/SettingsService';
import { mockDirectoryService } from './util';

describe('OpenAIService', () => {
  it('test works', async () => {
    const directoryService = mockDirectoryService();
    const settingsService = new SettingsService();
    const openAIService = new OpenAIService(
      directoryService,
      settingsService,
      new OpenAIPromptFormatter()
    );
    const result = await openAIService.testOpenAI();
    expect(result.status).toEqual('OK');
  });

  it('getVector doesnt throw an error', async () => {
    const directoryService = mockDirectoryService();
    const settingsService = new SettingsService();
    const openAIService = new OpenAIService(
      directoryService,
      settingsService,
      new OpenAIPromptFormatter()
    );
    await openAIService.getVector('ok');
  });

  it('getOpenAIModel default', async () => {
    const directoryService = mockDirectoryService();
    const settingsService = new SettingsService();
    const openAIService = new OpenAIService(
      directoryService,
      settingsService,
      new OpenAIPromptFormatter()
    );
    expect(openAIService.getOpenAIModel()).toEqual('gpt-3.5-turbo');
  });
});
