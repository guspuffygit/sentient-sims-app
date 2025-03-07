export enum KokoroAISpeechVoice {
  Heart = 'af_heart',
  Alloy = 'af_alloy',
  Aoede = 'af_aoede',
  Bella = 'af_bella',
  Jessica = 'af_jessica',
  Kore = 'af_kore',
  Nicole = 'af_nicole',
  Nova = 'af_nova',
  River = 'af_river',
  Sky = 'af_sky',
  Adam = 'am_adam',
  Echo = 'am_echo',
  Eric = 'am_eric',
  Fenrir = 'am_fenrir',
  Liam = 'am_liam',
  Michael = 'am_michael',
  Onyx = 'am_onyx',
  Puck = 'am_puck',
  Santa = 'am_santa',
  Emma = 'bf_emma',
  Isabella = 'bf_isabella',
  George = 'bm_george',
  Lewis = 'bm_lewis',
  Alice = 'bf_alice',
  Lily = 'bf_lily',
  Daniel = 'bm_daniel',
  Fable = 'bm_fable',
}

export enum KokoroAISpeechModel {
  KOKORO = 'kokoro',
}

export type KokoroAITTSSettings = {
  model: (string & {}) | KokoroAISpeechModel;
  voice: KokoroAISpeechVoice;
  response_format: 'wav';
};

export const defaultKokoroAITTSSettings: KokoroAITTSSettings = {
  model: KokoroAISpeechModel.KOKORO,
  voice: KokoroAISpeechVoice.Alloy,
  response_format: 'wav',
};

export function toSpeechModel(model?: string): KokoroAISpeechModel {
  if (
    Object.values(KokoroAISpeechModel).includes(model as KokoroAISpeechModel)
  ) {
    return model as KokoroAISpeechModel;
  }

  throw Error(`Unknown KokoroAISpeechModel ${model}`);
}

export function toSpeechVoice(voice?: string): KokoroAISpeechVoice {
  if (
    Object.values(KokoroAISpeechVoice).includes(voice as KokoroAISpeechVoice)
  ) {
    return voice as KokoroAISpeechVoice;
  }

  throw Error(`Unknown KokoroSpeechVoice ${voice}`);
}
