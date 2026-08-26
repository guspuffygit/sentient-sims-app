import { ApiType } from './ApiType';
import { SentientSimsAISpeechModel } from './SentientSimsAITTSSettings';

// A family of interchangeable voices that a sim can be pinned to. Pins are stored
// per voice type so switching TTS providers back and forth never loses a sim's
// assigned voice for either provider.
export enum VoiceType {
  ElevenLabs = 'elevenlabs',
  Kokoro = 'kokoro',
}

export function toVoiceType(value?: string): VoiceType | undefined {
  if (Object.values(VoiceType).includes(value as VoiceType)) {
    return value as VoiceType;
  }
  return undefined;
}

/**
 * The voice type the active TTS setup speaks with, or undefined for setups without
 * per-sim voices (e.g. the Orpheus model, which has no blendable voice pool).
 * Sentient Sims AI running the kokoro model and a local Kokoro instance share the
 * same voice names, so they share one pool of pinned voices.
 */
export function voiceTypeForTTS(ttsApiType: ApiType, sentientSimsAISpeechModel?: string): VoiceType | undefined {
  switch (ttsApiType) {
    case ApiType.ElevenLabs:
      return VoiceType.ElevenLabs;
    case ApiType.Kokoro:
      return VoiceType.Kokoro;
    case ApiType.SentientSimsAI:
      return sentientSimsAISpeechModel === SentientSimsAISpeechModel.KOKORO.toString() ? VoiceType.Kokoro : undefined;
    default:
      return undefined;
  }
}
