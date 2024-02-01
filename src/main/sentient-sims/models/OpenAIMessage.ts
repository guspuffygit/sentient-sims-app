import { ChatCompletionMessageRole } from './ChatCompletionMessageRole';

export type OpenAIMessage = {
  role: ChatCompletionMessageRole;
  content: string;
  tokens: number;
};
