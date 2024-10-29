import {
  ChatCompletionMessageParam,
  CompletionCreateParamsNonStreaming,
} from 'openai/resources/chat/completions';

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

export type VLLMTokenizeTextRequest = {
  model: string;
  prompt: string;

  add_special_tokens?: boolean;
};

export type VLLMTokenizeChatRequest = {
  model: string;
  messages: ChatCompletionMessageParam[];

  add_generation_prompt?: boolean;
  continue_final_message?: boolean;
  add_special_tokens?: boolean;
};

export type VLLMRTokenizeResponse = {
  count: number;
  max_model_len: number;
  tokens: number[];
};
