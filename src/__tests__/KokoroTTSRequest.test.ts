import { describe, expect, it } from 'vitest';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { VoiceType, voiceTypeForTTS } from 'main/sentient-sims/models/VoiceType';
import {
  buildKokoroSpeechRequest,
  kokoroBaseUrl,
  kokoroSpeechUrl,
  kokoroVoicesUrl,
  splitSentences,
} from 'main/sentient-sims/clients/KokoroTTSRequest';
import {
  defaultKokoroSpeed,
  defaultSentientSimsAITTSSettings,
  isKokoroSpeechVoice,
  kokoroSpeechVoices,
  SentientSimsAISpeechKokoroVoice,
} from 'main/sentient-sims/models/SentientSimsAITTSSettings';
import { defaultKokoroAITTSSettings } from 'main/sentient-sims/models/KokoroAITTSSettings';
import { VOICES } from 'renderer/kokoro/voices';

describe('self-hosted Kokoro TTS request', () => {
  it('targets the OpenAI-compatible speech route whatever the endpoint looks like', () => {
    const expected = 'http://localhost:8880/v1/audio/speech';
    expect(kokoroSpeechUrl('http://localhost:8880')).toBe(expected);
    expect(kokoroSpeechUrl('http://localhost:8880/')).toBe(expected);
    expect(kokoroSpeechUrl('http://localhost:8880/v1')).toBe(expected);
    expect(kokoroSpeechUrl(' http://localhost:8880/v1/ ')).toBe(expected);
  });

  it('finds the server address and voice list from the same endpoint', () => {
    expect(kokoroBaseUrl(' http://localhost:8880/v1/ ')).toBe('http://localhost:8880');
    expect(kokoroVoicesUrl('http://localhost:8880/v1')).toBe('http://localhost:8880/v1/audio/voices');
  });

  it('sends a single voice, or a blend joined with +, as one whole clip', () => {
    const single = buildKokoroSpeechRequest({
      endpoint: 'http://localhost:8880',
      text: 'Hello there.',
      voice: ['af_heart'],
      model: 'kokoro',
      responseFormat: 'wav',
      speed: 1.25,
    });
    expect(single.url).toBe('http://localhost:8880/v1/audio/speech');
    expect(single.body).toEqual({
      model: 'kokoro',
      input: 'Hello there.',
      voice: 'af_heart',
      response_format: 'wav',
      speed: 1.25,
      stream: false,
    });

    const blend = buildKokoroSpeechRequest({
      endpoint: 'http://localhost:8880',
      text: 'Hi',
      voice: ['af_heart', 'af_sky'],
      model: 'kokoro',
      responseFormat: 'wav',
      speed: 1.25,
    });
    expect(blend.body.voice).toBe('af_heart+af_sky');
  });

  it('sends no credentials to the server', () => {
    const request = buildKokoroSpeechRequest({
      endpoint: 'http://localhost:8880',
      text: 'Hi',
      voice: ['af_heart'],
      model: 'kokoro',
      responseFormat: 'wav',
      speed: 1.25,
    });
    expect(Object.keys(request.headers)).toEqual(['Content-Type']);
  });

  it('casts Kokoro voices when the Kokoro provider is selected', () => {
    expect(voiceTypeForTTS(ApiType.Kokoro)).toBe(VoiceType.Kokoro);
  });
});

describe('Kokoro voices shared by the Sentient Sims AI and self-hosted panels', () => {
  it('offers every Kokoro voice except the one that returns no audio', () => {
    expect(kokoroSpeechVoices).not.toContain(SentientSimsAISpeechKokoroVoice.Isabella);
    expect(kokoroSpeechVoices).toHaveLength(Object.values(SentientSimsAISpeechKokoroVoice).length - 1);
    expect(isKokoroSpeechVoice('bf_isabella')).toBe(false);
    expect(isKokoroSpeechVoice('af_heart')).toBe(true);
    expect(isKokoroSpeechVoice('tara')).toBe(false);
  });

  it('has a display name for every offered voice', () => {
    expect(Object.keys(VOICES)).toEqual(expect.arrayContaining([...kokoroSpeechVoices]));
  });

  it('starts both providers at the same speed', () => {
    expect(defaultKokoroAITTSSettings.speed).toBe(defaultKokoroSpeed);
    expect(defaultSentientSimsAITTSSettings.speed).toBe(defaultKokoroSpeed);
  });
});

describe('splitSentences', () => {
  it('splits on sentence punctuation and keeps the punctuation', () => {
    expect(splitSentences('Hello there. How are you? Fine')).toEqual(['Hello there.', 'How are you?', 'Fine']);
  });

  it('keeps closing quotes with their sentence', () => {
    expect(splitSentences('He said "Hi." Then left.')).toEqual(['He said "Hi."', 'Then left.']);
  });

  it('keeps ellipses and runs of punctuation together', () => {
    expect(splitSentences('Wait... what?!')).toEqual(['Wait...', 'what?!']);
  });

  it('returns text without punctuation as one piece, and nothing for empty text', () => {
    expect(splitSentences('No punctuation here')).toEqual(['No punctuation here']);
    expect(splitSentences('')).toEqual([]);
    expect(splitSentences('   ')).toEqual([]);
  });
});
