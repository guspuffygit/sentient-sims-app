import axios from 'axios';
import log from 'electron-log';
import { axiosClient } from '../clients/AxiosClient';
import { ApiType } from '../models/ApiType';
import { ApiContext } from './ApiContext';
import { EmbeddingService } from './EmbeddingService';

// Wire shape of the OpenAI-compatible /v1/embeddings response the Sentient Sims AI server returns.
type EmbeddingsResponse = {
  data: { embedding: number[]; index: number }[];
  model: string;
};

// The server enforces a 60 second handler timeout on /v1/embeddings.
const embeddingRequestTimeoutMs = 60000;

// Embeds through the hosted Sentient Sims AI server. Same endpoint and auth as generation:
// the raw Cognito JWT in an Authentication header. An expired token just fails the request;
// callers already treat undefined embeddings as "try again later" (the backfill queue picks
// the rows back up on the next database load).
export class SentientSimsEmbeddingService implements EmbeddingService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  get model(): string {
    return this.ctx.embeddingProviderConfigs.modelFor(ApiType.SentientSimsAI);
  }

  isAvailable(): boolean {
    return Boolean(this.ctx.settings.accessToken);
  }

  async embed(texts: string[]): Promise<(Float32Array | undefined)[]> {
    if (texts.length === 0 || !this.isAvailable()) {
      return texts.map(() => undefined);
    }

    try {
      const response = await axiosClient<EmbeddingsResponse>({
        url: '/v1/embeddings',
        method: 'POST',
        baseURL: this.ctx.settings.sentientSimsAIEndpoint,
        timeout: embeddingRequestTimeoutMs,
        data: {
          model: this.model,
          input: texts,
        },
        headers: {
          Authentication: this.ctx.settings.accessToken,
          ...this.ctx.version.getVersionHeaders(),
        },
      });
      // Results may arrive out of order; index maps each embedding back to its input
      const byIndex = new Map(response.data.data.map((item) => [item.index, item.embedding]));
      return texts.map((_, index) => {
        const embedding = byIndex.get(index);
        return embedding ? Float32Array.from(embedding) : undefined;
      });
    } catch (error) {
      // The server answers a bad model with a 400 and a reason; surface that instead of
      // the axios error dump so a log reader can tell a rejected model from an outage
      if (axios.isAxiosError(error) && error.response) {
        log.error(
          `Sentient Sims AI embedding request for ${this.model} failed with HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`,
        );
      } else {
        log.error(`Sentient Sims AI embedding request for ${this.model} failed`, error);
      }
      return texts.map(() => undefined);
    }
  }
}
