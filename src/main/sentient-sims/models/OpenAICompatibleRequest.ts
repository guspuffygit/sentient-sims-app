import { ApiType } from './ApiType';
import { OpenAIMessage } from './OpenAIMessage';

export type OpenAICompatibleRequest = {
  messages: Array<OpenAIMessage>;
  maxResponseTokens: number;
  guidedChoice?: string[];
  includesAssistantPreResponse?: boolean;
  // Provider config resolved for this action; when undefined the generation
  // service falls back to its provider-level settings. apiType matters when
  // one service class handles several provider types (SentientSimsAI/CustomAI).
  // model also overrides the configured model for this request only (used by the
  // directed-scene tester to run the director and each actor on different models).
  model?: string;
  apiType?: ApiType;
  // Set by the request builder when the prompt did not fit its token budget and the user
  // message had to be cut. Surfaces on the AI exchange log so an oversized prompt is visible
  // instead of silently degrading the reply.
  promptOverflow?: {
    budgetTokens: number;
    requestedTokens: number;
    droppedTokens: number;
  };
};
