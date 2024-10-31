export type ModelSettings = {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  repetition_penalty?: number;
  max_tokens: number;
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
  },
  'Gryphe/MythoMax-L2-13b': {
    temperature: 0.8,
    top_p: 0.9,
    top_k: 40,
    repetition_penalty: 1.15,
    max_tokens: 3900,
  },
  'ArliAI/Mistral-Nemo-12B-ArliAI-RPMax-v1.1': {
    temperature: 0.8,
    top_p: 0.9,
    top_k: 40,
    repetition_penalty: 1.15,
    max_tokens: 7500,
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
