/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
import { SentientMemory } from '../models/SentientMemory';
import { PromptRequest } from '../models/PromptRequest';
import { llamaTokenizer } from '../llama/LLamaTokenizer';
import { defaultSystemPrompt } from '../constants';
import { filterNullAndUndefined } from '../util/filter';
import { removeLastParagraph, trimIncompleteSentence } from './PromptFormatter';

export class MythoMaxPromptFormatter {
  private readonly maxTokens = 3950;

  public readonly userToken = '### Instruction:';

  public readonly assistantToken = '### Response:';

  encode(prompt: string): number[] {
    return llamaTokenizer.encode(prompt);
  }

  combineFormattedPrompt(
    systemPrompt: string,
    participants: string,
    location: string,
    memoriesToInsert: string[],
    actions?: string,
    preResponse?: string
  ): string {
    return filterNullAndUndefined([
      systemPrompt,
      'CHARACTERS:',
      participants,
      '',
      'LOCATION:',
      location,
      '',
      memoriesToInsert.join('\n'),
      '',
      actions,
      '',
      preResponse,
    ])
      .join('\n')
      .trim();
  }

  formatMemory(memory: SentientMemory) {
    const entries = [
      memory.pre_action && `${this.userToken}\n${memory.pre_action.trim()}`,
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
    output = trimIncompleteSentence(output);
    output = removeLastParagraph(output);
    return output.trim();
  }

  formatActions(preAction?: string) {
    if (preAction) {
      return `${this.userToken}\n${preAction.trim()}\n${this.assistantToken}`;
    }

    return undefined;
  }

  formatPreResponse(preResponse?: string) {
    if (preResponse) {
      return `${this.assistantToken}\n${preResponse.trim()}`;
    }

    return `${this.assistantToken}\n`;
  }

  formatPrompt({
    memories,
    participants,
    location,
    pre_action,
    preResponse,
    systemPrompt = defaultSystemPrompt,
  }: PromptRequest) {
    const formattedActions = this.formatActions(pre_action);
    const formattedPreResponse = this.formatPreResponse(preResponse);
    const prePromptTokenCount = this.encode(
      this.combineFormattedPrompt(
        systemPrompt,
        participants,
        location,
        [],
        formattedActions,
        formattedPreResponse
      )
    ).length;

    const memoriesToInsert: string[] = [];
    let memoryTokenCount = 0;
    // eslint-disable-next-line no-plusplus
    for (let i = memories.length - 1; i >= 0; i--) {
      const memory = memories[i];
      const formattedMemory = this.formatMemory(memory);
      if (formattedMemory) {
        memoryTokenCount += this.encode(formattedMemory).length;

        if (memoryTokenCount + prePromptTokenCount > this.maxTokens) {
          break;
        }

        memoriesToInsert.unshift(formattedMemory);
      }
    }

    let prompt = this.combineFormattedPrompt(
      systemPrompt,
      participants,
      location,
      memoriesToInsert,
      formattedActions,
      formattedPreResponse
    );

    let tokenCount = this.encode(prompt).length;
    while (tokenCount > this.maxTokens) {
      memoriesToInsert.shift();
      prompt = this.combineFormattedPrompt(
        systemPrompt,
        participants,
        location,
        memoriesToInsert,
        formattedActions,
        formattedPreResponse
      );
      tokenCount = this.encode(prompt).length;
    }

    return prompt;
  }

  formatActionPrompt(promptRequest: PromptRequest) {
    promptRequest.systemPrompt = defaultSystemPrompt;
    return this.formatPrompt(promptRequest);
  }
}
