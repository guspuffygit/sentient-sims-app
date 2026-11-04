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

// An ElevenLabs voice is a catalog voice id (formatter/ElevenLabsVoiceCasting), not an enum member
export type SentientSimsAISpeechVoice =
  | SentientSimsAISpeechKokoroVoice
  | SentientSimsAISpeechOrpheusVoice
  | (string & {});

export enum SentientSimsAISpeechModel {
  KOKORO = 'kokoro',
  ORPHEUS = 'canopylabs/orpheus-3b-0.1-ft',
  ELEVEN_V4_TURBO = 'eleven_v4_turbo',
}

// Rachel, the first premade ElevenLabs voice
export const DEFAULT_SENTIENT_SIMS_AI_ELEVENLABS_VOICE = '21m00Tcm4TlvDq8ikWAM';

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
  // Dialogue reads sluggish at 1.0
  speed: 1.25,
};

// What a Tier 3 or Tier 4 member gets when the wizard picks their voices
export const defaultSentientSimsAIElevenLabsSettings: SentientSimsAITTSSettings = {
  model: SentientSimsAISpeechModel.ELEVEN_V4_TURBO,
  voice: [DEFAULT_SENTIENT_SIMS_AI_ELEVENLABS_VOICE],
  response_format: 'wav',
};

export function isElevenLabsSpeechModel(model?: string): boolean {
  return model === (SentientSimsAISpeechModel.ELEVEN_V4_TURBO as string);
}

const SPEECH_MODEL_NAMES: Readonly<Record<string, string>> = {
  [SentientSimsAISpeechModel.KOKORO]: 'Kokoro',
  [SentientSimsAISpeechModel.ORPHEUS]: 'Orpheus',
  [SentientSimsAISpeechModel.ELEVEN_V4_TURBO]: 'ElevenLabs v4 Turbo',
};

export function speechModelName(model: string): string {
  return model in SPEECH_MODEL_NAMES ? SPEECH_MODEL_NAMES[model] : model;
}

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
