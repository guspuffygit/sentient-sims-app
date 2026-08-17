import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import { interactionDisplayName } from '../util/interactionDisplayName';
import { ApiContext } from './ApiContext';
import { cosineSimilarity, embeddingToBuffer, bufferToEmbedding } from './EmbeddingService';

// Keeps each request comfortably under the embeddings API input limits
const EMBED_BATCH_SIZE = 500;

const DEFAULT_RESULT_LIMIT = 100;

export type SemanticSearchResult = {
  name: string;
  score: number;
};

export type SemanticSearchResponse = {
  // false when no OpenAI key is configured, so the UI can fall back to text filtering
  available: boolean;
  results: SemanticSearchResult[];
};

type CacheEntry = {
  text: string;
  embedding: Float32Array;
};

type CacheFile = {
  model: string;
  entries: Record<string, { text: string; embedding: string }>;
};

export class InteractionSemanticSearchService {
  private readonly ctx: ApiContext;

  private cache?: Map<string, CacheEntry>;

  // Serializes catalog indexing so concurrent searches don't both embed everything
  private indexing?: Promise<void>;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  async search(query: string, limit = DEFAULT_RESULT_LIMIT): Promise<SemanticSearchResponse> {
    const trimmedQuery = query.trim();
    if (!this.ctx.embedding.isAvailable() || !trimmedQuery) {
      return { available: this.ctx.embedding.isAvailable(), results: [] };
    }

    const texts = await this.getEmbeddingTexts();

    if (this.indexing) {
      await this.indexing;
    }
    this.indexing = this.indexMissing(texts);
    try {
      await this.indexing;
    } finally {
      this.indexing = undefined;
    }

    const [queryVector] = await this.ctx.embedding.embed([trimmedQuery]);
    if (!queryVector) {
      return { available: false, results: [] };
    }

    const cache = this.loadCache();
    const results: SemanticSearchResult[] = [];
    texts.forEach((text, name) => {
      const entry = cache.get(name);
      if (entry && entry.text === text) {
        results.push({ name, score: cosineSimilarity(queryVector, entry.embedding) });
      }
    });
    results.sort((a, b) => b.score - a.score);

    return { available: true, results: results.slice(0, limit) };
  }

  // What gets embedded per interaction: the derived display name, the raw tuning
  // name, and the mapped description so all three are semantically searchable
  private async getEmbeddingTexts(): Promise<Map<string, string>> {
    const interactions = await this.ctx.interactionRepository.getBrowsableInteractions();
    const texts = new Map<string, string>();
    interactions.forEach((interaction, name) => {
      texts.set(name, [interactionDisplayName(name), name, interaction.action ?? ''].join('\n').trim());
    });
    return texts;
  }

  private async indexMissing(texts: Map<string, string>): Promise<void> {
    const cache = this.loadCache();
    const missing = [...texts.entries()].filter(([name, text]) => cache.get(name)?.text !== text);
    if (missing.length === 0) {
      return;
    }

    log.info(`[SemanticSearch] Embedding ${missing.length} interactions`);
    let embeddedAny = false;
    for (let start = 0; start < missing.length; start += EMBED_BATCH_SIZE) {
      const batch = missing.slice(start, start + EMBED_BATCH_SIZE);
      const vectors = await this.ctx.embedding.embed(batch.map(([, text]) => text));
      // A plain loop, not forEach: TypeScript does not track assignments made inside a
      // callback, so `embeddedAny` would stay narrowed to false for the check below
      for (let index = 0; index < batch.length; index += 1) {
        const [name, text] = batch[index];
        const embedding = vectors[index];
        if (embedding) {
          cache.set(name, { text, embedding });
          embeddedAny = true;
        }
      }
    }

    if (embeddedAny) {
      // Prune interactions that no longer exist so the cache tracks the catalog
      [...cache.keys()].filter((name) => !texts.has(name)).forEach((name) => cache.delete(name));
      this.saveCache(cache);
    }
  }

  private getCachePath(): string {
    return path.join(this.ctx.directory.getSentientSimsFolder(), 'interaction_embeddings.json');
  }

  private loadCache(): Map<string, CacheEntry> {
    if (this.cache) {
      return this.cache;
    }

    this.cache = new Map();
    try {
      const cachePath = this.getCachePath();
      if (fs.existsSync(cachePath)) {
        const parsed = JSON.parse(fs.readFileSync(cachePath, 'utf-8')) as CacheFile;
        if (parsed.model === this.ctx.embedding.model) {
          Object.entries(parsed.entries).forEach(([name, entry]) => {
            this.cache?.set(name, {
              text: entry.text,
              embedding: bufferToEmbedding(Buffer.from(entry.embedding, 'base64')),
            });
          });
        }
      }
    } catch (err) {
      log.error('[SemanticSearch] Could not load embedding cache, rebuilding it', err);
    }
    return this.cache;
  }

  private saveCache(cache: Map<string, CacheEntry>) {
    try {
      const file: CacheFile = { model: this.ctx.embedding.model, entries: {} };
      cache.forEach((entry, name) => {
        file.entries[name] = {
          text: entry.text,
          embedding: embeddingToBuffer(entry.embedding).toString('base64'),
        };
      });
      fs.writeFileSync(this.getCachePath(), JSON.stringify(file));
    } catch (err) {
      log.error('[SemanticSearch] Could not save embedding cache', err);
    }
  }
}
