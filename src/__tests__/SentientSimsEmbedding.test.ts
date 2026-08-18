import * as http from 'http';
import { AddressInfo } from 'net';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { sentientSimsAIDefaultEmbeddingModel } from 'main/sentient-sims/constants';
import { NoopEmbeddingService, OpenAIEmbeddingService } from 'main/sentient-sims/services/EmbeddingService';
import { SentientSimsEmbeddingService } from 'main/sentient-sims/services/SentientSimsEmbeddingService';
import { GeminiEmbeddingService } from 'main/sentient-sims/services/GeminiEmbeddingService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { mockApiContext } from './util';

type EmbeddingRequestBody = {
  model: string;
  input: string[];
};

type CapturedRequest = {
  headers: http.IncomingHttpHeaders;
  body: EmbeddingRequestBody;
};

// Minimal stand-in for the Sentient Sims AI server's /v1/embeddings endpoint
async function startEmbeddingsServer(
  respond: (request: CapturedRequest, response: http.ServerResponse) => void,
): Promise<{ url: string; requests: CapturedRequest[]; close: () => Promise<void> }> {
  const requests: CapturedRequest[] = [];
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      const request: CapturedRequest = {
        headers: req.headers,
        body: JSON.parse(Buffer.concat(chunks).toString() || 'null') as EmbeddingRequestBody,
      };
      requests.push(request);
      respond(request, res);
    });
  });
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    requests,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }),
  };
}

function contextWithToken(): ApiContext {
  const ctx = mockApiContext();
  ctx.settings.accessToken = 'test-token';
  return ctx;
}

describe('SentientSimsEmbeddingService', () => {
  it('is unavailable without an access token and embeds to undefined', async () => {
    const ctx = mockApiContext();
    const service = new SentientSimsEmbeddingService(ctx);
    expect(service.isAvailable()).toBe(false);
    expect(await service.embed(['a', 'b'])).toEqual([undefined, undefined]);
  });

  it('uses the configured embedding model and auth header, remapping results by index', async () => {
    const server = await startEmbeddingsServer((request, response) => {
      // Out of order on purpose: the index field, not array position, is authoritative
      response.setHeader('Content-Type', 'application/json');
      response.end(
        JSON.stringify({
          object: 'list',
          data: [
            { object: 'embedding', index: 1, embedding: [3, 4] },
            { object: 'embedding', index: 0, embedding: [1, 2] },
          ],
          model: request.body.model,
        }),
      );
    });
    try {
      const ctx = contextWithToken();
      ctx.settings.sentientSimsAIEndpoint = server.url;
      ctx.settings.sentientSimsAIEmbeddingModel = 'Qwen/Qwen3-Embedding-4B';

      const service = new SentientSimsEmbeddingService(ctx);
      expect(service.model).toEqual('Qwen/Qwen3-Embedding-4B');

      const [first, second] = await service.embed(['first text', 'second text']);
      expect(Array.from(first as Float32Array)).toEqual([1, 2]);
      expect(Array.from(second as Float32Array)).toEqual([3, 4]);

      expect(server.requests).toHaveLength(1);
      expect(server.requests[0].body).toEqual({
        model: 'Qwen/Qwen3-Embedding-4B',
        input: ['first text', 'second text'],
      });
      expect(server.requests[0].headers.authentication).toEqual('test-token');
    } finally {
      await server.close();
    }
  });

  it('degrades to undefined embeddings when the server errors', async () => {
    const server = await startEmbeddingsServer((_request, response) => {
      response.statusCode = 500;
      response.end(JSON.stringify({ error: 'boom' }));
    });
    try {
      const ctx = contextWithToken();
      ctx.settings.sentientSimsAIEndpoint = server.url;

      const service = new SentientSimsEmbeddingService(ctx);
      expect(await service.embed(['text'])).toEqual([undefined]);
    } finally {
      await server.close();
    }
  });
});

describe('embedding provider selection', () => {
  it('routes the embedding seam by the embeddingApiType setting', () => {
    const ctx = contextWithToken();
    ctx.settings.memoryRetrievalEnabled = true;

    expect(ctx.getEmbeddingService(ApiType.OpenAI)).toBeInstanceOf(OpenAIEmbeddingService);
    expect(ctx.getEmbeddingService(ApiType.SentientSimsAI)).toBeInstanceOf(SentientSimsEmbeddingService);
    // CustomAI shares the Sentient Sims AI connection settings
    expect(ctx.getEmbeddingService(ApiType.CustomAI)).toBeInstanceOf(SentientSimsEmbeddingService);
    expect(ctx.getEmbeddingService(ApiType.Gemini)).toBeInstanceOf(GeminiEmbeddingService);

    ctx.settings.embeddingApiType = ApiType.SentientSimsAI;
    expect(ctx.embedding).toBeInstanceOf(SentientSimsEmbeddingService);
    expect(ctx.embedding.model).toEqual(sentientSimsAIDefaultEmbeddingModel);
  });

  it('falls back to noop when the selected provider is not ready or retrieval is off', () => {
    const ctx = mockApiContext();
    ctx.settings.memoryRetrievalEnabled = true;
    ctx.settings.embeddingApiType = ApiType.SentientSimsAI;
    // No access token: the Sentient Sims embedder is unavailable
    expect(ctx.embedding).toBeInstanceOf(NoopEmbeddingService);

    ctx.settings.accessToken = 'test-token';
    expect(ctx.embedding).toBeInstanceOf(SentientSimsEmbeddingService);

    ctx.settings.memoryRetrievalEnabled = false;
    expect(ctx.embedding).toBeInstanceOf(NoopEmbeddingService);
  });
});
