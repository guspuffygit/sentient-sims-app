import { OpenAIMessage } from './OpenAIMessage';

export type OpenAICompatibleRequest = {
  messages: Array<OpenAIMessage>;
  maxResponseTokens: number;
  guidedChoice?: string[];
  includesAssistantPreResponse?: boolean;
  // Overrides the configured model for this request only (used by the directed-scene tester
  // to run the director and each actor on different models)
  model?: string;
};
