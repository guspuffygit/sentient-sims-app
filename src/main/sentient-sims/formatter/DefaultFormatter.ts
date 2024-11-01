/* eslint-disable class-methods-use-this */
import { OneShotRequest, PromptRequest2 } from '../models/OpenAIRequestBuilder';
import { filterNullAndUndefined } from '../util/filter';
import { InputFormatter } from './InputOutputFormatting';

export class DefaultFormatter implements InputFormatter {
  formatInput(promptRequest: PromptRequest2): PromptRequest2 {
    if (promptRequest.action) {
      promptRequest.action = filterNullAndUndefined([
        promptRequest.prePreAction,
        promptRequest.action,
      ]).join(' ');
      promptRequest.assistantPreResponse = filterNullAndUndefined([
        promptRequest.preAssistantPreResponse,
        promptRequest.assistantPreResponse,
      ]).join(' ');
    } else {
      promptRequest.assistantPreResponse = filterNullAndUndefined([
        promptRequest.preAssistantPreResponse,
        promptRequest.assistantPreResponse,
      ]).join(' ');
    }

    return promptRequest;
  }

  formatOneShotRequest(oneShotRequest: OneShotRequest): OneShotRequest {
    return oneShotRequest;
  }
}
