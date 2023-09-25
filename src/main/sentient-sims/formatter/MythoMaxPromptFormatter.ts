/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
import { SentientMemory } from '../models/SentientMemory';
import { PromptRequest } from '../models/PromptRequest';
import { llamaTokenizer } from '../llama/LLamaTokenizer';
import { defaultMythoMaxSystemPrompt } from '../constants';
import { filterNullAndUndefined } from '../util/filter';
import { removeLastParagraph, trimIncompleteSentence } from './PromptFormatter';

export class MythoMaxPromptFormatter {
  private readonly maxTokens = 3950;

  public readonly userToken = '### Instruction:';

  public readonly assistantToken = '### Response:';

  public readonly assistantActionResponseToken = '### Response:';

  encode(prompt: string): number[] {
    return llamaTokenizer.encode(prompt);
  }

  combineFormattedPrompt(
    systemPrompt: string,
    participants: string,
    location: string,
    memoriesToInsert: string[],
    actions?: string
  ): string {
    return filterNullAndUndefined([
      systemPrompt,
      participants,
      '',
      location,
      '',
      memoriesToInsert.join('\n'),
      '',
      actions,
    ])
      .join('\n')
      .trim();
  }

  formatMemory(memory: SentientMemory) {
    const memories: string[] = [];
    if (memory.observation) {
      memories.push(`${this.userToken}\n${memory.observation.trim()}`);
    }
    if (memory.content) {
      memories.push(`${this.assistantToken}\n${memory.content.trim()}`);
    }
    if (memory.pre_action) {
      memories.push(`${this.userToken}\n${memory.pre_action.trim()}`);
    }

    return memories;
  }

  formatOutput(text: string): string {
    let output = text.split(this.userToken, 1)[0].trim();
    output = output.split(this.assistantToken, 1)[0].trim();
    output = removeLastParagraph(output);
    output = trimIncompleteSentence(output);
    return output.trim();
  }

  formatActions(preAction?: string, preResponse?: string) {
    if (preAction && preResponse) {
      return [
        this.userToken,
        preAction.trim(),
        this.assistantActionResponseToken,
        preResponse,
      ].join('\n');
    }

    if (preAction) {
      return [
        this.userToken,
        preAction.trim(),
        this.assistantActionResponseToken,
      ].join('\n');
    }

    if (preResponse) {
      return [this.assistantActionResponseToken, preResponse].join('\n');
    }

    return `${this.assistantToken}\n`;
  }

  formatPrompt({
    memories,
    participants,
    location,
    pre_action,
    preResponse,
    systemPrompt = defaultMythoMaxSystemPrompt,
  }: PromptRequest) {
    const formattedActions = this.formatActions(pre_action, preResponse);
    const prePromptTokenCount = this.encode(
      this.combineFormattedPrompt(
        systemPrompt,
        participants,
        location,
        [],
        formattedActions
      )
    ).length;

    const memoriesToInsert: string[] = [];
    let memoryTokenCount = 0;
    if (memories) {
      for (let i = memories.length - 1; i >= 0; i--) {
        const memory = memories[i];
        const formattedMemories = this.formatMemory(memory);
        if (formattedMemories.length > 0) {
          memoryTokenCount += this.encode(formattedMemories.join('\n')).length;

          if (memoryTokenCount + prePromptTokenCount > this.maxTokens) {
            break;
          }

          formattedMemories.forEach((formattedMemory) => {
            memoriesToInsert.unshift(formattedMemory);
          });
        }
      }
    }

    let prompt = this.combineFormattedPrompt(
      systemPrompt,
      participants,
      location,
      memoriesToInsert,
      formattedActions
    );

    let tokenCount = this.encode(prompt).length;
    while (tokenCount > this.maxTokens) {
      memoriesToInsert.shift();
      prompt = this.combineFormattedPrompt(
        systemPrompt,
        participants,
        location,
        memoriesToInsert,
        formattedActions
      );
      tokenCount = this.encode(prompt).length;
    }

    const realMemoriesToInsert: string[] = [];
    let lastToken = '';
    memoriesToInsert.forEach((memory) => {
      if (memory.includes(this.userToken)) {
        if (lastToken === this.userToken) {
          realMemoriesToInsert.push(
            memory.replace(`${this.userToken}\n`, '').replace('\n', ' ')
          );
        } else {
          realMemoriesToInsert.push(
            memory
              .replace('\n', ' ')
              .replace(`${this.userToken} `, `${this.userToken}\n`)
          );
          lastToken = this.userToken;
        }
      } else if (memory.includes(this.assistantToken)) {
        if (lastToken === this.assistantToken) {
          realMemoriesToInsert.push(
            memory.replace(`${this.assistantToken}\n`, '').replace('\n', ' ')
          );
        } else {
          realMemoriesToInsert.push(
            memory
              .replace('\n', ' ')
              .replace(`${this.assistantToken} `, `${this.assistantToken}\n`)
          );
          lastToken = this.assistantToken;
        }
      }
    });

    prompt = this.combineFormattedPrompt(
      systemPrompt,
      participants,
      location,
      realMemoriesToInsert,
      formattedActions
    );

    return prompt;
  }

  formatActionPrompt(promptRequest: PromptRequest) {
    promptRequest.systemPrompt = defaultMythoMaxSystemPrompt;
    return this.formatPrompt(promptRequest);
  }
}
