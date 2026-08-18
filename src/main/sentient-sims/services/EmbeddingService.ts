import log from 'electron-log';
import OpenAI from 'openai';
import { openaiDefaultEmbeddingModel, openaiDefaultEndpoint } from '../constants';
import { ApiType } from '../models/ApiType';
import { ApiContext } from './ApiContext';

export const OPENAI_EMBEDDING_MODEL = openaiDefaultEmbeddingModel;

// Memory retrieval and semantic search degrade gracefully without an OpenAI key: callers get undefined
// embeddings back and skip similarity scoring rather than erroring.
export interface EmbeddingService {
  readonly model: string;
  isAvailable(): boolean;
  embed(texts: string[]): Promise<(Float32Array | undefined)[]>;
}

export function embeddingToBuffer(embedding: Float32Array): Buffer {
  return Buffer.from(embedding.buffer, embedding.byteOffset, embedding.byteLength);
}

export function bufferToEmbedding(buffer: Buffer): Float32Array {
  // Copy so the view is aligned and independent of the pooled Buffer slab
  return new Float32Array(new Uint8Array(buffer).buffer);
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length || a.length === 0) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class NoopEmbeddingService implements EmbeddingService {
  readonly model = 'none';

  isAvailable(): boolean {
    return false;
  }

  embed(texts: string[]): Promise<(Float32Array | undefined)[]> {
    return Promise.resolve(texts.map(() => undefined));
  }
}

// Always talks to the real OpenAI API regardless of which chat provider is selected:
// the openaiEndpoint setting may point at a local server with no embeddings endpoint.
export class OpenAIEmbeddingService implements EmbeddingService {
  private readonly ctx: ApiContext;

  private client?: OpenAI;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  get model(): string {
    return this.ctx.embeddingProviderConfigs.modelFor(ApiType.OpenAI);
  }

  private getKey(): string | undefined {
    return this.ctx.settings.openaiKey || process.env.OPENAI_KEY || undefined;
  }

  isAvailable(): boolean {
    return Boolean(this.getKey());
  }

  private getClient(): OpenAI {
    const apiKey = this.getKey();
    if (!apiKey) {
      throw new Error('No OpenAI key available for embeddings');
    }
    if (!this.client || this.client.apiKey !== apiKey) {
      this.client = new OpenAI({
        dangerouslyAllowBrowser: process.env.NODE_ENV === 'test',
        apiKey,
        baseURL: openaiDefaultEndpoint,
        maxRetries: 1,
      });
    }
    return this.client;
  }

  async embed(texts: string[]): Promise<(Float32Array | undefined)[]> {
    if (texts.length === 0 || !this.isAvailable()) {
      return texts.map(() => undefined);
    }

    try {
      const response = await this.getClient().embeddings.create({
        model: this.model,
        input: texts,
      });
      const byIndex = new Map(response.data.map((item) => [item.index, item.embedding]));
      return texts.map((_, index) => {
        const embedding = byIndex.get(index);
        return embedding ? Float32Array.from(embedding) : undefined;
      });
    } catch (error) {
      log.error('Embedding request failed', error);
      return texts.map(() => undefined);
    }
  }
}
