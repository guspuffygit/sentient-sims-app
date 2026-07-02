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
  model?: string;
  apiType?: ApiType;
};
