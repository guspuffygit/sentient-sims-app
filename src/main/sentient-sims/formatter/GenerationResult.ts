import { PromptRequest } from '../models/PromptRequest';

export type GenerationResult = {
  prompt: PromptRequest;
  output: string;
  err: any;
};
