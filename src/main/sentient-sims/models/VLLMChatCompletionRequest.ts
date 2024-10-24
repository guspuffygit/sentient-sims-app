import { CompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

export type VLLMChatCompletionRequest = CompletionCreateParamsNonStreaming & {
  chat_template?: string;
  chat_template_kwargs?: Map<String, any>;
  guided_choice?: string[];
  stop?: string[];
  continue_final_message?: boolean;
  top_k?: number;
  min_tokens?: number;
  repetition_penalty?: number;
};
