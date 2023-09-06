/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
import { encode as gpt3Encoder } from '@nem035/gpt-3-encoder';
import log from 'electron-log';
import { SentientMemory } from '../models/SentientMemory';
import { PromptRequest } from '../models/PromptRequest';
import { defaultOriginalSystemPrompt, defaultSystemPrompt } from '../constants';
import { removeLastParagraph, trimIncompleteSentence } from './PromptFormatter';
import { ChatCompletionMessageRole } from '../models/ChatCompletionMessageRole';

export type OpenAIMessage = {
  role: ChatCompletionMessageRole;
  content: string;
  tokens: number;
};

export class OpenAIPromptFormatter {
  public readonly maxTokens = 3950;

  encode(prompt: string): number[] {
    return gpt3Encoder(prompt);
  }

  formatActionSystemPrompt(
    participants: string,
    location: string,
    systemPrompt: string = defaultSystemPrompt
  ): OpenAIMessage {
    const prompt = [
      systemPrompt,
      '',
      'CHARACTERS:',
      participants,
      '',
      'LOCATION:',
      location,
      '',
      'ACTION:',
    ].join('\n');

    return {
      content: prompt,
      role: 'system',
      tokens: this.encode(prompt).length,
    };
  }

  formatMemory(memory: SentientMemory): OpenAIMessage[] {
    const messages: OpenAIMessage[] = [];
    if (memory.observation && memory.observation.trim()) {
      messages.push({
        content: memory.observation.trim(),
        tokens: this.encode(memory.observation.trim()).length,
        role: 'user',
      });
    }

    if (memory.content && memory.content.trim()) {
      messages.push({
        content: memory.content.trim(),
        tokens: this.encode(memory.content.trim()).length,
        role: 'assistant',
      });
    }

    if (memory.pre_action && memory.pre_action.trim()) {
      messages.push({
        content: memory.pre_action.trim(),
        tokens: this.encode(memory.pre_action.trim()).length,
        role: 'user',
      });
    }

    return messages;
  }

  formatStringMemory(memory: SentientMemory) {
    const entries = [
      memory.pre_action && memory.pre_action.trim(),
      memory.content && memory.content.trim(),
      memory.observation && memory.observation.trim(),
    ].filter(Boolean);

    if (entries.length > 0) {
      return entries.join('\n');
    }

    return undefined;
  }

  formatOutput(text: string): string {
    let output = removeLastParagraph(text);
    output = trimIncompleteSentence(output);
    return output.trim();
  }

  formatPreAction(preAction?: string): OpenAIMessage | undefined {
    if (preAction) {
      const content = preAction.trim();
      return {
        content,
        role: 'user',
        tokens: this.encode(content).length,
      };
    }

    return undefined;
  }

  formatActionPrompt({
    memories,
    participants,
    location,
    pre_action,
    systemPrompt,
  }: PromptRequest) {
    const actionMessage = this.formatPreAction(pre_action);

    log.debug(`actionMessage: ${actionMessage?.content}`);
    const systemMessage = this.formatActionSystemPrompt(
      participants,
      location,
      systemPrompt
    );

    const prePromptTokenCount =
      systemMessage.tokens + (actionMessage?.tokens || 0);

    const memoriesToInsert: OpenAIMessage[] = [];
    let memoryTokenCount = 0;
    // eslint-disable-next-line no-plusplus
    for (let i = memories.length - 1; i >= 0; i--) {
      const memory = memories[i];
      const formattedMemories = this.formatMemory(memory);
      memoryTokenCount += formattedMemories.reduce(
        (accumulator, currentValue) => accumulator + currentValue.tokens,
        0
      );

      if (memoryTokenCount + prePromptTokenCount > this.maxTokens) {
        break;
      }

      formattedMemories.forEach((formattedMemory) => {
        memoriesToInsert.unshift(formattedMemory);
      });
    }

    if (actionMessage) {
      return [systemMessage, ...memoriesToInsert, actionMessage];
    }

    return [systemMessage, ...memoriesToInsert];
  }

  combineFormattedContinuePrompt(
    participants: string,
    location: string,
    memoriesToInsert: string[],
    actions?: string
  ): string {
    return [participants, location, memoriesToInsert.join('\n'), actions].join(
      '\n'
    );
  }

  formatPrompt({
    memories,
    participants,
    location,
    systemPrompt = defaultOriginalSystemPrompt,
  }: PromptRequest): OpenAIMessage[] {
    const prePromptTokenCount = this.encode(
      systemPrompt +
        this.combineFormattedContinuePrompt(participants, location, [])
    ).length;

    const memoriesToInsert: string[] = [];
    let memoryTokenCount = 0;
    // eslint-disable-next-line no-plusplus
    for (let i = memories.length - 1; i >= 0; i--) {
      const memory = memories[i];
      const formattedMemory = this.formatStringMemory(memory);
      if (formattedMemory) {
        memoryTokenCount += this.encode(formattedMemory).length;
        if (memoryTokenCount + prePromptTokenCount > this.maxTokens) {
          break;
        }
        memoriesToInsert.unshift(formattedMemory);
      }
    }

    const prompt = this.combineFormattedContinuePrompt(
      participants,
      location,
      memoriesToInsert
    );

    return [
      {
        role: 'system',
        content: systemPrompt,
        tokens: this.encode(systemPrompt).length,
      },
      {
        role: 'user',
        content: prompt,
        tokens: this.encode(prompt).length,
      },
    ];
  }

  formatWantsPrompt(promptRequest: PromptRequest): OpenAIMessage[] {
    const messages = this.formatPrompt(promptRequest);
    messages.push({
      role: 'assistant',
      content: promptRequest.preResponse || '',
      tokens: this.encode(promptRequest.preResponse || '').length,
    });
    return messages;
  }
}
