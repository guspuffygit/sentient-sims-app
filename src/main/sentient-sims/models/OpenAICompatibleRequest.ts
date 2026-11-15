import { ApiType } from './ApiType';
import { OpenAIMessage } from './OpenAIMessage';
import { ReasoningEffort } from './ReasoningEffort';

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
  // The provider config's reasoning effort, sent as reasoning_effort by the OpenAI-compatible
  // service. Undefined sends nothing.
  reasoningEffort?: ReasoningEffort;
  // What the request is for, sent to the Sentient Sims AI server as X-Sentient-Sims-Purpose
  purpose?: string;
  // Set by the request builder when the prompt did not fit its token budget and the user
  // message had to be cut. Surfaces on the AI exchange log so an oversized prompt is visible
  // instead of silently degrading the reply.
  promptOverflow?: {
    budgetTokens: number;
    requestedTokens: number;
    droppedTokens: number;
  };
};
