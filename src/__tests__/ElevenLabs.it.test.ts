import log from 'electron-log';
import { buildElevenLabsSpeechRequest, elevenLabsLineText } from 'main/sentient-sims/clients/ElevenLabsTTSRequest';
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

async function speak(text: string, voiceId: string, model: string): Promise<Blob> {
  const { url, headers, body } = buildElevenLabsSpeechRequest({
    text,
    voiceId,
    endpoint: defaultElevenLabsEndpoint,
    apiKey: apiKey as string,
    settings: { ...defaultElevenLabsTTSSettings, model },
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
