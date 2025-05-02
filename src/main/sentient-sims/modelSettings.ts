export type ModelSettings = {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  repetition_penalty?: number;
  max_tokens: number;
  breakTokenString?: string;
  maxResponseTokens?: number;
};

export type ModelSettingsType = {
  [key: string]: ModelSettings;
};

export const AllModelSettings: ModelSettingsType = {
  default: {
    temperature: 0.8,
    top_p: 0.9,
    top_k: 40,
    repetition_penalty: 1.15,
    max_tokens: 3900,
    breakTokenString: '<<BREAK>>',
  },
  'Gryphe/MythoMax-L2-13b': {
    temperature: 0.8,
    top_p: 0.9,
    top_k: 40,
    repetition_penalty: 1.15,
    max_tokens: 3900,
    breakTokenString: '<unk>',
  },
  'ArliAI/Mistral-Nemo-12B-ArliAI-RPMax-v1.1': {
    temperature: 0.8,
    top_p: 0.9,
    top_k: 40,
    repetition_penalty: 1.15,
    max_tokens: 7500,
  },
  'ArliAI/Mistral-Nemo-12B-ArliAI-RPMax-v1.2': {
    temperature: 0.8,
    top_p: 0.9,
    top_k: 40,
    repetition_penalty: 1.15,
    max_tokens: 7500,
  },
  'Mistral-Nemo-12B-ArliAI-RPMax-v1.3': {
    temperature: 0.5,
    top_p: 0.95,
    top_k: 40,
    repetition_penalty: 0.5,
    max_tokens: 16000,
  },
  'Qwen2.5-32B-Gutenberg-Doppel': {
    temperature: 0.85,
    top_p: 0.8,
    top_k: 40,
    repetition_penalty: 1.03,
    max_tokens: 24000,
  },
  'ArliAI/Mistral-Nemo-12B-ArliAI-RPMax-v1.3': {
    temperature: 0.5,
    top_p: 0.95,
    top_k: 40,
    repetition_penalty: 0.5,
    max_tokens: 16000,
  },

  'Llama-3.3-70B-ArliAI-RPMax-v1.4': {
    temperature: 0.8,
    top_p: 0.95,
    top_k: 40,
    repetition_penalty: 1.1,
    max_tokens: 24000,
  },
  'ArliAI/Llama-3.3-70B-ArliAI-RPMax-v1.4': {
    temperature: 0.8,
    top_p: 0.95,
    top_k: 40,
    repetition_penalty: 1.1,
    max_tokens: 24000,
  },
  'Llama-3.3-70B-Legion-V2.1': {
    temperature: 0.8,
    top_p: 0.95,
    top_k: 40,
    repetition_penalty: 1.1,
    max_tokens: 24000,
  },
  'Qwen/Qwen3-235B-A22B': {
    temperature: 0.6,
    top_p: 0.95,
    top_k: 20,
    repetition_penalty: 1.15,
    max_tokens: 7500,
  },
  'Qwen/Qwen3-30B-A3B': {
    temperature: 0.6,
    top_p: 0.95,
    top_k: 20,
    repetition_penalty: 1.15,
    max_tokens: 16000,
  },
  'gpt-4o-mini': {
    temperature: 0.8,
    top_p: 0.9,
    top_k: 40,
    repetition_penalty: 1.15,
    max_tokens: 32000,
  },
  'gpt-3.5-turbo': {
    temperature: 0.8,
    top_p: 0.9,
    top_k: 40,
    repetition_penalty: 1.15,
    max_tokens: 14000,
  },
};
