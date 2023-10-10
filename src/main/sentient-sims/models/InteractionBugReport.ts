import { PromptRequest } from './PromptRequest';
import { SentientMemory } from './SentientMemory';

export type InteractionBugReport = {
  username: string;
  interactionTitle: string;
  bugDetails: string;
  promptRequest: PromptRequest;
  memory: SentientMemory;
};
