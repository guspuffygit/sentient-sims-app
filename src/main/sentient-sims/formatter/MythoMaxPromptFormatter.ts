/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
import { PromptFormatter } from './PromptFormatter';
import { SentientMemory } from '../models/SentientMemory';
import { PromptRequest } from '../models/PromptRequest';
import { llamaTokenizer } from '../llama/LLamaTokenizer';

export class MythoMaxPromptFormatter implements PromptFormatter {
  public readonly userToken = '### Instruction:';

  public readonly assistantToken = '### Response:';

  encode(prompt: string): number[] {
    return llamaTokenizer.encode(prompt);
  }

  combineFormattedPrompt(
    participants: string,
    location: string,
    memoriesToInsert: string[],
    actions?: string
  ): string {
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

  formatMemory(memory: SentientMemory) {
    const entries = [
      memory.action && `${this.userToken}\n${memory.action.trim()}`,
      memory.content && `${this.assistantToken}\n${memory.content.trim()}`,
      memory.observation && `${this.userToken}\n${memory.observation.trim()}`,
    ].filter(Boolean);

    if (entries.length > 0) {
      return entries.join('\n');
    }

    return undefined;
  }

  formatOutput(text: string): string {
    let output = text.split(this.userToken, 1)[0].trim();
    output = output.split(this.assistantToken, 1)[0].trim();
    return output;
  }

  formatActions(preAction?: string, action?: string) {
    const actions: string[] = [];

    if (preAction) {
      actions.push(preAction.trim());
    }
    if (action) {
      actions.push(action.trim());
    }

    if (actions.length > 0) {
      return `${this.userToken}\n${actions.join(' ')}`;
    }

    return undefined;
  }

  formatPrompt({
    max_tokens = 3700,
    memories,
    participants,
    location,
    pre_action,
    action,
  }: PromptRequest) {
    const actions = this.formatActions(pre_action, action);

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
}
