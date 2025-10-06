import { OneShotRequest, PromptRequest } from '../models/OpenAIRequestBuilder';

export interface InputFormatter {
  formatInput(promptRequest: PromptRequest): PromptRequest;
  formatOneShotRequest(oneShotRequest: OneShotRequest): OneShotRequest;
}
