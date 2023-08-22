/* eslint-disable import/prefer-default-export,camelcase,no-useless-return */

import { encode } from '@nem035/gpt-3-encoder';
import { llamaTokenizer } from './llama/LLamaTokenizer';
import { PromptRequest } from './models/PromptRequest';
import { SentientMemory } from './models/SentientMemory';

export class PromptFormatter {
  private readonly customLLMEnabled: boolean;

  public readonly userToken = '### Instruction:';

  public readonly assistantToken = '### Response:';

  constructor(customLLMEnabled: boolean) {
    this.customLLMEnabled = customLLMEnabled;
  }

  formatMemory(memory: SentientMemory) {
    let entries;
    if (this.customLLMEnabled) {
      entries = [
        memory.action && `${this.userToken}\n${memory.action.trim()}`,
        memory.content && `${this.assistantToken}\n${memory.content.trim()}`,
        memory.observation && `${this.userToken}\n${memory.observation.trim()}`,
      ].filter(Boolean);
    } else {
      entries = [
        memory.action && memory.action.trim(),
        memory.content && memory.content.trim(),
        memory.observation && memory.observation.trim(),
      ].filter(Boolean);
    }

    if (entries) {
      return entries.join('\n');
    }

    return null;
  }

  encode(prompt: string) {
    if (this.customLLMEnabled) {
      return llamaTokenizer.encode(prompt);
    }

    // OpenAI encoder
    return encode(prompt);
  }

  combineFormattedPrompt(
    participants: string,
    location: string,
    memoriesToInsert: string[],
    actions?: string
  ) {
    if (this.customLLMEnabled) {
      return [
        [
          'Write a story in the third person, describing scenes clearly, explicitly, in vivid detail',
          "based on what's been said before",
          'using lots of dialog',
          'without predicting the future or giving a lesson',
          'ending each part on a cliffhanger, using these character descriptions:',
        ].join(', '),
        participants,
        '',
        location,
        '',
        memoriesToInsert.join('\n'),
        '',
        actions,
        '',
        this.assistantToken,
      ].join('\n');
    }

    return [participants, location, memoriesToInsert.join('\n'), actions].join(
      '\n'
    );
  }

  formatPrompt({
    max_tokens = 1800,
    memories,
    participants,
    location,
    pre_action,
    action,
  }: PromptRequest) {
    let actions: string | undefined;
    if (pre_action || action) {
      if (this.customLLMEnabled) {
        actions = `${this.userToken}\n${[pre_action, action].join(' ').trim()}`;
      } else {
        actions = [pre_action, action].join(' ');
      }
    }

    const prePromptTokenCount = this.encode(
      this.combineFormattedPrompt(participants, location, [], actions)
    ).length;

    const memoriesToInsert: string[] = [];
    let memoryTokenCount = 0;
    // eslint-disable-next-line no-plusplus
    for (let i = memories.length - 1; i >= 0; i--) {
      const memory = memories[i];
      if (memoryTokenCount + prePromptTokenCount > max_tokens) {
        break;
      }

      const formattedMemory = this.formatMemory(memory);
      if (formattedMemory) {
        memoriesToInsert.unshift(formattedMemory);
        const { length } = this.encode(formattedMemory);
        memoryTokenCount += length;
      }
    }

    let prompt = this.combineFormattedPrompt(
      participants,
      location,
      memoriesToInsert,
      actions
    );

    let tokenCount = this.encode(prompt).length;
    while (tokenCount > max_tokens) {
      memoriesToInsert.shift();
      prompt = this.combineFormattedPrompt(
        participants,
        location,
        memoriesToInsert,
        actions
      );
      tokenCount = this.encode(prompt).length;
    }

    return prompt;
  }

  formatOutput(text: string) {
    if (this.customLLMEnabled) {
      let output = text.split(this.userToken, 1)[0].trim();
      output = output.split(this.assistantToken, 1)[0].trim();
      return output;
    }

    return text;
  }
}
