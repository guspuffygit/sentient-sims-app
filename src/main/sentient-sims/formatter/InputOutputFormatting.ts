import {
  ClassificationRequest,
  PromptRequest2,
} from '../models/OpenAIRequestBuilder';

export interface InputFormatter {
  formatInput(promptRequest: PromptRequest2): PromptRequest2;
  formatClassification(
    classificationRequest: ClassificationRequest
  ): ClassificationRequest;
}

export interface OutputFormatter {}
