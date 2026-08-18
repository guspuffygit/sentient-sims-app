import { vi } from 'vitest';
import http from 'http';
import { AddressInfo } from 'net';
import sharp from 'sharp';
import OpenAI from 'openai';
import { ImageGenerateParamsNonStreaming, ImagesResponse } from 'openai/resources/images.js';
import { AIProviderConfig } from 'main/sentient-sims/models/AIProviderConfig';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { OpenAIService } from 'main/sentient-sims/services/OpenAIService';
import { openaiDefaultImageModel, sentientSimsAIDefaultImageModel } from 'main/sentient-sims/constants';
import { mockApiContext } from './util';

describe('Image Provider Configs', () => {
  let ctx: ApiContext;

  beforeEach(() => {
    ctx = mockApiContext();
  });

  function addConfig(config: AIProviderConfig) {
    ctx.settings.imageProviderConfigs = [...ctx.settings.imageProviderConfigs, config];
  }

  function mockImagesGenerate(response: ImagesResponse) {
    const openAIService = ctx.getGenerationService(ApiType.OpenAI) as OpenAIService;
    const generate = vi
      .fn<(params: ImageGenerateParamsNonStreaming) => Promise<ImagesResponse>>()
      .mockResolvedValue(response);
    vi.spyOn(openAIService, 'getOpenAIClient').mockReturnValue({
      images: { generate },
    } as unknown as OpenAI);
    return generate;
  }

  it('falls back to OpenAI with the default image model when nothing is configured', () => {
    const resolved = ctx.imageProviderConfigs.getResolvedConfig();
    expect(resolved.apiType).toEqual(ApiType.OpenAI);
    expect(resolved.model).toEqual(openaiDefaultImageModel);
  });

  it('Auto follows the main provider when it supports image generation', () => {
    ctx.settings.aiApiType = ApiType.SentientSimsAI;

    const resolved = ctx.imageProviderConfigs.getResolvedConfig();
    expect(resolved.apiType).toEqual(ApiType.SentientSimsAI);
    expect(resolved.model).toEqual(sentientSimsAIDefaultImageModel);
  });

  it('Auto treats a CustomAI main provider as Sentient Sims AI', () => {
    ctx.settings.aiApiType = ApiType.CustomAI;

    expect(ctx.imageProviderConfigs.getResolvedConfig().apiType).toEqual(ApiType.SentientSimsAI);
  });

  it('Auto falls back to the first image-capable provider with credentials', () => {
    ctx.settings.aiApiType = ApiType.KoboldAI;
    ctx.settings.accessToken = 'token';

    expect(ctx.imageProviderConfigs.getResolvedConfig().apiType).toEqual(ApiType.SentientSimsAI);

    ctx.settings.openaiKey = 'sk-key';
    expect(ctx.imageProviderConfigs.getResolvedConfig().apiType).toEqual(ApiType.OpenAI);
  });

  it('Auto falls back to OpenAI when no image-capable provider has credentials', () => {
    ctx.settings.aiApiType = ApiType.KoboldAI;

    expect(ctx.imageProviderConfigs.getResolvedConfig().apiType).toEqual(ApiType.OpenAI);
  });

  it('a chosen default config wins over Auto derivation', () => {
    ctx.settings.aiApiType = ApiType.SentientSimsAI;
    addConfig({ id: 'dalle', name: 'DALL-E', apiType: ApiType.OpenAI, model: 'dall-e-3' });
    ctx.settings.defaultImageProviderConfigId = 'dalle';

    expect(ctx.imageProviderConfigs.getResolvedConfig().apiType).toEqual(ApiType.OpenAI);
  });

  it('resolves the pinned model of the default config', () => {
    addConfig({ id: 'dalle', name: 'DALL-E', apiType: ApiType.OpenAI, model: 'dall-e-3' });
    ctx.settings.defaultImageProviderConfigId = 'dalle';

    const resolved = ctx.imageProviderConfigs.getResolvedConfig();
    expect(resolved.model).toEqual('dall-e-3');
  });

  it('routes to a specific config by id and falls back to default for stale ids', () => {
    addConfig({ id: 'default-config', name: 'Default', apiType: ApiType.OpenAI, model: 'gpt-image-1' });
    addConfig({ id: 'dalle', name: 'DALL-E', apiType: ApiType.OpenAI, model: 'dall-e-2' });
    ctx.settings.defaultImageProviderConfigId = 'default-config';

    expect(ctx.imageProviderConfigs.getResolvedConfig('dalle').model).toEqual('dall-e-2');
    expect(ctx.imageProviderConfigs.getResolvedConfig('does-not-exist').model).toEqual('gpt-image-1');
  });

  it('deleting the default config falls back to Auto', () => {
    addConfig({ id: 'keep', name: 'Keep', apiType: ApiType.OpenAI, model: 'gpt-image-1' });
    addConfig({ id: 'remove', name: 'Remove', apiType: ApiType.OpenAI, model: 'dall-e-3' });
    ctx.settings.defaultImageProviderConfigId = 'remove';

    ctx.settings.imageProviderConfigs = ctx.settings.imageProviderConfigs.filter((config) => config.id !== 'remove');

    expect(ctx.settings.defaultImageProviderConfigId).toEqual('');
  });

  it('sanitizes malformed image provider configs', () => {
    ctx.settings.setSetting('imageProviderConfigs', [
      { id: 'valid', name: 'Valid', apiType: 'openai', model: 'gpt-image-1' },
      { name: 'missing id', apiType: 'openai' },
    ]);

    const configs = ctx.settings.imageProviderConfigs;
    expect(configs).toHaveLength(1);
    expect(configs[0].id).toEqual('valid');
  });

  it('getImageGenerationService throws for providers without image support', () => {
    expect(() => ctx.getImageGenerationService(ApiType.NovelAI)).toThrow('Image generation is not supported');
  });

  it('AIService generateImage routes to the default config and stamps the model', async () => {
    addConfig({ id: 'dalle', name: 'DALL-E', apiType: ApiType.OpenAI, model: 'dall-e-3' });
    ctx.settings.defaultImageProviderConfigId = 'dalle';

    const imageService = ctx.getImageGenerationService(ApiType.OpenAI);
    const generateSpy = vi.spyOn(imageService, 'generateImage').mockResolvedValue({
      imageBase64: 'base64data',
      model: 'dall-e-3',
      apiType: ApiType.OpenAI,
    });

    const response = await ctx.ai.generateImage({ prompt: 'a sim painting a landscape' });

    expect(generateSpy).toHaveBeenCalledOnce();
    const request = generateSpy.mock.calls[0][0];
    expect(request.model).toEqual('dall-e-3');
    expect(request.prompt).toEqual('a sim painting a landscape');
    // no format requested: the provider's PNG base64 passes through untouched
    expect(response.imageBase64).toEqual('base64data');
  });

  it('AIService generateImage with format dds returns a ready-to-write painting texture', async () => {
    const png = await sharp({ create: { width: 32, height: 32, channels: 3, background: { r: 255, g: 0, b: 0 } } })
      .png()
      .toBuffer();
    const imageService = ctx.getImageGenerationService(ApiType.OpenAI);
    vi.spyOn(imageService, 'generateImage').mockResolvedValue({
      imageBase64: png.toString('base64'),
      model: 'gpt-image-1',
      apiType: ApiType.OpenAI,
    });

    const response = await ctx.ai.generateImage({ prompt: 'a red painting', format: 'dds' });

    const dds = Buffer.from(response.imageBase64, 'base64');
    expect(dds.toString('ascii', 0, 4)).toEqual('DDS ');
    // 512x512 DXT1 with a 10-level mip chain, per CUSTOM_PAINTING_TEXTURES.md
    expect(dds.length).toEqual(174904);
    expect(dds.readUInt32LE(28)).toEqual(10);
    expect(dds.toString('ascii', 84, 88)).toEqual('DXT1');
  });

  it('OpenAI image service returns base64 and requests b64_json for dall-e models', async () => {
    const generate = mockImagesGenerate({ created: 0, data: [{ b64_json: 'imagebytes' }] });

    const response = await ctx
      .getImageGenerationService(ApiType.OpenAI)
      .generateImage({ prompt: 'a cat', model: 'dall-e-3', size: '1024x1024' });

    expect(response.imageBase64).toEqual('imagebytes');
    expect(response.apiType).toEqual(ApiType.OpenAI);
    const params = generate.mock.calls[0][0];
    expect(params.response_format).toEqual('b64_json');
    expect(params.size).toEqual('1024x1024');
  });

  it('OpenAI image service omits response_format for gpt-image models and defaults the model', async () => {
    const generate = mockImagesGenerate({ created: 0, data: [{ b64_json: 'imagebytes' }] });

    await ctx.getImageGenerationService(ApiType.OpenAI).generateImage({ prompt: 'a cat' });

    const params = generate.mock.calls[0][0];
    expect(params.model).toEqual(openaiDefaultImageModel);
    expect(params.response_format).toBeUndefined();
  });

  it('OpenAI image service throws when no image data comes back', async () => {
    mockImagesGenerate({ created: 0, data: [] });

    await expect(ctx.getImageGenerationService(ApiType.OpenAI).generateImage({ prompt: 'a cat' })).rejects.toThrow(
      'No image data returned',
    );
  });

  it('resolves the Sentient Sims AI default image model when a config pins none', () => {
    addConfig({ id: 'ssai', name: 'Sentient Sims AI', apiType: ApiType.SentientSimsAI });
    ctx.settings.defaultImageProviderConfigId = 'ssai';

    const resolved = ctx.imageProviderConfigs.getResolvedConfig();
    expect(resolved.apiType).toEqual(ApiType.SentientSimsAI);
    expect(resolved.model).toEqual(sentientSimsAIDefaultImageModel);
  });

  describe('Sentient Sims AI image service', () => {
    let stub: http.Server;
    let baseUrl: string;
    // JSON body the stub returns from /v1/images/generations
    let imageResponse: unknown;
    let lastGeneration: { authentication?: string; body?: Record<string, unknown> } | undefined;

    beforeAll(async () => {
      stub = http.createServer((req, res) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          if ((req.url ?? '').includes('hosted-image')) {
            res.setHeader('Content-Type', 'image/png');
            res.end(Buffer.from('pngbytes'));
            return;
          }
          lastGeneration = {
            authentication: req.headers.authentication as string,
            body: JSON.parse(Buffer.concat(chunks).toString()) as Record<string, unknown>,
          };
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(imageResponse));
        });
      });
      await new Promise<void>((resolve) => {
        stub.listen(0, '127.0.0.1', () => {
          resolve();
        });
      });
      const { port } = stub.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${port}`;
    });

    afterAll(async () => {
      await new Promise<void>((resolve) => {
        stub.close(() => {
          resolve();
        });
      });
    });

    beforeEach(() => {
      ctx.settings.sentientSimsAIEndpoint = baseUrl;
      ctx.settings.accessToken = 'stub-token';
      lastGeneration = undefined;
    });

    it('posts the prompt with the auth header and returns base64', async () => {
      imageResponse = { created: 1, data: [{ b64_json: 'imagebytes' }] };

      const response = await ctx
        .getImageGenerationService(ApiType.SentientSimsAI)
        .generateImage({ prompt: 'a cat', model: 'google/gemini-3.1-flash-image' });

      expect(response.imageBase64).toEqual('imagebytes');
      expect(response.apiType).toEqual(ApiType.SentientSimsAI);
      expect(lastGeneration?.authentication).toEqual('stub-token');
      expect(lastGeneration?.body).toEqual({ model: 'google/gemini-3.1-flash-image', prompt: 'a cat' });
    });

    it('defaults the model when the request pins none', async () => {
      imageResponse = { created: 1, data: [{ b64_json: 'imagebytes' }] };

      await ctx.getImageGenerationService(ApiType.SentientSimsAI).generateImage({ prompt: 'a cat' });

      expect(lastGeneration?.body?.model).toEqual(sentientSimsAIDefaultImageModel);
    });

    it('downloads a passed-through image URL to base64', async () => {
      imageResponse = { created: 1, data: [{ url: `${baseUrl}/hosted-image.png` }] };

      const response = await ctx.getImageGenerationService(ApiType.SentientSimsAI).generateImage({ prompt: 'a cat' });

      expect(Buffer.from(response.imageBase64, 'base64').toString()).toEqual('pngbytes');
    });

    it('throws when no image data comes back', async () => {
      imageResponse = { created: 1, data: [] };

      await expect(
        ctx.getImageGenerationService(ApiType.SentientSimsAI).generateImage({ prompt: 'a cat' }),
      ).rejects.toThrow('No image data returned');
    });
  });
});
