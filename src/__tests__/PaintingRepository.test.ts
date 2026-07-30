import * as fs from 'fs';
import { vi } from 'vitest';
import sharp from 'sharp';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import {
  PAINTING_INSTANCE_PREFIX,
  allocateTextureInstanceId,
  deriveTextureInstanceId,
  fnv1a64,
} from 'main/sentient-sims/image/paintingInstanceId';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { mockApiContext } from './util';

function loadedContext(sessionId: string): ApiContext {
  const ctx = mockApiContext();
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
    recursive: true,
  });
  ctx.db.loadDatabase({ sessionId, saveId: '1' });
  return ctx;
}

describe('texture instance id derivation', () => {
  it('implements FNV-1a 64 (reference vectors)', () => {
    expect(fnv1a64('')).toEqual(0xcbf29ce484222325n);
    expect(fnv1a64('a')).toEqual(0xaf63dc4c8601ec8cn);
    expect(fnv1a64('foobar')).toEqual(0x85944171f73967e8n);
  });

  it('derives deterministic 16-char lowercase hex ids in the SS range', () => {
    const uuid = '4b36115c-be82-41a5-9a29-55ce1c0b0f92';
    const id = deriveTextureInstanceId(uuid);
    expect(id).toMatch(/^5353[0-9a-f]{12}$/);
    expect(deriveTextureInstanceId(uuid)).toEqual(id);
    expect(BigInt(`0x${id}`) & 0xffff000000000000n).toEqual(PAINTING_INSTANCE_PREFIX);
    expect(deriveTextureInstanceId('e3f7f60e-8b6a-4b62-9f21-9d6a80b2e111')).not.toEqual(id);
  });

  it('re-salts on collision and keeps the prefix', () => {
    const uuid = '9c0e1f34-2f7d-4a11-8f68-3f2a9a3a6a01';
    const first = deriveTextureInstanceId(uuid, 0);
    const second = deriveTextureInstanceId(uuid, 1);
    expect(second).not.toEqual(first);
    expect(second).toMatch(/^5353[0-9a-f]{12}$/);

    expect(allocateTextureInstanceId(uuid, () => false)).toEqual(first);
    const taken = new Set([first]);
    expect(allocateTextureInstanceId(uuid, (id) => taken.has(id))).toEqual(second);
  });
});

describe('PaintingRepository', () => {
  it('CRUD', () => {
    const ctx = loadedContext('7981731');
    const image = Buffer.from('89504e470d0a1a0adeadbeef', 'hex');
    const painting = ctx.paintingRepository.createPainting({
      prompt: 'a moody landscape at dusk',
      image,
      metadata: JSON.stringify({ artist_name: 'Bella Goth' }),
    });

    expect(painting.uuid).toBeTruthy();
    expect(painting.instance_id).toEqual(deriveTextureInstanceId(painting.uuid));
    expect(painting.prompt).toEqual('a moody landscape at dusk');
    expect(painting.created_at).toBeTruthy();
    expect(Buffer.isBuffer(painting.image)).toBe(true);
    expect(Buffer.compare(painting.image as Buffer, image)).toEqual(0);
    expect(JSON.parse(painting.metadata as string)).toEqual({
      artist_name: 'Bella Goth',
    });

    expect(ctx.paintingRepository.instanceIdExists(painting.instance_id)).toBe(true);
    expect(ctx.paintingRepository.instanceIdExists('5353000000000000')).toBe(false);
    expect(ctx.paintingRepository.getPaintingByInstanceId('5353000000000000')).toBeUndefined();

    const manifest = ctx.paintingRepository.getManifest();
    expect(manifest).toHaveLength(1);
    expect(manifest[0].uuid).toEqual(painting.uuid);
    expect(manifest[0].instance_id).toEqual(painting.instance_id);
    expect(manifest[0].created_at).toBeTruthy();
    // the manifest must never drag the image blobs along
    expect('image' in manifest[0]).toBe(false);
  });
});

describe('AIService generateImage painting records', () => {
  it('dds format stores the master PNG and returns its texture id', async () => {
    const ctx = loadedContext('7981732');
    const png = await sharp({ create: { width: 32, height: 32, channels: 3, background: { r: 255, g: 0, b: 0 } } })
      .png()
      .toBuffer();
    const imageService = ctx.getImageGenerationService(ApiType.OpenAI);
    vi.spyOn(imageService, 'generateImage').mockResolvedValue({
      imageBase64: png.toString('base64'),
      model: 'gpt-image-1',
      apiType: ApiType.OpenAI,
    });

    const response = await ctx.ai.generateImage({
      prompt: 'a red painting',
      format: 'dds',
      metadata: { artist_name: 'Bob Pancakes', recipe_name: 'painting_Classic_Large' },
    });

    expect(response.textureInstanceId).toMatch(/^5353[0-9a-f]{12}$/);
    const stored = ctx.paintingRepository.getPaintingByInstanceId(response.textureInstanceId as string);
    expect(stored?.prompt).toEqual('a red painting');
    expect(Buffer.compare(stored?.image as Buffer, png)).toEqual(0);
    expect(JSON.parse(stored?.metadata as string)).toEqual({
      artist_name: 'Bob Pancakes',
      recipe_name: 'painting_Classic_Large',
    });

    // the response still carries the ready-to-write DDS texture
    const dds = Buffer.from(response.imageBase64, 'base64');
    expect(dds.toString('ascii', 0, 4)).toEqual('DDS ');
    expect(dds.length).toEqual(174904);
  });

  it('png format requests create no record and keep the response as-is', async () => {
    const ctx = loadedContext('7981733');
    const imageService = ctx.getImageGenerationService(ApiType.OpenAI);
    vi.spyOn(imageService, 'generateImage').mockResolvedValue({
      imageBase64: 'base64data',
      model: 'dall-e-3',
      apiType: ApiType.OpenAI,
    });

    const response = await ctx.ai.generateImage({ prompt: 'a cat' });

    expect(response.imageBase64).toEqual('base64data');
    expect('textureInstanceId' in response).toBe(false);
    expect(ctx.paintingRepository.getManifest()).toHaveLength(0);
  });

  it('dds format without a loaded database still returns the texture, without an id', async () => {
    const ctx = mockApiContext();
    const png = await sharp({ create: { width: 32, height: 32, channels: 3, background: { r: 0, g: 255, b: 0 } } })
      .png()
      .toBuffer();
    const imageService = ctx.getImageGenerationService(ApiType.OpenAI);
    vi.spyOn(imageService, 'generateImage').mockResolvedValue({
      imageBase64: png.toString('base64'),
      apiType: ApiType.OpenAI,
    });

    const response = await ctx.ai.generateImage({ prompt: 'a green painting', format: 'dds' });

    expect(response.textureInstanceId).toBeUndefined();
    expect(Buffer.from(response.imageBase64, 'base64').toString('ascii', 0, 4)).toEqual('DDS ');
  });
});
