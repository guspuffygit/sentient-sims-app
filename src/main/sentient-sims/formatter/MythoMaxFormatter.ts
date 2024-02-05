/* eslint-disable class-methods-use-this */
import { PromptRequest2 } from '../models/OpenAIRequestBuilder';
import { InputFormatter } from './InputOutputFormatting';

export class MythoMaxFormatter implements InputFormatter {
  formatInput(promptRequest: PromptRequest2): PromptRequest2 {
    if (promptRequest.action) {
      promptRequest.action = `### Input:\n${promptRequest.action}`;
      promptRequest.assistantPreResponse = `### Response: (length = medium):\n${promptRequest.assistantPreResponse}`;
    } else {
      promptRequest.assistantPreResponse = `### Response:\n${promptRequest.assistantPreResponse}`;
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
