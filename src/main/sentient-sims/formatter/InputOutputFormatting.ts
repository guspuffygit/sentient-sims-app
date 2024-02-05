import { PromptRequest2 } from '../models/OpenAIRequestBuilder';

export interface InputFormatter {
  formatInput(promptRequest: PromptRequest2): PromptRequest2;
}

export interface OutputFormatter {}
