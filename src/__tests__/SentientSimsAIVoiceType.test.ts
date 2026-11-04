import { describe, expect, it } from 'vitest';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { VoiceType, voiceTypeForTTS } from 'main/sentient-sims/models/VoiceType';
import {
  DEFAULT_SENTIENT_SIMS_AI_ELEVENLABS_VOICE,
  defaultSentientSimsAIElevenLabsSettings,
  isElevenLabsSpeechModel,
  SentientSimsAISpeechModel,
  speechModelName,
  toSpeechModel,
} from 'main/sentient-sims/models/SentientSimsAITTSSettings';

describe('Sentient Sims AI speech models', () => {
  it('casts ElevenLabs voices when Sentient Sims AI speaks through eleven_v4_turbo', () => {
    expect(voiceTypeForTTS(ApiType.SentientSimsAI, 'eleven_v4_turbo')).toBe(VoiceType.ElevenLabs);
    expect(voiceTypeForTTS(ApiType.SentientSimsAI, 'kokoro')).toBe(VoiceType.Kokoro);
    expect(voiceTypeForTTS(ApiType.SentientSimsAI, 'canopylabs/orpheus-3b-0.1-ft')).toBeUndefined();
  });

  it('knows the ElevenLabs model by id and name', () => {
    expect(isElevenLabsSpeechModel('eleven_v4_turbo')).toBe(true);
    expect(isElevenLabsSpeechModel('kokoro')).toBe(false);
    expect(isElevenLabsSpeechModel(undefined)).toBe(false);
    expect(toSpeechModel('eleven_v4_turbo')).toBe(SentientSimsAISpeechModel.ELEVEN_V4_TURBO);
    expect(speechModelName('eleven_v4_turbo')).toBe('ElevenLabs v4 Turbo');
    expect(speechModelName('kokoro')).toBe('Kokoro');
    expect(speechModelName('something-else')).toBe('something-else');
  });

  it('defaults a Tier 3 or 4 member to Rachel on ElevenLabs v4 Turbo', () => {
    expect(defaultSentientSimsAIElevenLabsSettings.model).toBe(SentientSimsAISpeechModel.ELEVEN_V4_TURBO);
    expect(defaultSentientSimsAIElevenLabsSettings.voice).toEqual([DEFAULT_SENTIENT_SIMS_AI_ELEVENLABS_VOICE]);
  });
});
