import { defaultKokoroSpeed, SentientSimsAISpeechKokoroVoice } from './SentientSimsAITTSSettings';

export type KokoroAITTSSettings = {
  model: string;
  voice: SentientSimsAISpeechKokoroVoice[];
  response_format: 'wav';
  speed?: number;
};

export const defaultKokoroAITTSSettings: KokoroAITTSSettings = {
  model: 'kokoro',
  voice: [SentientSimsAISpeechKokoroVoice.Heart],
  response_format: 'wav',
  speed: defaultKokoroSpeed,
};
