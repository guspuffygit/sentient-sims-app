export type ModelSettings = {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  repetition_penalty?: number;
  max_tokens: number;
  breakTokenString?: string;
  breakStringTokens?: number[];
  maxResponseTokens?: number;
  stop?: string[];
};

export type ModelSettingsType = {
  [key: string]: ModelSettings;
};

export const AllModelSettings: ModelSettingsType = {
  'default': {
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
    breakStringTokens: [0],
    stop: ['### Input:', '### Instruction:', '### Response:'],
  },
  'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8': {
    temperature: 0.6,
    top_p: 0.9,
    max_tokens: 16000,
    breakTokenString: '<|finetune_right_pad|>',
    breakStringTokens: [200018],
  },
  'meta-llama/Llama-4-Scout-17B-16E-Instruct': {
    temperature: 0.6,
    top_p: 0.9,
    max_tokens: 16000,
    breakTokenString: '<|finetune_right_pad|>',
    breakStringTokens: [200018],
  },
  'moonshotai/Kimi-K2-Instruct': {
    temperature: 0.6,
    max_tokens: 16000,
    breakTokenString: '[UNK]',
    breakStringTokens: [163838],
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
    max_tokens: 10000,
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
  'kayra-v1': {
    max_tokens: 8000,
    temperature: 1.35,
    top_k: 15,
    top_p: 0.85,
    repetition_penalty: 2.8,
  },
  'gpt-3.5-turbo': {
    temperature: 0.8,
    top_p: 0.9,
    top_k: 40,
    repetition_penalty: 1.15,
    max_tokens: 14000,
  },
  'TroyDoesAI/BlackSheep-24B': {
    temperature: 0.7,
    repetition_penalty: 1.05,
    max_tokens: 30000,
    breakTokenString: '<SPECIAL_54>',
    breakStringTokens: [54],
  },
  'zai-org/GLM-4.6-FP8': {
    temperature: 1.0,
    top_p: 0.95,
    top_k: 40,
    repetition_penalty: 1.05,
    max_tokens: 16000,
    breakTokenString: '[MASK]',
    breakStringTokens: [151330],
  },
  'zai-org/GLM-4.6': {
    temperature: 1.0,
    top_p: 0.95,
    top_k: 40,
    repetition_penalty: 1.05,
    max_tokens: 16000,
    breakTokenString: '[MASK]',
    breakStringTokens: [151330],
  },
  'gpt-4o-2024-08-06': {
    max_tokens: 32000,
  },
  'gpt-4o-2024-11-20': {
    max_tokens: 32000,
  },
  'gpt-4o-mini-2024-07-18': {
    max_tokens: 32000,
  },
  'gpt-4.1-2025-04-14': {
    max_tokens: 32000,
  },
  'gpt-4.1-mini-2025-04-14': {
    max_tokens: 32000,
  },
  'gpt-4.1-nano-2025-04-14': {
    max_tokens: 32000,
  },
};
