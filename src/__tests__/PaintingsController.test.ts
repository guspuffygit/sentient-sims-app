import * as fs from 'fs';
import { Server } from 'http';
import sharp from 'sharp';
import { runApi } from 'main/sentient-sims/api';
import { PaintingManifestDTO } from 'main/sentient-sims/db/dto/PaintingManifestDTO';
import { mockApiContext } from './util';

describe('PaintingsController', () => {
  const ctx = mockApiContext({ port: 25197 });
  const apiUrl = `http://localhost:${ctx.port}`;
  let server: Server;

  beforeAll(() => {
    server = runApi(ctx);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err: Error | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  it('manifest is an empty list before a database is loaded', async () => {
    const res = await fetch(`${apiUrl}/paintings`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('serves the manifest and encodes the stored master PNG as DDS on the fly', async () => {
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    ctx.db.loadDatabase({ sessionId: '4457311', saveId: '3' });

    const png = await sharp({ create: { width: 64, height: 64, channels: 3, background: { r: 40, g: 90, b: 160 } } })
      .png()
      .toBuffer();
    const painting = ctx.paintingRepository.createPainting({
      prompt: 'a blue painting',
      image: png,
    });

    const manifestRes = await fetch(`${apiUrl}/paintings`);
    expect(manifestRes.status).toBe(200);
    const manifest = (await manifestRes.json()) as PaintingManifestDTO[];
    expect(manifest).toHaveLength(1);
    expect(manifest[0].instance_id).toEqual(painting.instance_id);
    expect(manifest[0].created_at).toBeTruthy();

    const textureRes = await fetch(`${apiUrl}/paintings/${painting.instance_id}/texture`);
    expect(textureRes.status).toBe(200);
    const body = (await textureRes.json()) as { imageBase64: string };
    const dds = Buffer.from(body.imageBase64, 'base64');
    // ready-to-write 512x512 DXT1 painting texture with a 10-level mip chain
    expect(dds.toString('ascii', 0, 4)).toEqual('DDS ');
    expect(dds.length).toEqual(174904);
  });

  it('returns 404 for unknown texture ids', async () => {
    const res = await fetch(`${apiUrl}/paintings/5353deadbeef0000/texture`);
    expect(res.status).toBe(404);
  });
});
