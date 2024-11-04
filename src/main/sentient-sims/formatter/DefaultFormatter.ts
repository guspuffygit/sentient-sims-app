/* eslint-disable class-methods-use-this */
import { OneShotRequest, PromptRequest } from '../models/OpenAIRequestBuilder';
import { filterNullAndUndefined } from '../util/filter';
import { InputFormatter } from './InputOutputFormatting';

export class DefaultFormatter implements InputFormatter {
  formatInput(promptRequest: PromptRequest): PromptRequest {
    if (promptRequest.action) {
      promptRequest.action = filterNullAndUndefined([
        promptRequest.prePreAction,
        promptRequest.action,
      ]).join(' ');
    }

    return promptRequest;
  }

  formatOneShotRequest(oneShotRequest: OneShotRequest): OneShotRequest {
    return oneShotRequest;
  }
}
