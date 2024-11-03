import { OneShotRequest, PromptRequest2 } from '../models/OpenAIRequestBuilder';

export interface InputFormatter {
  formatInput(promptRequest: PromptRequest2): PromptRequest2;
  formatOneShotRequest(oneShotRequest: OneShotRequest): OneShotRequest;
}

export interface OutputFormatter {}
