import { ChatCompletionMessageRole } from './ChatCompletionMessageRole';

// A picture sent with a message (a lot screenshot), base64 without the data: prefix
export type MessageImage = {
  mimeType: string;
  data: string;
};

export type OpenAIMessage = {
  role: ChatCompletionMessageRole;
  content: string;
  tokens: number;
  // Only the OpenAI-compatible providers and Gemini send these
  images?: MessageImage[];
};

// The request as the AI log keeps it: a count in place of each message's image data
export function withoutImageData<T extends { messages: OpenAIMessage[] }>(request: T): T {
  if (!request.messages.some((message) => message.images?.length)) {
    return request;
  }
  return {
    ...request,
    messages: request.messages.map(({ images, ...message }) =>
      images?.length ? { ...message, content: `${message.content}\n[${images.length} image(s) attached]` } : message,
    ),
  };
}
