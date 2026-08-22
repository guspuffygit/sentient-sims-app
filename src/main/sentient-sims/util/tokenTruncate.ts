import log from 'electron-log';
import { OpenAIMessage } from '../models/OpenAIMessage';
import { TokenCounter } from '../tokens/TokenCounter';

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
  messages: OpenAIMessage[],
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

      if (arraysAreEqual(messagesTokens.slice(i, i + breakStringTokensLength), breakStringTokens)) {
        if (systemPromptUsed && systemPromptLength === 0) {
          systemPromptLength = i;
        } else {
          chunksToChopOff++;
          const eliminatedTokens = i - systemPromptLength + breakStringTokensLength - 1;
          if (messagesTokensLength - eliminatedTokens < truncateLength) {
            log.debug(
              `Eliminated tokens from prompt: ${messagesTokensLength} - ${eliminatedTokens} = ${
                messagesTokensLength - eliminatedTokens
              } < ${truncateLength}`,
            );
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

/**
 * Cut text down to a token budget, keeping either the start or the end of the string.
 * Binary-searches on character length because token counts only exist for whole strings.
 */
export function truncateToTokens(
  text: string,
  maxTokens: number,
  tokenCounter: TokenCounter,
  keep: 'head' | 'tail' = 'tail',
): string {
  if (maxTokens <= 0) {
    return '';
  }
  if (tokenCounter.countTokens(text) <= maxTokens) {
    return text;
  }
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const slice = keep === 'tail' ? text.slice(text.length - mid) : text.slice(0, mid);
    if (tokenCounter.countTokens(slice) <= maxTokens) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return keep === 'tail' ? text.slice(text.length - lo) : text.slice(0, lo);
}
