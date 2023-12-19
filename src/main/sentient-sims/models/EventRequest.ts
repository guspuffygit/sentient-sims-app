import { SentientMemory } from './SentientMemory';

export type EventRequest = {
  participants: string;
  location_id: number;
  memories: SentientMemory[];
  pre_action?: string;
  model?: string;
  systemPrompt?: string;
  preResponse?: string;
  nsfw?: boolean;
};
