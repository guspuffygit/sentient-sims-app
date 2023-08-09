import { SentientMemory } from './SentientMemory';

export type PromptRequest = {
  participants: string;
  location: string;
  memories: SentientMemory[];
  pre_action?: string;
  action?: string;
  max_tokens?: number;
};
