import sharp from 'sharp';
import { dxt1LevelByteSize, encodeDxt1, from565, to565 } from 'main/sentient-sims/image/dxt1';
import {
  buildDxt1DdsHeader,
  halveRgb,
  mipLevelSizes,
  pngToPaintingDds,
  rgbToPaintingDds,
} from 'main/sentient-sims/image/paintingDds';

// 128-byte header + DXT1 block data for 512^2 with 10 mips, per CUSTOM_PAINTING_TEXTURES.md
const FULL_DDS_BYTES = 174904;
const MIP_PAYLOAD_BYTES = [131072, 32768, 8192, 2048, 512, 128, 32, 8, 8, 8];

function solidRgb(size: number, r: number, g: number, b: number): Uint8Array {
  const rgb = new Uint8Array(size * size * 3);
  for (let i = 0; i < rgb.length; i += 3) {
    rgb[i] = r;
    rgb[i + 1] = g;
    rgb[i + 2] = b;
  }
  return rgb;
}

/** Reference DXT1 block decode (opaque 4-color mode) used to sanity-check the encoder. */
function decodeDxt1Block(block: Buffer, offset: number): number[][] {
  const color0 = block.readUInt16LE(offset);
  const color1 = block.readUInt16LE(offset + 2);
  const indices = block.readUInt32LE(offset + 4);
  const [r0, g0, b0] = from565(color0);
  const [r1, g1, b1] = from565(color1);
  const palette = [
    [r0, g0, b0],
    [r1, g1, b1],
    [Math.round((2 * r0 + r1) / 3), Math.round((2 * g0 + g1) / 3), Math.round((2 * b0 + b1) / 3)],
    [Math.round((r0 + 2 * r1) / 3), Math.round((g0 + 2 * g1) / 3), Math.round((b0 + 2 * b1) / 3)],
  ];
  const texels: number[][] = [];
  for (let i = 0; i < 16; i += 1) {
    texels.push(palette[(indices >>> (i * 2)) & 0x3]);
  }
  return texels;
}

describe('dxt1 encoder', () => {
  it('encodes a solid-color 8x8 with both endpoints equal to that color', () => {
    const blocks = encodeDxt1(solidRgb(8, 200, 80, 40), 8, 8);
    expect(blocks.length).toEqual(dxt1LevelByteSize(8, 8));
    expect(blocks.length).toEqual(4 * 8);
    const expected = to565(200, 80, 40);
    for (let block = 0; block < 4; block += 1) {
      expect(blocks.readUInt16LE(block * 8)).toEqual(expected);
      expect(blocks.readUInt16LE(block * 8 + 2)).toEqual(expected);
      expect(blocks.readUInt32LE(block * 8 + 4)).toEqual(0);
    }
  });

  it('decodes a black/white block back exactly', () => {
    // left half black, right half white; both endpoints are exact in RGB565
    const rgb = new Uint8Array(4 * 4 * 3);
    for (let y = 0; y < 4; y += 1) {
      for (let x = 2; x < 4; x += 1) {
        rgb.fill(255, (y * 4 + x) * 3, (y * 4 + x) * 3 + 3);
      }
    }
    const blocks = encodeDxt1(rgb, 4, 4);
    const texels = decodeDxt1Block(blocks, 0);
    for (let i = 0; i < 16; i += 1) {
      const expected = i % 4 < 2 ? [0, 0, 0] : [255, 255, 255];
      expect(texels[i]).toEqual(expected);
    }
  });

  it('keeps a gray gradient block within tolerance', () => {
    const rgb = new Uint8Array(4 * 4 * 3);
    for (let i = 0; i < 16; i += 1) {
      rgb.fill(i * 6, i * 3, i * 3 + 3);
    }
    const blocks = encodeDxt1(rgb, 4, 4);
    const texels = decodeDxt1Block(blocks, 0);
    for (let i = 0; i < 16; i += 1) {
      for (let c = 0; c < 3; c += 1) {
        expect(Math.abs(texels[i][c] - i * 6)).toBeLessThanOrEqual(24);
      }
    }
  });

  it('clamps edge texels for levels smaller than a block', () => {
    for (const size of [1, 2]) {
      const blocks = encodeDxt1(solidRgb(size, 10, 200, 30), size, size);
      expect(blocks.length).toEqual(8);
      expect(blocks.readUInt16LE(0)).toEqual(to565(10, 200, 30));
      expect(blocks.readUInt16LE(2)).toEqual(to565(10, 200, 30));
      expect(blocks.readUInt32LE(4)).toEqual(0);
    }
  });

  it('rejects mismatched buffer sizes', () => {
    expect(() => encodeDxt1(new Uint8Array(3), 4, 4)).toThrow('expected 48 RGB bytes');
  });
});

describe('painting dds', () => {
  it('writes the DXT1 header fields byte-exactly', () => {
    const header = buildDxt1DdsHeader(512, 10);
    expect(header.length).toEqual(128);
    expect(header.toString('ascii', 0, 4)).toEqual('DDS ');
    expect(header.readUInt32LE(4)).toEqual(124);
    expect(header.readUInt32LE(8)).toEqual(0x000a1007);
    expect(header.readUInt32LE(12)).toEqual(512);
    expect(header.readUInt32LE(16)).toEqual(512);
    expect(header.readUInt32LE(20)).toEqual(131072);
    expect(header.readUInt32LE(24)).toEqual(0);
    expect(header.readUInt32LE(28)).toEqual(10);
    expect(header.readUInt32LE(76)).toEqual(32);
    expect(header.readUInt32LE(80)).toEqual(0x00000004);
    expect(header.toString('ascii', 84, 88)).toEqual('DXT1');
    expect(header.readUInt32LE(108)).toEqual(0x00401008);
    expect(header.readUInt32LE(112)).toEqual(0);
  });

  it('halves with a 2x2 box filter', () => {
    // 2x2 checkerboard of 0/100 averages to 50
    const rgb = new Uint8Array([0, 0, 0, 100, 100, 100, 100, 100, 100, 0, 0, 0]);
    expect(Array.from(halveRgb(rgb, 2))).toEqual([50, 50, 50]);
  });

  it('lays out ten mips totalling 174904 bytes for a 512 texture', () => {
    const sizes = mipLevelSizes(512);
    expect(sizes).toEqual([512, 256, 128, 64, 32, 16, 8, 4, 2, 1]);
    expect(sizes.map((size) => dxt1LevelByteSize(size, size))).toEqual(MIP_PAYLOAD_BYTES);

    const dds = rgbToPaintingDds(solidRgb(512, 10, 20, 30), 512);
    expect(dds.length).toEqual(FULL_DDS_BYTES);

    // a solid texture stays solid through every mip level
    const expected = to565(10, 20, 30);
    let offset = 128;
    for (const payloadBytes of MIP_PAYLOAD_BYTES) {
      expect(dds.readUInt16LE(offset)).toEqual(expected);
      expect(dds.readUInt16LE(offset + 2)).toEqual(expected);
      offset += payloadBytes;
    }
    expect(offset).toEqual(FULL_DDS_BYTES);
  });

  it('converts a PNG through sharp into a full painting DDS', async () => {
    const png = await sharp({
      create: { width: 256, height: 256, channels: 3, background: { r: 40, g: 90, b: 160 } },
    })
      .png()
      .toBuffer();

    const dds = await pngToPaintingDds(png);

    expect(dds.length).toEqual(FULL_DDS_BYTES);
    expect(dds.toString('ascii', 0, 4)).toEqual('DDS ');
    expect(dds.readUInt32LE(28)).toEqual(10);
    // resizing a solid image keeps it solid; endpoints decode back to the color
    expect(dds.readUInt16LE(128)).toEqual(dds.readUInt16LE(130));
    const [r, g, b] = from565(dds.readUInt16LE(128));
    expect(Math.abs(r - 40)).toBeLessThanOrEqual(8);
    expect(Math.abs(g - 90)).toBeLessThanOrEqual(8);
    expect(Math.abs(b - 160)).toBeLessThanOrEqual(8);
  });

  it('drops alpha from RGBA sources', async () => {
    const png = await sharp({
      create: { width: 64, height: 64, channels: 4, background: { r: 200, g: 50, b: 25, alpha: 0.5 } },
    })
      .png()
      .toBuffer();

    const dds = await pngToPaintingDds(png);

    expect(dds.length).toEqual(FULL_DDS_BYTES);
    // tolerance covers sharp's premultiplied-resize rounding plus 565 quantization;
    // compositing on black instead of dropping alpha would put red ~100 off
    const [r, g, b] = from565(dds.readUInt16LE(128));
    expect(Math.abs(r - 200)).toBeLessThanOrEqual(16);
    expect(Math.abs(g - 50)).toBeLessThanOrEqual(16);
    expect(Math.abs(b - 25)).toBeLessThanOrEqual(16);
  });
});
