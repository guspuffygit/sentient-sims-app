import { ChatCompletionMessageParam } from 'openai/resources';
import log from 'electron-log';
import { VLLMRTokenizeResponse } from '../models/VLLMChatCompletionRequest';

export function truncateTokens(
  maxTokens: number,
  tokenizeResponse: VLLMRTokenizeResponse,
  messages: ChatCompletionMessageParam[]
) {
  if (maxTokens > tokenizeResponse.count) {
    return messages;
  }

  let zeroIndex = tokenizeResponse.tokens.indexOf(0);
  // If 0 is not found, return the entire array
  if (zeroIndex === -1) {
    return messages;
  }

  const systemPromptTokens = tokenizeResponse.tokens.slice(0, zeroIndex);
  const systemPromptTokensLength = systemPromptTokens.length;
  let messageTokens = tokenizeResponse.tokens.slice(zeroIndex + 1);
  let chunksRemoved = 0;
  while (messageTokens.length + systemPromptTokensLength > maxTokens) {
    zeroIndex = messageTokens.indexOf(0);
    if (zeroIndex === -1) {
      log.error(
        `Unable to truncate tokens for prompt: ${messages
          .map((m) => m.content)
          .join('\n')}`
      );
      return messages;
    }

    messageTokens = messageTokens.slice(zeroIndex + 1);
    chunksRemoved += 1;
  }

  return [messages[0], ...messages.slice(chunksRemoved + 1)];
}
