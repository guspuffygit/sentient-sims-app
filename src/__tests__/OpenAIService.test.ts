import '@testing-library/jest-dom';
import { OpenAIService } from 'main/sentient-sims/services/OpenAIService';
import { mockApiContext } from './util';

describe('OpenAIService', () => {
  it('getOpenAIModel default', async () => {
    const ctx = mockApiContext();
    const openAIService = new OpenAIService(ctx);
    expect(openAIService.getOpenAIModel()).toEqual('gpt-4o-mini');
  });
});
