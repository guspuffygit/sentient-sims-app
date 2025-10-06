import '@testing-library/jest-dom';
import { OpenAIService } from 'main/sentient-sims/services/OpenAIService';
import { SettingsService } from 'main/sentient-sims/services/SettingsService';

describe('OpenAIService', () => {
  it('getOpenAIModel default', async () => {
    const settingsService = new SettingsService();
    const openAIService = new OpenAIService(settingsService);
    expect(openAIService.getOpenAIModel()).toEqual('gpt-4o-mini');
  });
});
