import {
  buildElevenLabsSpeechRequest,
  elevenLabsLineText,
  isElevenLabsV3,
} from 'main/sentient-sims/clients/ElevenLabsTTSRequest';
import {
  defaultElevenLabsTTSSettings,
  defaultElevenLabsVoiceSettings,
  ElevenLabsOutputFormat,
  ElevenLabsSpeechModel,
  ElevenLabsTTSSettings,
  toSpeechModel,
} from 'main/sentient-sims/models/ElevenLabsTTSSettings';
import { buildElevenLabsVoiceRequest, toElevenLabsVoiceInfo } from 'main/sentient-sims/clients/ElevenLabsVoiceRequest';
import { elevenLabsErrorMessage } from 'main/sentient-sims/clients/ElevenLabsError';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { defaultElevenLabsEndpoint } from 'main/sentient-sims/constants';

const rachelVoiceId = '21m00Tcm4TlvDq8ikWAM';

function settings(overrides?: Partial<ElevenLabsTTSSettings>): ElevenLabsTTSSettings {
  return { ...defaultElevenLabsTTSSettings, ...overrides };
}

function buildRequest(text: string, voiceId: string, ttsSettings: ElevenLabsTTSSettings) {
  return buildElevenLabsSpeechRequest({
    text,
    voiceId,
    endpoint: defaultElevenLabsEndpoint,
    apiKey: 'test-key',
    settings: ttsSettings,
  });
}

describe('ElevenLabs speech model', () => {
  it('accepts eleven_v3', () => {
    expect(toSpeechModel('eleven_v3')).toEqual(ElevenLabsSpeechModel.ELEVEN_V3);
    expect(isElevenLabsV3(ElevenLabsSpeechModel.ELEVEN_V3)).toBe(true);
    expect(isElevenLabsV3(ElevenLabsSpeechModel.ELEVEN_FLASH_V2_5)).toBe(false);
  });

  it('rejects an unknown model', () => {
    expect(() => toSpeechModel('eleven_not_a_model')).toThrow();
  });

  it('defaults to a speed the API accepts', () => {
    expect(defaultElevenLabsVoiceSettings.speed).toBeGreaterThanOrEqual(0.7);
    expect(defaultElevenLabsVoiceSettings.speed).toBeLessThanOrEqual(1.2);
  });
});

describe('buildElevenLabsSpeechRequest', () => {
  it('targets the voice on the text-to-speech endpoint', () => {
    const request = buildRequest('Hello there.', rachelVoiceId, settings());
    expect(request.url).toEqual(`${defaultElevenLabsEndpoint}/text-to-speech/${rachelVoiceId}`);
    expect(request.headers['xi-api-key']).toEqual('test-key');
    expect(request.headers['Content-Type']).toEqual('application/json');
  });

  it('sends model_id so the configured model is not ignored', () => {
    const request = buildRequest('Hello there.', rachelVoiceId, settings({ model: ElevenLabsSpeechModel.ELEVEN_V3 }));
    expect(request.body.model_id).toEqual('eleven_v3');
  });

  it('sends a custom voice model id verbatim', () => {
    const request = buildRequest('Hello there.', rachelVoiceId, settings({ model: 'eleven_turbo_v2_5' }));
    expect(request.body.model_id).toEqual('eleven_turbo_v2_5');
  });

  it('uses the configured speed', () => {
    const request = buildRequest(
      'Hello there.',
      rachelVoiceId,
      settings({
        voice_settings: { ...defaultElevenLabsVoiceSettings, speed: 0.9 },
      }),
    );
    expect(request.body.voice_settings.speed).toEqual(0.9);
  });

  it('falls back to the default speed for settings saved before the field existed', () => {
    const legacySettings: ElevenLabsTTSSettings = {
      model: ElevenLabsSpeechModel.ELEVEN_FLASH_V2_5,
      voice: rachelVoiceId,
      output_format: ElevenLabsOutputFormat.mp3_44100_128,
    };
    const request = buildRequest('Hello there.', rachelVoiceId, legacySettings);
    expect(request.body.voice_settings.speed).toEqual(defaultElevenLabsVoiceSettings.speed);
  });

  it('sends the text unchanged', () => {
    const request = buildRequest('Been fishing here for years.', rachelVoiceId, settings());
    expect(request.body.text).toEqual('Been fishing here for years.');
  });
});

describe('buildElevenLabsVoiceRequest', () => {
  it('looks the voice up on the voices endpoint', () => {
    const request = buildElevenLabsVoiceRequest({
      voiceId: rachelVoiceId,
      endpoint: defaultElevenLabsEndpoint,
      apiKey: 'test-key',
    });
    expect(request.url).toEqual(`${defaultElevenLabsEndpoint}/voices/${rachelVoiceId}`);
    expect(request.headers['xi-api-key']).toEqual('test-key');
  });

  it('escapes a voice id that would otherwise change the path', () => {
    const request = buildElevenLabsVoiceRequest({
      voiceId: '../user/subscription',
      endpoint: defaultElevenLabsEndpoint,
      apiKey: 'test-key',
    });
    expect(request.url).toEqual(`${defaultElevenLabsEndpoint}/voices/..%2Fuser%2Fsubscription`);
  });
});

describe('toElevenLabsVoiceInfo', () => {
  it('reads the name, description, category and labels', () => {
    const voice = toElevenLabsVoiceInfo(rachelVoiceId, {
      voice_id: rachelVoiceId,
      name: 'Rachel',
      description: 'A calm narration voice.',
      category: 'premade',
      preview_url: 'https://example.com/preview.mp3',
      labels: { accent: 'american', age: 'young', gender: 'female', use_case: 'narration' },
    });

    expect(voice.name).toEqual('Rachel');
    expect(voice.description).toEqual('A calm narration voice.');
    expect(voice.category).toEqual('premade');
    expect(voice.previewUrl).toEqual('https://example.com/preview.mp3');
    expect(voice.labels).toEqual([
      { name: 'Accent', value: 'american' },
      { name: 'Age', value: 'young' },
      { name: 'Gender', value: 'female' },
      { name: 'Use case', value: 'narration' },
    ]);
  });

  it('keeps the requested id when a retired voice redirects to a replacement', () => {
    const voice = toElevenLabsVoiceInfo(rachelVoiceId, {
      voice_id: 'eLDc7xhWxG2FElT3kUTj',
      name: 'Janet',
      category: 'professional',
      labels: { accent: 'en-american' },
    });

    expect(voice.voiceId).toEqual(rachelVoiceId);
    expect(voice.redirectedTo).toEqual('eLDc7xhWxG2FElT3kUTj');
    expect(voice.name).toEqual('Janet');
  });

  it('reports no redirect when the requested voice answers for itself', () => {
    const voice = toElevenLabsVoiceInfo(rachelVoiceId, { voice_id: rachelVoiceId, name: 'Rachel' });

    expect(voice.redirectedTo).toBeUndefined();
  });

  it('takes the photo from the sharing block', () => {
    const voice = toElevenLabsVoiceInfo(rachelVoiceId, {
      name: 'Rachel',
      sharing: { image_url: 'https://example.com/rachel.jpg' },
    });

    expect(voice.imageUrl).toEqual('https://example.com/rachel.jpg');
  });

  it('falls back to shared details for a voice copied from the library', () => {
    const voice = toElevenLabsVoiceInfo(rachelVoiceId, {
      voice_id: rachelVoiceId,
      name: null,
      description: null,
      labels: {},
      sharing: {
        name: 'Ricky',
        description: 'A gravelly fisherman.',
        labels: { accent: 'southern' },
      },
    });

    expect(voice.name).toEqual('Ricky');
    expect(voice.description).toEqual('A gravelly fisherman.');
    expect(voice.labels).toEqual([{ name: 'Accent', value: 'southern' }]);
  });

  it('drops empty labels instead of rendering blank chips', () => {
    const voice = toElevenLabsVoiceInfo(rachelVoiceId, {
      name: 'Rachel',
      labels: { accent: 'american', age: '', gender: null },
    });

    expect(voice.labels).toEqual([{ name: 'Accent', value: 'american' }]);
  });

  it('falls back to the voice id when the response has no name at all', () => {
    const voice = toElevenLabsVoiceInfo(rachelVoiceId, {});

    expect(voice.voiceId).toEqual(rachelVoiceId);
    expect(voice.name).toEqual(rachelVoiceId);
    expect(voice.labels).toEqual([]);
    expect(voice.imageUrl).toBeUndefined();
  });
});

describe('elevenLabsErrorMessage', () => {
  it('unwraps the message instead of showing the raw JSON envelope', () => {
    const body = JSON.stringify({
      detail: {
        type: 'authentication_error',
        code: 'unauthorized',
        message: 'Invalid API key',
        status: 'invalid_api_key',
        request_id: '4de962550b3acb8c31066745d73cf13a',
      },
    });

    expect(elevenLabsErrorMessage(401, body)).toEqual('Invalid API key');
  });

  it('handles a plain string detail', () => {
    expect(elevenLabsErrorMessage(422, JSON.stringify({ detail: 'voice_id is required' }))).toEqual(
      'voice_id is required',
    );
  });

  it('explains an unauthorized response with no usable body', () => {
    expect(elevenLabsErrorMessage(401, '')).toEqual('Invalid ElevenLabs key');
    expect(elevenLabsErrorMessage(401, JSON.stringify({ detail: {} }))).toEqual('Invalid ElevenLabs key');
  });

  it('falls back to the status when the body is not ElevenLabs JSON', () => {
    expect(elevenLabsErrorMessage(500, '')).toEqual('ElevenLabs returned 500');
    expect(elevenLabsErrorMessage(502, '<html>Bad Gateway</html>')).toEqual('<html>Bad Gateway</html>');
  });
});

describe('elevenLabsLineText', () => {
  const line: DialogueLine = { speaker: 'Ricky', text: 'Been fishing here for years.', deliveryNote: 'nervous' };

  it('turns a delivery note into a v3 audio tag', () => {
    expect(elevenLabsLineText(line, ElevenLabsSpeechModel.ELEVEN_V3)).toEqual('[nervous] Been fishing here for years.');
  });

  it('never speaks the delivery note on models without audio tags', () => {
    expect(elevenLabsLineText(line, ElevenLabsSpeechModel.ELEVEN_FLASH_V2_5)).toEqual('Been fishing here for years.');
    expect(elevenLabsLineText(line, ElevenLabsSpeechModel.ELEVEN_MULTILINGUAL_V2)).toEqual(
      'Been fishing here for years.',
    );
  });

  it('leaves a line without a delivery note alone on v3', () => {
    const plain: DialogueLine = { speaker: 'Ricky', text: 'Been fishing here for years.' };
    expect(elevenLabsLineText(plain, ElevenLabsSpeechModel.ELEVEN_V3)).toEqual('Been fishing here for years.');
  });
});
