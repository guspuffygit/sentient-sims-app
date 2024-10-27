import { OpenAIMessage } from './OpenAIMessage';

export type OpenAICompatibleRequest = {
  messages: Array<OpenAIMessage>;
  maxResponseTokens: number;
  guidedChoice?: string[];
};
