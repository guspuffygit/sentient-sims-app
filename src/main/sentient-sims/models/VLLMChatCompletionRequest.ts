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

export type VLLMTokenizeRequest = {
  messages: Array<ChatCompletionMessageParam>;

  /**
   * ID of the model to use. See the
   * [model endpoint compatibility](https://platform.openai.com/docs/models/model-endpoint-compatibility)
   * table for details on which models work with the Chat API.
   */
  model: string;
};

export type VLLMRTokenizeResponse = {
  count: number;
  max_model_len: number;
  tokens: number[];
};
