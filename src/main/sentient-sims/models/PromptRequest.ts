import { SentientMemory } from './SentientMemory';

export type PromptRequest = {
  participants: string;
  location: string;
  memories: SentientMemory[];
  pre_action?: string;
  model?: string;
  systemPrompt?: string;
  preResponse?: string;
  nsfw?: boolean;
};
