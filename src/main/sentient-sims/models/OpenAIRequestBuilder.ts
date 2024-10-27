/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import { TokenCounter } from 'main/sentient-sims/tokens/TokenCounter';
import { OpenAICompatibleRequest } from './OpenAICompatibleRequest';
import { ChatCompletionMessageRole } from './ChatCompletionMessageRole';
import { OpenAIMessage } from './OpenAIMessage';

export type FormattedMemoryMessage = {
  content: string;
  role: ChatCompletionMessageRole;
};

export type PromptRequest2 = {
  location: string;
  dateTime: string;
  participants: string;
  systemPrompt: string;
  memories: FormattedMemoryMessage[];
  maxResponseTokens: number;
  maxTokens: number;
  action?: string;
  assistantPreResponse?: string;
  preAssistantPreResponse?: string;
  prePreAction?: string;
  stopTokens?: string[];
};

export type OneShotRequest = {
  systemPrompt: string;
  messages: string[];
  maxResponseTokens: number;
  maxTokens: number;
  userPreResponse?: string;
  assistantPreResponse?: string;
  guidedChoice?: string[];
};

export type ClassificationRequest = {
  name: string;
  classifiers: string[];
  messages: string[];
};

export type BuffRequest = {
  name: string;
  mood: string;
  messages: string[];
};

export class OpenAIRequestBuilder {
  private readonly tokenCounter: TokenCounter;

  constructor(tokenCounter: TokenCounter) {
    this.tokenCounter = tokenCounter;
  }

  buildOpenAIRequest(promptRequest: PromptRequest2): OpenAICompatibleRequest {
    const systemMessageContent = [
      promptRequest.systemPrompt,
      promptRequest.location,
      promptRequest.dateTime,
      promptRequest.participants,
    ].join('\n\n');
    const systemMessage: OpenAIMessage = {
      role: 'system',
      content: systemMessageContent,
      tokens: this.tokenCounter.countTokens(systemMessageContent),
    };

    const memoriesToInsert: OpenAIMessage[] = [];
    let tokenCount = systemMessage.tokens;

    if (promptRequest.action) {
      const userMessage: OpenAIMessage = {
        role: 'user',
        content: promptRequest.action,
        tokens: this.tokenCounter.countTokens(promptRequest.action),
      };
      memoriesToInsert.push(userMessage);
      tokenCount += userMessage.tokens;
    }

    if (promptRequest.assistantPreResponse) {
      const assistantMessage: OpenAIMessage = {
        role: 'assistant',
        content: promptRequest.assistantPreResponse,
        tokens: this.tokenCounter.countTokens(
          promptRequest.assistantPreResponse
        ),
      };
      memoriesToInsert.push(assistantMessage);
      tokenCount += assistantMessage.tokens;
    }

    for (let i = promptRequest.memories.length - 1; i >= 0; i--) {
      const memory = promptRequest.memories[i];

      const newTokens = this.tokenCounter.countTokens(memory.content);
      tokenCount += newTokens;
      if (tokenCount > promptRequest.maxTokens) {
        break;
      }

      const memoryMessage: OpenAIMessage = {
        role: memory.role,
        content: memory.content,
        tokens: newTokens,
      };

      memoriesToInsert.unshift(memoryMessage);
    }

    return {
      messages: [systemMessage, ...memoriesToInsert],
      maxResponseTokens: promptRequest.maxResponseTokens,
    };
  }

  buildOneShotOpenAIRequest(
    oneShotRequest: OneShotRequest
  ): OpenAICompatibleRequest {
    const systemMessage: OpenAIMessage = {
      role: 'system',
      content: oneShotRequest.systemPrompt,
      tokens: this.tokenCounter.countTokens(oneShotRequest.systemPrompt),
    };

    const messages: OpenAIMessage[] = [];
    const memoriesToInsert: string[] = [];
    let tokenCount = systemMessage.tokens;
    let userInputCount = 0;

    if (oneShotRequest.assistantPreResponse) {
      const assistantMessage: OpenAIMessage = {
        role: 'assistant',
        content: oneShotRequest.assistantPreResponse,
        tokens: this.tokenCounter.countTokens(
          oneShotRequest.assistantPreResponse
        ),
      };
      messages.push(assistantMessage);
      tokenCount += assistantMessage.tokens;
    }

    for (let i = oneShotRequest.messages.length - 1; i >= 0; i--) {
      const message = `${oneShotRequest.messages[i]}\n`;

      const newTokens = this.tokenCounter.countTokens(message);
      tokenCount += newTokens;
      userInputCount += newTokens;
      if (tokenCount > oneShotRequest.maxTokens) {
        break;
      }

      memoriesToInsert.unshift(message);
    }

    if (oneShotRequest.userPreResponse) {
      memoriesToInsert.unshift(oneShotRequest.userPreResponse);
    }

    const userInput: OpenAIMessage = {
      role: 'user',
      content: memoriesToInsert.join('').trimEnd(),
      tokens: userInputCount,
    };

    return {
      messages: [systemMessage, userInput, ...messages],
      maxResponseTokens: oneShotRequest.maxResponseTokens,
      guidedChoice: oneShotRequest.guidedChoice,
    };
  }
}
