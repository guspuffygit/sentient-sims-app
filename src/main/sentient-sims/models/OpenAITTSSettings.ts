export enum OpenAISpeechVoice {
  Alloy = 'alloy',
  Echo = 'echo',
  Fable = 'fable',
  Onyx = 'onyx',
  Nova = 'nova',
  Shimmer = 'shimmer',
}

export enum OpenAISpeechModel {
  TTS_1 = 'tts-1',
  TTS_1_HD = 'tts-1-hd',
}

export type OpenAITTSSettings = {
  model: (string & {}) | OpenAISpeechModel;
  voice: OpenAISpeechVoice;
  response_format: 'wav';
};

export const defaultOpenAITTSSettings: OpenAITTSSettings = {
  model: OpenAISpeechModel.TTS_1,
  voice: OpenAISpeechVoice.Alloy,
  response_format: 'wav',
};

export function toSpeechModel(model?: string): OpenAISpeechModel {
  if (Object.values(OpenAISpeechModel).includes(model as OpenAISpeechModel)) {
    return model as OpenAISpeechModel;
  }

  throw Error(`Unknown OpenAISpeechModel ${model}`);
}

export function toSpeechVoice(voice?: string): OpenAISpeechVoice {
  if (Object.values(OpenAISpeechVoice).includes(voice as OpenAISpeechVoice)) {
    return voice as OpenAISpeechVoice;
  }

  throw Error(`Unknown OpenAISpeechVoice ${voice}`);
}
