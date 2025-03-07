import '@testing-library/jest-dom';
import { OpenAIMessage } from 'main/sentient-sims/models/OpenAIMessage';
import {
  arraysAreEqual,
  truncateMessages,
} from 'main/sentient-sims/util/tokenTruncate';

describe('TruncateTokens', () => {
  it('test truncate', () => {
    const breakStringTokens = [12130, 1066, 3609, 26039, 8424];
    const messageTokens = [
      1, 3, 7801, 2903, 1395, 1593, 5564, 1063, 12130, 1066, 3609, 26039, 8424,
      4, 1073, 2607, 2405, 2840, 1494, 7444, 1317, 1402, 5564, 2903, 1046,
      12130, 1066, 3609, 26039, 8424, 2, 3, 7493, 4558, 1395, 1278, 21283, 1063,
      12130, 1066, 3609, 26039, 8424, 4, 1784, 21283, 1395, 10991, 1046, 12130,
      1066, 3609, 26039, 8424, 2,
    ];
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: 'Respond to the user with NO',
        tokens: 0,
      },
      {
        role: 'user',
        content: 'How well is this working?',
        tokens: 0,
      },
      {
        role: 'assistant',
        content: "I don't know it seems to be working well.",
        tokens: 0,
      },
      {
        role: 'user',
        content: 'What color is the sky?',
        tokens: 0,
      },
      {
        role: 'assistant',
        content: 'The sky is blue.',
        tokens: 0,
      },
    ];
    const expectedMessages: OpenAIMessage[] = [
      {
        role: 'system',
        content: 'Respond to the user with NO',
        tokens: 0,
      },
      {
        role: 'assistant',
        content: "I don't know it seems to be working well.",
        tokens: 0,
      },
      {
        role: 'user',
        content: 'What color is the sky?',
        tokens: 0,
      },
      {
        role: 'assistant',
        content: 'The sky is blue.',
        tokens: 0,
      },
    ];
    const result = truncateMessages(
      45,
      breakStringTokens,
      messageTokens,
      messages,
    );
    expect(result).toEqual(expectedMessages);
  });

  it('test equal arrays', () => {
    expect(arraysAreEqual([], [])).toBeTruthy();
    expect(arraysAreEqual([1], [1])).toBeTruthy();
    expect(arraysAreEqual([1, 2], [1])).toBeFalsy();
    expect(arraysAreEqual([1], [])).toBeFalsy();
    expect(arraysAreEqual([1], [2])).toBeFalsy();
    expect(arraysAreEqual([1, 2], [1, 2])).toBeTruthy();
  });
});
