import log from 'electron-log';
import { GoogleGenAI } from '@google/genai';
import { ApiType } from '../models/ApiType';
import { getRandomItem } from '../util/getRandomItem';
import { ApiContext } from './ApiContext';
import { EmbeddingService } from './EmbeddingService';

// The Gemini batch embedding endpoint rejects requests with more than 100 texts,
// so larger caller batches (backfill uses up to 500) are chunked here.
const geminiEmbedBatchLimit = 100;

// Embeds through the Gemini API using the same comma-separated key pool as generation,
// picking a random key per request to spread quota.
export class GeminiEmbeddingService implements EmbeddingService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  get model(): string {
    return this.ctx.embeddingProviderConfigs.modelFor(ApiType.Gemini);
  }

  private getKeys(): string[] {
    return (this.ctx.settings.geminiKeys || '')
      .split(',')
      .map((key) => key.trim())
      .filter((key) => key.length > 0);
  }

  isAvailable(): boolean {
    return this.getKeys().length > 0;
  }

  async embed(texts: string[]): Promise<(Float32Array | undefined)[]> {
    if (texts.length === 0 || !this.isAvailable()) {
      return texts.map(() => undefined);
    }

    const client = new GoogleGenAI({ apiKey: getRandomItem(this.getKeys()) });
    const results: (Float32Array | undefined)[] = [];
    for (let start = 0; start < texts.length; start += geminiEmbedBatchLimit) {
      const batch = texts.slice(start, start + geminiEmbedBatchLimit);
      try {
        const response = await client.models.embedContent({
          model: this.model,
          contents: batch,
        });
        // Embeddings come back in input order
        const embeddings = response.embeddings ?? [];
        batch.forEach((_, index) => {
          const { values } = embeddings[index] ?? {};
          results.push(values && values.length > 0 ? Float32Array.from(values) : undefined);
        });
      } catch (error) {
        log.error('Gemini embedding request failed', error);
        // Keep earlier batches' results; the rest resolve to undefined so callers retry later
        while (results.length < texts.length) {
          results.push(undefined);
        }
        break;
      }
    }
    return results;
  }
}
