import { CustomLLMChatCompletionRole } from './CustomLLMChatCompletionRole';

export type CustomLLMChatCompletionMessage = {
  content: string | null;
  role: CustomLLMChatCompletionRole;
};
