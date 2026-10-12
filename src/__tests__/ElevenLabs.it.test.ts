import log from 'electron-log';
import {
  buildElevenLabsDialogueRequest,
  buildElevenLabsSpeechRequest,
  elevenLabsLineText,
} from 'main/sentient-sims/clients/ElevenLabsTTSRequest';
import { defaultElevenLabsTTSSettings, ElevenLabsSpeechModel } from 'main/sentient-sims/models/ElevenLabsTTSSettings';
import { castElevenLabsVoice, elevenLabsVoiceCatalog } from 'main/sentient-sims/formatter/ElevenLabsVoiceCasting';
import {
  buildElevenLabsVoiceRequest,
  ElevenLabsVoiceResponse,
  toElevenLabsVoiceInfo,
} from 'main/sentient-sims/clients/ElevenLabsVoiceRequest';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { defaultElevenLabsEndpoint } from 'main/sentient-sims/constants';

const apiKey = process.env.ELEVENLABS_KEY;

if (!apiKey) {
  log.warn('ELEVENLABS_KEY is not set, skipping ElevenLabs integration tests');
}

async function speak(
  text: string,
  voiceId: string,
  model: string,
  context?: { previousText?: string; nextText?: string },
): Promise<Blob> {
  const { url, headers, body } = buildElevenLabsSpeechRequest({
    text,
    voiceId,
    endpoint: defaultElevenLabsEndpoint,
    apiKey: apiKey as string,
    settings: { ...defaultElevenLabsTTSSettings, model },
    ...context,
  });

  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!response.ok) {
    throw new Error(`ElevenLabs returned ${response.status}: ${await response.text()}`);
  }

  return response.blob();
}

async function speakDialogue(text: string, voiceId: string, model: string, previousText?: string): Promise<Blob> {
  const { url, headers, body } = buildElevenLabsDialogueRequest({
    text,
    voiceId,
    endpoint: defaultElevenLabsEndpoint,
    apiKey: apiKey as string,
    settings: { ...defaultElevenLabsTTSSettings, model },
    previousText,
  });

  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!response.ok) {
    throw new Error(`ElevenLabs returned ${response.status}: ${await response.text()}`);
  }

  return response.blob();
}

describe('ElevenLabsIT', () => {
  it.skipIf(!apiKey)('generates audio for a dialogue line', async () => {
    const audio = await speak(
      'Been fishing here for years.',
      defaultElevenLabsTTSSettings.voice,
      defaultElevenLabsTTSSettings.model,
    );

    expect(audio.size).toBeGreaterThan(0);
    expect(audio.type).toContain('audio');
  });

  it.skipIf(!apiKey)('generates audio for a v3 line with an audio tag', async () => {
    const text = elevenLabsLineText(
      { speaker: 'Ricky', text: 'Been fishing here for years.', deliveryNote: 'nervous' },
      ElevenLabsSpeechModel.ELEVEN_V3,
    );
    expect(text).toEqual('[nervous] Been fishing here for years.');

    const audio = await speak(text, defaultElevenLabsTTSSettings.voice, ElevenLabsSpeechModel.ELEVEN_V3);
    expect(audio.size).toBeGreaterThan(0);
  });

  // v4 has no speed setting; this proves the API takes the v4 voice_settings shape on text-to-speech
  it.skipIf(!apiKey)('generates audio for eleven_v4 on text-to-speech without speed', async () => {
    const audio = await speak(
      'Been fishing here for years.',
      defaultElevenLabsTTSSettings.voice,
      ElevenLabsSpeechModel.ELEVEN_V4,
    );
    expect(audio.size).toBeGreaterThan(0);
    expect(audio.type).toContain('audio');
  });

  // v3 returns 400 "unsupported_model" if previous_text/next_text reach it; the builder must drop them
  it.skipIf(!apiKey)('generates audio for eleven_v3 with neighbouring lines given', async () => {
    const audio = await speak('Been fishing here for years.', defaultElevenLabsTTSSettings.voice, 'eleven_v3', {
      previousText: 'How long have you been coming here?',
      nextText: 'Caught anything?',
    });
    expect(audio.size).toBeGreaterThan(0);
    expect(audio.type).toContain('audio');
  });

  // The dialogue endpoint has its own body shape (inputs[], settings.similarity, future_text)
  it.skipIf(!apiKey)('generates audio for a v4 dialogue line with an audio tag and context', async () => {
    const text = elevenLabsLineText(
      { speaker: 'Ricky', text: 'Been fishing here for years.', deliveryNote: 'nervous' },
      ElevenLabsSpeechModel.ELEVEN_V4,
    );
    expect(text).toEqual('[nervous] Been fishing here for years.');

    const audio = await speakDialogue(
      text,
      defaultElevenLabsTTSSettings.voice,
      ElevenLabsSpeechModel.ELEVEN_V4,
      'How long have you been coming here?',
    );
    expect(audio.size).toBeGreaterThan(0);
    expect(audio.type).toContain('audio');
  });

  it.skipIf(!apiKey)('generates audio with the voice cast for a sim', async () => {
    const sim: SentientSim = {
      careers: [],
      name: 'Ricky Rickerson',
      age: SimAge.ADULT,
      sim_id: '1',
      gender: 'Male',
      traits: ['trait_Evil'],
      moods: [],
      is_ghost: false,
      grubby: false,
      in_pool: false,
      is_at_home: false,
      is_dying: false,
      is_human: true,
      is_inside_building: false,
      is_outside: false,
      is_pet: false,
      on_fire: false,
      on_home_lot: false,
      sleeping: false,
      is_pregnant: false,
      is_player_sim: true,
    };

    const audio = await speak(
      'Been fishing here for years.',
      castElevenLabsVoice(sim),
      ElevenLabsSpeechModel.ELEVEN_V3,
    );
    expect(audio.size).toBeGreaterThan(0);
  });

  it.skipIf(!apiKey)('looks up the details shown after a voice test', async () => {
    const { url, headers } = buildElevenLabsVoiceRequest({
      voiceId: defaultElevenLabsTTSSettings.voice,
      endpoint: defaultElevenLabsEndpoint,
      apiKey: apiKey as string,
    });

    const response = await fetch(url, { headers });
    expect(response.ok).toBe(true);

    const voice = toElevenLabsVoiceInfo(
      defaultElevenLabsTTSSettings.voice,
      (await response.json()) as ElevenLabsVoiceResponse,
    );

    expect(voice.voiceId).toEqual(defaultElevenLabsTTSSettings.voice);
    expect(voice.name).not.toEqual(defaultElevenLabsTTSSettings.voice);
    expect(voice.labels.length).toBeGreaterThan(0);
  });

  // The catalog hardcodes voice ids; this catches ElevenLabs dropping one entirely.
  // Membership in GET /voices is the wrong check — that only lists the account's own voices.
  it.skipIf(!apiKey)(
    'every cast voice id still resolves',
    async () => {
      const unresolved: string[] = [];

      for (const voice of elevenLabsVoiceCatalog) {
        const { url, headers } = buildElevenLabsVoiceRequest({
          voiceId: voice.voiceId,
          endpoint: defaultElevenLabsEndpoint,
          apiKey: apiKey as string,
        });

        const response = await fetch(url, { headers });
        if (!response.ok) {
          unresolved.push(`${voice.name} (${voice.voiceId}): ${response.status}`);
        }
      }

      expect(unresolved).toEqual([]);
    },
    60000,
  );
});
