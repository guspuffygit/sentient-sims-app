import http from 'http';
import { AddressInfo } from 'net';
import { ApiType, embeddingApiTypes, imageGenerationApiTypes } from 'main/sentient-sims/models/ApiType';
import { embeddingModelSuggestions } from 'main/sentient-sims/models/EmbeddingModels';
import { imageModelSuggestions } from 'main/sentient-sims/models/ImageGeneration';
import {
  openrouterDefaultEmbeddingModel,
  openrouterDefaultImageModel,
  sentientSimsAIDefaultEmbeddingModel,
} from 'main/sentient-sims/constants';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { OpenRouterEmbeddingService } from 'main/sentient-sims/services/OpenRouterEmbeddingService';
import { mockApiContext } from './util';

type CapturedRequest = {
  url?: string;
  authorization?: string;
  body: Record<string, unknown>;
};

describe('OpenRouter embeddings and images', () => {
  let ctx: ApiContext;
  let stub: http.Server;
  let baseUrl: string;
  // JSON body the stub returns for the next request
  let stubResponse: unknown;
  let requests: CapturedRequest[];

  beforeAll(async () => {
    stub = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        requests.push({
          url: req.url,
          authorization: req.headers.authorization,
          body: JSON.parse(Buffer.concat(chunks).toString()) as Record<string, unknown>,
        });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(stubResponse));
      });
    });
    await new Promise<void>((resolve) => {
      stub.listen(0, '127.0.0.1', () => {
        resolve();
      });
    });
    const { port } = stub.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}/api/v1`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      stub.close(() => {
        resolve();
      });
    });
  });

  beforeEach(() => {
    ctx = mockApiContext();
    ctx.settings.aiApiType = ApiType.OpenRouter;
    ctx.settings.openrouterKey = 'sk-or-v1-test';
    ctx.settings.openrouterEndpoint = baseUrl;
    requests = [];
  });

  it('is offered for both capabilities with models to pick from', () => {
    expect(embeddingApiTypes).toContain(ApiType.OpenRouter);
    expect(imageGenerationApiTypes).toContain(ApiType.OpenRouter);
    expect(embeddingModelSuggestions(ApiType.OpenRouter)).toContain(openrouterDefaultEmbeddingModel);
    expect(imageModelSuggestions(ApiType.OpenRouter)).toContain(openrouterDefaultImageModel);
  });

  it('Auto follows an OpenRouter main provider', () => {
    const embedding = ctx.embeddingProviderConfigs.getResolvedConfig();
    expect(embedding.apiType).toEqual(ApiType.OpenRouter);
    expect(embedding.model).toEqual(openrouterDefaultEmbeddingModel);

    const image = ctx.imageProviderConfigs.getResolvedConfig();
    expect(image.apiType).toEqual(ApiType.OpenRouter);
    expect(image.model).toEqual(openrouterDefaultImageModel);
  });

  it('Auto falls back to OpenRouter when it holds the only credentials', () => {
    ctx.settings.aiApiType = ApiType.KoboldAI;

    expect(ctx.embeddingProviderConfigs.getResolvedConfig().apiType).toEqual(ApiType.OpenRouter);
    expect(ctx.imageProviderConfigs.getResolvedConfig().apiType).toEqual(ApiType.OpenRouter);
  });

  it('keys the OpenRouter embedding service by the pinned model only when selected', () => {
    expect(ctx.embedding).toBeInstanceOf(OpenRouterEmbeddingService);
    expect(ctx.embedding.model).toEqual(openrouterDefaultEmbeddingModel);

    ctx.settings.embeddingProviderConfigs = [
      { id: 'qwen', name: 'Qwen', apiType: ApiType.OpenRouter, model: 'qwen/qwen3-embedding-8b' },
    ];
    ctx.settings.defaultEmbeddingProviderConfigId = 'qwen';

    expect(ctx.embedding.model).toEqual('qwen/qwen3-embedding-8b');
    expect(ctx.getEmbeddingService(ApiType.SentientSimsAI).model).toEqual(sentientSimsAIDefaultEmbeddingModel);
  });

  it('embeds through the OpenRouter endpoint with the OpenRouter key', async () => {
    ctx.settings.openaiKey = 'sk-openai';
    stubResponse = {
      object: 'list',
      data: [
        { object: 'embedding', index: 1, embedding: [0, 1] },
        { object: 'embedding', index: 0, embedding: [1, 0] },
      ],
    };

    const vectors = await ctx.embedding.embed(['first', 'second']);

    expect(vectors).toEqual([Float32Array.from([1, 0]), Float32Array.from([0, 1])]);
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toEqual('/api/v1/embeddings');
    expect(requests[0].authorization).toEqual('Bearer sk-or-v1-test');
    expect(requests[0].body.model).toEqual(openrouterDefaultEmbeddingModel);
    expect(requests[0].body.input).toEqual(['first', 'second']);
    expect(requests[0].body.encoding_format).toEqual('float');
  });

  it('generates an image through the OpenRouter /images endpoint', async () => {
    stubResponse = { created: 1, data: [{ b64_json: 'imagebytes', media_type: 'image/png' }] };

    const response = await ctx.ai.generateImage({ prompt: 'a cat', size: '1024x1024' });

    expect(response.imageBase64).toEqual('imagebytes');
    expect(response.apiType).toEqual(ApiType.OpenRouter);
    expect(response.model).toEqual(openrouterDefaultImageModel);
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toEqual('/api/v1/images');
    expect(requests[0].authorization).toEqual('Bearer sk-or-v1-test');
    expect(requests[0].body).toEqual({ model: openrouterDefaultImageModel, prompt: 'a cat' });
  });

  it('throws when OpenRouter returns no image data', async () => {
    stubResponse = { created: 1, data: [] };

    await expect(ctx.getImageGenerationService(ApiType.OpenRouter).generateImage({ prompt: 'a cat' })).rejects.toThrow(
      'No image data returned from OpenRouter',
    );
  });
});
