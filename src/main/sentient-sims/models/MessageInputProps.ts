import { ChatCompletionMessage } from 'openai/resources/chat';
import { CustomLLMChatCompletionMessage } from './CustomLLMChatCompletionMessage';

export type MessageInputProps = {
  id?: string;
  timestamp?: number;
  message: ChatCompletionMessage | CustomLLMChatCompletionMessage;
};
