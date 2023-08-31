import { PromptRequest } from '../models/PromptRequest';

export type GenerationResult = {
  prompt: PromptRequest;
  systemPrompt: string;
  output: string;
  err: any;
};
