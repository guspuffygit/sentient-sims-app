import { geminiDefaultEmbeddingModel } from 'main/sentient-sims/constants';

type EmbedContentRequest = {
  model: string;
  contents: string[];
};

const embedContentCalls: EmbedContentRequest[] = [];
const constructedKeys: string[] = [];
let respond: (request: EmbedContentRequest) => Promise<{ embeddings?: { values?: number[] }[] }>;

vi.mock('@google/genai', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  GoogleGenAI: class {
    constructor({ apiKey }: { apiKey: string }) {
      constructedKeys.push(apiKey);
    }

    models = {
      embedContent: (request: EmbedContentRequest) => {
        embedContentCalls.push(request);
        return respond(request);
      },
    };
  },
}));

// Imported after the mock so the service picks up the fake Gemini client
const { GeminiEmbeddingService } = await import('main/sentient-sims/services/GeminiEmbeddingService');
const { mockApiContext } = await import('./util');

describe('GeminiEmbeddingService', () => {
  beforeEach(() => {
    embedContentCalls.length = 0;
    constructedKeys.length = 0;
    respond = (request) =>
      Promise.resolve({
        embeddings: request.contents.map((_, index) => ({ values: [index + 1, index + 2] })),
      });
  });

  it('is unavailable without Gemini keys and embeds to undefined', async () => {
    const ctx = mockApiContext();
    const service = new GeminiEmbeddingService(ctx);
    expect(service.isAvailable()).toBe(false);
    expect(await service.embed(['a', 'b'])).toEqual([undefined, undefined]);
    expect(embedContentCalls).toHaveLength(0);
  });

  it('embeds through the Gemini API with a key from the configured pool', async () => {
    const ctx = mockApiContext();
    ctx.settings.geminiKeys = ' key1 , key2 ';

    const service = new GeminiEmbeddingService(ctx);
    expect(service.isAvailable()).toBe(true);
    expect(service.model).toEqual(geminiDefaultEmbeddingModel);

    const [first, second] = await service.embed(['first text', 'second text']);
    expect(Array.from(first as Float32Array)).toEqual([1, 2]);
    expect(Array.from(second as Float32Array)).toEqual([2, 3]);

    expect(embedContentCalls).toHaveLength(1);
    expect(embedContentCalls[0]).toEqual({
      model: geminiDefaultEmbeddingModel,
      contents: ['first text', 'second text'],
    });
    expect(['key1', 'key2']).toContain(constructedKeys[0]);
  });

  it('chunks caller batches above the Gemini per-request limit of 100', async () => {
    const ctx = mockApiContext();
    ctx.settings.geminiKeys = 'key1';

    const service = new GeminiEmbeddingService(ctx);
    const texts = Array.from({ length: 250 }, (_, index) => `text ${index}`);
    const vectors = await service.embed(texts);

    expect(vectors).toHaveLength(250);
    expect(vectors.every((vector) => vector instanceof Float32Array)).toBe(true);
    expect(embedContentCalls.map((call) => call.contents.length)).toEqual([100, 100, 50]);
  });

  it('keeps earlier batch results and degrades the rest to undefined on error', async () => {
    const ctx = mockApiContext();
    ctx.settings.geminiKeys = 'key1';

    respond = (request) => {
      if (embedContentCalls.length > 1) {
        return Promise.reject(new Error('boom'));
      }
      return Promise.resolve({
        embeddings: request.contents.map(() => ({ values: [1, 2] })),
      });
    };

    const service = new GeminiEmbeddingService(ctx);
    const texts = Array.from({ length: 150 }, (_, index) => `text ${index}`);
    const vectors = await service.embed(texts);

    expect(vectors).toHaveLength(150);
    expect(vectors.slice(0, 100).every((vector) => vector instanceof Float32Array)).toBe(true);
    expect(vectors.slice(100).every((vector) => vector === undefined)).toBe(true);
  });
});
