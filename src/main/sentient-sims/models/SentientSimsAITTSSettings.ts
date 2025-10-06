export enum SentientSimsAISpeechKokoroVoice {
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

export enum SentientSimsAISpeechOrpheusVoice {
  Tara = 'tara',
  Leah = 'leah',
  Jess = 'jess',
  Leo = 'leo',
  Dan = 'dan',
  Mia = 'mia',
  Zac = 'zac',
}

export type SentientSimsAISpeechVoice = SentientSimsAISpeechKokoroVoice | SentientSimsAISpeechOrpheusVoice;

export enum SentientSimsAISpeechModel {
  KOKORO = 'kokoro',
  ORPHEUS = 'canopylabs/orpheus-3b-0.1-ft',
}

export type SentientSimsAITTSSettings = {
  model: (string & {}) | SentientSimsAISpeechModel;
  voice: SentientSimsAISpeechVoice[];
  response_format: 'wav';
  speed?: number;
};

export const defaultSentientSimsAITTSSettings: SentientSimsAITTSSettings = {
  model: SentientSimsAISpeechModel.KOKORO,
  voice: [SentientSimsAISpeechKokoroVoice.Heart],
  response_format: 'wav',
  speed: 1.0,
};

export function toSpeechModel(model?: string): SentientSimsAISpeechModel {
  if (Object.values(SentientSimsAISpeechModel).includes(model as SentientSimsAISpeechModel)) {
    return model as SentientSimsAISpeechModel;
  }

  throw Error(`Unknown SentientSimsAISpeechModel ${model}`);
}

export function toSpeechVoice(voice?: string): SentientSimsAISpeechVoice {
  if (Object.values(SentientSimsAISpeechKokoroVoice).includes(voice as SentientSimsAISpeechKokoroVoice)) {
    return voice as SentientSimsAISpeechKokoroVoice;
  }

  if (Object.values(SentientSimsAISpeechOrpheusVoice).includes(voice as SentientSimsAISpeechOrpheusVoice)) {
    return voice as SentientSimsAISpeechOrpheusVoice;
  }

  throw Error(`Unknown SentientSimsAISpeechVoice ${voice}`);
}
