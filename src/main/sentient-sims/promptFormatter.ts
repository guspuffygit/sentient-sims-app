/* eslint-disable import/prefer-default-export,camelcase,no-useless-return */

import { encode } from '@nem035/gpt-3-encoder';
import { llamaTokenizer } from './llama/LLamaTokenizer';
import { PromptRequest } from './models/PromptRequest';
import { SentientMemory } from './models/SentientMemory';

export class PromptFormatter {
  private readonly customLLMEnabled: boolean;

  constructor(customLLMEnabled: boolean) {
    this.customLLMEnabled = customLLMEnabled;
  }

  formatMemory(memory: SentientMemory) {
    let entries;
    if (this.customLLMEnabled) {
      entries = [
        memory.action && `USER: ${memory.action.trim()}`,
        memory.content && `ASSISTANT: ${memory.content.trim()}`,
        memory.observation && `USER: ${memory.observation.trim()}`,
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
    const prompt = [
      participants,
      location,
      memoriesToInsert.join('\n'),
      actions,
    ].join('\n');

    if (this.customLLMEnabled) {
      return [
        "Write a story in the third person, describing scenes clearly, based on what's been said before, without predicting the future or giving a lesson, ending each part on a cliffhanger, and considering the user context.",
        `USER: ${prompt}`,
        `ASSISTANT:`,
      ].join('\n');
    }

    return prompt;
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
        actions = ['USER:', pre_action, action].join(' ');
      } else {
        actions = [pre_action, action].join(' ');
      }
    }

    const prePromptTokenCount = this.encode(
      this.combineFormattedPrompt(participants, location, [], actions)
    ).length;

    const memoriesToInsert: string[] = [];
    let memoryTokenCount = 0;
    memories.forEach((memory) => {
      if (memoryTokenCount + prePromptTokenCount > max_tokens) {
        return;
      }

      const formattedMemory = this.formatMemory(memory);
      if (formattedMemory) {
        memoriesToInsert.unshift(formattedMemory);
        const { length } = this.encode(formattedMemory);
        memoryTokenCount += length;
      }
    });

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
