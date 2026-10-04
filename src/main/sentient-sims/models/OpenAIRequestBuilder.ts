import log from 'electron-log';
import { TokenCounter } from 'main/sentient-sims/tokens/TokenCounter';
import { truncateToTokens } from '../util/tokenTruncate';
import { OpenAICompatibleRequest } from './OpenAICompatibleRequest';
import { ChatCompletionMessageRole } from './ChatCompletionMessageRole';
import { OpenAIMessage } from './OpenAIMessage';
import { filterNullAndUndefined } from '../util/filter';
import { PromptHistoryMode } from './PromptHistoryMode';

export type FormattedMemoryMessage = {
  content: string;
  role: ChatCompletionMessageRole;
};

export type PreFormattedMemoryMessage = FormattedMemoryMessage & {
  location: number;
  includeLocation: boolean;
};

export type PromptRequest = {
  location: string;
  dateTime: string;
  season: string;
  weather?: string;
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
  continue?: boolean;
  promptHistoryMode?: PromptHistoryMode;
  postures?: string;
  preAction?: string;
};

export type OneShotRequest = {
  systemPrompt: string;
  messages: string[];
  maxResponseTokens: number;
  maxTokens: number;
  userPreResponse?: string;
  assistantPreResponse?: string;
  preAssistantPreResponse?: string;
  guidedChoice?: string[];
};

export type ClassificationRequest = {
  name: string;
  classifiers: string[];
  messages: string[];
};

export type BuffEventRequest = {
  sim_id: string;
  name: string;
  classifiers: string[];
  messages: string[];
};

export type BuffDescriptionRequest = {
  name: string;
  mood: string;
  messages: string[];
};

// A one-shot's user text IS the payload — a scene transcript, a state report, a line to
// review. Dropping it leaves the model with a system prompt and nothing to work on, so an
// oversized payload is truncated rather than discarded, and never below this floor even when
// the system prompt alone already fills the context window.
export const MIN_ONE_SHOT_USER_TOKENS = 256;

export class OpenAIRequestBuilder {
  private readonly tokenCounter: TokenCounter;

  constructor(tokenCounter: TokenCounter) {
    this.tokenCounter = tokenCounter;
  }

  buildOpenAIRequest(promptRequest: PromptRequest): OpenAICompatibleRequest {
    const systemMessageContent = filterNullAndUndefined([
      promptRequest.systemPrompt,
      promptRequest.location,
      promptRequest.dateTime,
      promptRequest.season,
      promptRequest.weather,
      promptRequest.participants,
    ]).join('\n\n');
    const systemMessage: OpenAIMessage = {
      role: 'system',
      content: systemMessageContent,
      tokens: this.tokenCounter.countTokens(systemMessageContent),
    };

    const memoriesToInsert: OpenAIMessage[] = [];
    let tokenCount = systemMessage.tokens;

    if (promptRequest.action || promptRequest.preAction) {
      const userMessage: OpenAIMessage = {
        role: 'user',
        content: promptRequest.action ?? promptRequest.preAction ?? '',
        tokens: this.tokenCounter.countTokens(promptRequest.action ?? promptRequest.preAction ?? ''),
      };
      memoriesToInsert.push(userMessage);
      tokenCount += userMessage.tokens;
    }

    if (promptRequest.assistantPreResponse || promptRequest.preAssistantPreResponse) {
      const content = filterNullAndUndefined([
        promptRequest.preAssistantPreResponse,
        promptRequest.assistantPreResponse,
      ]).join(' ');
      const assistantMessage: OpenAIMessage = {
        role: 'assistant',
        content,
        tokens: this.tokenCounter.countTokens(content),
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

      if (memory.content.length <= 1) {
        continue;
      }

      const memoryMessage: OpenAIMessage = {
        role: memory.role,
        content: memory.content.replaceAll('*', ''),
        tokens: newTokens,
      };

      if (memoryMessage.role === 'user' && promptRequest.promptHistoryMode === PromptHistoryMode.NO_USER_HISTORY) {
        continue;
      }

      memoriesToInsert.unshift(memoryMessage);
    }

    return {
      messages: [systemMessage, ...memoriesToInsert],
      maxResponseTokens: promptRequest.maxResponseTokens,
      includesAssistantPreResponse:
        [promptRequest.assistantPreResponse, promptRequest.preAssistantPreResponse].some(
          (s) => s !== undefined && s !== '',
        ) || promptRequest.continue,
    };
  }

  buildOneShotOpenAIRequest(oneShotRequest: OneShotRequest): OpenAICompatibleRequest {
    const systemMessage: OpenAIMessage = {
      role: 'system',
      content: oneShotRequest.systemPrompt,
      tokens: this.tokenCounter.countTokens(oneShotRequest.systemPrompt),
    };

    const messages: OpenAIMessage[] = [];
    let reservedTokens = systemMessage.tokens;

    if (oneShotRequest.assistantPreResponse) {
      const assistantMessage: OpenAIMessage = {
        role: 'assistant',
        content: oneShotRequest.assistantPreResponse,
        tokens: this.tokenCounter.countTokens(oneShotRequest.assistantPreResponse),
      };
      messages.push(assistantMessage);
      reservedTokens += assistantMessage.tokens;
    }

    // The pre-response is instruction scaffolding ("### Input:", the buff brief), never the
    // payload, so it is charged against the budget but never truncated.
    if (oneShotRequest.userPreResponse) {
      reservedTokens += this.tokenCounter.countTokens(oneShotRequest.userPreResponse);
    }

    const availableTokens = Math.max(oneShotRequest.maxTokens - reservedTokens, MIN_ONE_SHOT_USER_TOKENS);

    const messageTexts = oneShotRequest.messages.map((message) => `${message}\n`);
    const messageTokens = messageTexts.map((text) => this.tokenCounter.countTokens(text));
    const requestedUserTokens = messageTokens.reduce((total, tokens) => total + tokens, 0);

    const memoriesToInsert: string[] = [];
    let userInputCount = 0;
    for (let i = messageTexts.length - 1; i >= 0; i--) {
      const remaining = availableTokens - userInputCount;
      if (remaining <= 0) {
        break;
      }

      if (messageTokens[i] <= remaining) {
        userInputCount += messageTokens[i];
        memoriesToInsert.unshift(messageTexts[i]);
        continue;
      }

      // Keep the tail: in a one-shot the end of the text is the part being acted on (the
      // scene action after the "previously" block, the newest lines of a transcript).
      const truncated = truncateToTokens(messageTexts[i], remaining, this.tokenCounter, 'tail');
      if (truncated !== '') {
        userInputCount += this.tokenCounter.countTokens(truncated);
        memoriesToInsert.unshift(truncated);
      }
      // Nothing older can fit once this one had to be cut.
      break;
    }

    if (oneShotRequest.userPreResponse) {
      memoriesToInsert.unshift(oneShotRequest.userPreResponse);
    }

    const userContent = memoriesToInsert.join('').trimEnd();
    const userInput: OpenAIMessage = {
      role: 'user',
      content: userContent,
      tokens: this.tokenCounter.countTokens(userContent),
    };

    const request: OpenAICompatibleRequest = {
      messages: [systemMessage, userInput, ...messages],
      maxResponseTokens: oneShotRequest.maxResponseTokens,
      guidedChoice: oneShotRequest.guidedChoice,
    };

    // Overflow is flagged whenever the request that goes out is over budget, not only when
    // user text was cut: a system prompt that alone fills the window (the director briefing
    // carries the whole scene context there) still leaves the floor's worth of user text in
    // place with nothing dropped, and that request is just as oversized.
    const droppedTokens = requestedUserTokens - userInputCount;
    const sentTokens = reservedTokens + userInputCount;
    if (droppedTokens > 0 || sentTokens > oneShotRequest.maxTokens) {
      request.promptOverflow = {
        budgetTokens: oneShotRequest.maxTokens,
        requestedTokens: reservedTokens + requestedUserTokens,
        droppedTokens,
      };
      log.warn(
        `prompt_overflow: one-shot prompt needed ${reservedTokens + requestedUserTokens} tokens against a ` +
          `${oneShotRequest.maxTokens} budget; truncated ${droppedTokens} tokens off the user message, ` +
          `sending ${sentTokens}`,
      );
    }

    return request;
  }
}
