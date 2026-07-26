import { ElevenLabsVoicesCache } from '../models/ElevenLabsVoice';
import { ApiClient } from './ApiClient';

async function toVoicesCache(response: Response): Promise<ElevenLabsVoicesCache> {
  const body = (await response.json()) as ElevenLabsVoicesCache & { error?: string };
  if (!response.ok || body.error) {
    throw new Error(body.error ?? `Unable to load ElevenLabs voices: ${response.status}`);
  }
  return body;
}

export class VoiceClient extends ApiClient {
  async phonemize(text: string, language: 'a' | 'b'): Promise<string> {
    const response = await fetch(
      `${this.apiUrl}/voice/phonemize?text=${encodeURIComponent(text)}&language=${encodeURIComponent(language)}`,
    );
    return response.text();
  }

  /**
   * GET /voice/elevenlabs/voices
   * The cached "My Voices" listing; empty until a refresh has succeeded.
   */
  async getElevenLabsVoices(): Promise<ElevenLabsVoicesCache> {
    return toVoicesCache(await fetch(`${this.apiUrl}/voice/elevenlabs/voices`));
  }

  /**
   * POST /voice/elevenlabs/voices/refresh
   * Re-reads the collection from the ElevenLabs API and replaces the cache.
   */
  async refreshElevenLabsVoices(): Promise<ElevenLabsVoicesCache> {
    return toVoicesCache(await fetch(`${this.apiUrl}/voice/elevenlabs/voices/refresh`, { method: 'POST' }));
  }
}
