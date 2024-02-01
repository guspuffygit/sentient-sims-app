import { OpenAIMessage } from './OpenAIMessage';

export type MessageInputProps = {
  id?: string;
  timestamp?: number;
  message: OpenAIMessage;
};
