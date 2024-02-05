/* eslint-disable class-methods-use-this */
import { PromptRequest2 } from '../models/OpenAIRequestBuilder';
import { InputFormatter } from './InputOutputFormatting';

export class NovelAIFormatter implements InputFormatter {
  formatInput(promptRequest: PromptRequest2): PromptRequest2 {
    if (promptRequest.action) {
      promptRequest.action = `{${promptRequest.action}}`;
    }

    promptRequest.memories.forEach((memory) => {
      if (memory.role === 'assistant') {
        memory.content = `${memory.content}`;
      }
      if (memory.role === 'user') {
        memory.content = `{${memory.content}}`;
      }
    });

    return promptRequest;
  }
}
