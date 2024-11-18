/* eslint-disable no-plusplus */
import { OpenAIMessage } from '../models/OpenAIMessage';

export function arraysAreEqual(arr1: number[], arr2: number[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

export function truncateMessages(
  truncateLength: number,
  breakStringTokens: number[],
  messagesTokens: number[],
  messages: OpenAIMessage[]
): OpenAIMessage[] {
  if (truncateLength > messagesTokens.length) {
    return messages;
  }

  const breakStringTokensLength = breakStringTokens.length;
  const messagesTokensLength = messagesTokens.length;
  const systemPromptUsed = messages[0].role === 'system';
  let systemPromptLength: number = 0; // Should be 8
  let chunksToChopOff = 0;

  for (let i = 0; i < messagesTokensLength; i++) {
    if (messagesTokens[i] === breakStringTokens[0]) {
      if (i + breakStringTokensLength > messagesTokensLength) {
        break;
      }

      if (
        arraysAreEqual(
          messagesTokens.slice(i, i + breakStringTokensLength),
          breakStringTokens
        )
      ) {
        if (systemPromptUsed && systemPromptLength === 0) {
          systemPromptLength = i;
        } else {
          chunksToChopOff++;
          const eliminatedTokens =
            i - systemPromptLength + breakStringTokensLength - 1;
          if (messagesTokensLength - eliminatedTokens < truncateLength) {
            break;
          }
        }
      }
    }
  }

  if (systemPromptUsed) {
    return [messages[0], ...messages.slice(1 + chunksToChopOff)];
  }

  return messages.slice(chunksToChopOff);
}
