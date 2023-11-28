/* eslint-disable no-console */
import '@testing-library/jest-dom';
import { OpenAIPromptFormatter } from 'main/sentient-sims/formatter/OpenAIPromptFormatter';
import { OpenAIService } from 'main/sentient-sims/services/OpenAIService';
import { SettingsService } from 'main/sentient-sims/services/SettingsService';
import { PromptRequest } from 'main/sentient-sims/models/PromptRequest';
import { defaultSystemPrompt } from 'main/sentient-sims/constants';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
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

  it('sentientSimsGenerate', async () => {
    const directoryService = mockDirectoryService();
    const settingsService = new SettingsService();
    const openAIService = new OpenAIService(
      directoryService,
      settingsService,
      new OpenAIPromptFormatter()
    );
    const promptRequest: PromptRequest = {
      participants: 'Gus',
      location: 'Square cube',
      memories: [],
      pre_action: 'Looks around',
    };
    const result = await openAIService.sentientSimsGenerate(promptRequest);
    expect(result.systemPrompt).toEqual(defaultSystemPrompt);
    expect(result.text).toContain('Gus');
  }, 20000);

  it('translation', async () => {
    // No way this test is gonna pass every time
    const directoryService = mockDirectoryService();
    const settingsService = new SettingsService();
    settingsService.set(SettingsEnum.LOCALIZATION_ENABLED, true);
    settingsService.set(SettingsEnum.LOCALIZATION_LANGUAGE, 'Spanish');
    const openAIService = new OpenAIService(
      directoryService,
      settingsService,
      new OpenAIPromptFormatter()
    );
    const systemPrompt = 'Return the text "Alright?"';
    const promptRequest: PromptRequest = {
      participants: '',
      location: '',
      memories: [],
      systemPrompt,
    };
    const result = await openAIService.sentientSimsGenerate(promptRequest);
    console.log(result.text);
    expect(result.systemPrompt).toEqual(systemPrompt);
    const possibleMatches = ['acuerdo?', 'bien?'];
    const isMatch = possibleMatches.some((item) =>
      result.text.toLocaleLowerCase().includes(item)
    );
    expect(isMatch).toBeTruthy();
  }, 20000);

  it('wants doesnt throw an error', async () => {
    const directoryService = mockDirectoryService();
    const settingsService = new SettingsService();
    settingsService.set(SettingsEnum.LOCALIZATION_ENABLED, true);
    settingsService.set(SettingsEnum.LOCALIZATION_LANGUAGE, 'Spanish');
    const openAIService = new OpenAIService(
      directoryService,
      settingsService,
      new OpenAIPromptFormatter()
    );
    const promptRequest: PromptRequest = {
      participants: 'Gus',
      location: 'Square',
      memories: [],
    };
    const result = await openAIService.sentientSimsWants(promptRequest);
    console.log(result.text);
    console.log(result.systemPrompt);
  }, 20000);
});
