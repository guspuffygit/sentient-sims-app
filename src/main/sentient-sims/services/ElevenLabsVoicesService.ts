import log from 'electron-log';
import { ElevenLabsVoicesCache, toElevenLabsVoices } from '../models/ElevenLabsVoice';
import { ApiContext } from './ApiContext';

export class ElevenLabsKeyNotSetError extends Error {
  constructor() {
    super('ElevenLabs API key is not set. Add it in Settings before loading your voices.');
    this.name = 'ElevenLabsKeyNotSetError';
  }
}

/**
 * Loads the user's ElevenLabs "My Voices" collection and caches it in app settings so
 * the per-sim voice picker has options without hitting the API on every render.
 */
export class ElevenLabsVoicesService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  getVoices(): ElevenLabsVoicesCache {
    return this.ctx.settings.elevenLabsVoices;
  }

  async refreshVoices(): Promise<ElevenLabsVoicesCache> {
    const apiKey = this.ctx.settings.elevenLabsKey;
    if (!apiKey) {
      throw new ElevenLabsKeyNotSetError();
    }

    const url = `${this.ctx.settings.elevenLabsEndpoint}/voices`;
    log.info(`Refreshing ElevenLabs voices from ${url}`);
    const response = await fetch(url, {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Unable to load ElevenLabs voices: ${response.status} ${body.slice(0, 500)}`);
    }

    const voices = toElevenLabsVoices(await response.json());
    log.info(`Loaded ${voices.length} ElevenLabs voices`);
    const cache: ElevenLabsVoicesCache = {
      voices,
      updatedAt: new Date().toISOString(),
    };
    this.ctx.settings.elevenLabsVoices = cache;
    return cache;
  }
}
