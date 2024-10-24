export type ModelSettings = {
  temperature?: number;
  top_p?: number;
  top_k?: number;
};

export type ModelSettingsType = {
  [key: string]: ModelSettings;
};

export const AllModelSettings: ModelSettingsType = {
  default: {
    temperature: 0.8,
    top_p: 0.9,
    top_k: 40,
  },
  'Gryphe/MythoMax-L2-13b': {
    temperature: 0.8,
    top_p: 0.9,
    top_k: 40,
  },
  'ArliAI/Mistral-Nemo-12B-ArliAI-RPMax-v1.1': {
    temperature: 0.8,
    top_p: 0.9,
    top_k: 40,
  },
};
