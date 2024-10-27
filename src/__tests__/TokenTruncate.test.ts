/* eslint-disable no-console */
import '@testing-library/jest-dom';
import { VLLMRTokenizeResponse } from 'main/sentient-sims/models/VLLMChatCompletionRequest';
import { truncateTokens } from 'main/sentient-sims/util/tokenTruncate';
import { ChatCompletionMessageParam } from 'openai/resources';

function generateArray(): number[] {
  const result: number[] = [];

  for (let i = 1; i < 4000; i += 1) {
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    // eslint-disable-next-line no-constant-condition
    if (i % 250 === 0) {
      result.push(0);
    } else {
      result.push(randomNumber);
    }
  }

  return result;
}

describe('TruncateTokens', () => {
  it('test truncate', async () => {
    const tokenArray = generateArray();
    console.log(`TokenArray: ${tokenArray.length}`);

    const tokenizeResponse: VLLMRTokenizeResponse = {
      count: tokenArray.length,
      max_model_len: 3700,
      tokens: tokenArray,
    };

    const messages: ChatCompletionMessageParam[] = [
      {
        content: 'system content',
        role: 'system',
      },
      {
        content: 'user content',
        role: 'user',
      },
      {
        content: 'assistant content',
        role: 'assistant',
      },
      {
        content: 'user content 2',
        role: 'user',
      },
      {
        content: 'assistant content 2',
        role: 'assistant',
      },
    ];

    const expectedMessages = [messages[0], ...messages.slice(3)];
    const result = truncateTokens(
      tokenizeResponse.max_model_len,
      tokenizeResponse,
      messages
    );

    expect(result).toEqual(expectedMessages);
  });
});
