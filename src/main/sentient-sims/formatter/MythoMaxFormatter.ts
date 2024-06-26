/* eslint-disable class-methods-use-this */
import { PromptRequest2 } from '../models/OpenAIRequestBuilder';
import { filterNullAndUndefined } from '../util/filter';
import { InputFormatter } from './InputOutputFormatting';

export class MythoMaxFormatter implements InputFormatter {
  formatInput(promptRequest: PromptRequest2): PromptRequest2 {
    if (promptRequest.action) {
      promptRequest.action = filterNullAndUndefined([
        '### Input:\n',
        promptRequest.prePreAction,
        promptRequest.action,
      ]).join(' ');
      promptRequest.assistantPreResponse = filterNullAndUndefined([
        '### Response: (length = medium):\n',
        promptRequest.preAssistantPreResponse,
        promptRequest.assistantPreResponse,
      ]).join(' ');
    } else {
      promptRequest.assistantPreResponse = filterNullAndUndefined([
        '### Response:\n',
        promptRequest.preAssistantPreResponse,
        promptRequest.assistantPreResponse,
      ]).join(' ');
    }

    promptRequest.memories.forEach((memory) => {
      if (memory.role === 'assistant') {
        memory.content = `### Response:\n${memory.content}`;
      }
      if (memory.role === 'user') {
        memory.content = `### Input:\n${memory.content}`;
      }
    });

    promptRequest.systemPrompt = `### Instruction:\n${promptRequest.systemPrompt}`;

    return promptRequest;
  }
}
