import sharp from 'sharp';
import { dxt1LevelByteSize, encodeDxt1 } from './dxt1';

// Builds the ready-to-write painting texture the game mod drops into its
// SSLocalWork resource mount: a 512x512 DXT1 DDS with a full mip chain, per the
// verified spec in the mod repo's CUSTOM_PAINTING_TEXTURES.md Part 2.

/** Large easel canvas textures are 512x512 with a 10-level mip chain. */
export const PAINTING_TEXTURE_SIZE = 512;

const DDS_HEADER_BYTES = 128;
// DDSD_CAPS | DDSD_HEIGHT | DDSD_WIDTH | DDSD_PIXELFORMAT | DDSD_MIPMAPCOUNT | DDSD_LINEARSIZE
const DDS_FLAGS = 0x000a1007;
const DDPF_FOURCC = 0x00000004;
// DDSCAPS_COMPLEX | DDSCAPS_TEXTURE | DDSCAPS_MIPMAP
const DDS_CAPS = 0x00401008;

export function mipLevelSizes(topSize: number): number[] {
  const sizes: number[] = [];
  for (let size = topSize; size >= 1; size >>= 1) {
    sizes.push(size);
  }
  return sizes;
}

export function buildDxt1DdsHeader(size: number, mipMapCount: number): Buffer {
  const header = Buffer.alloc(DDS_HEADER_BYTES);
  header.write('DDS ', 0, 'ascii');
  header.writeUInt32LE(124, 4);
  header.writeUInt32LE(DDS_FLAGS, 8);
  header.writeUInt32LE(size, 12); // height
  header.writeUInt32LE(size, 16); // width
  header.writeUInt32LE(dxt1LevelByteSize(size, size), 20); // linear size of the top mip
  header.writeUInt32LE(mipMapCount, 28);
  header.writeUInt32LE(32, 76); // pixelformat struct size
  header.writeUInt32LE(DDPF_FOURCC, 80);
  header.write('DXT1', 84, 'ascii');
  header.writeUInt32LE(DDS_CAPS, 108);
  return header;
}

/** 2x2 box-filter downscale of a square RGB image, mirroring the mod's Python mip generator. */
export function halveRgb(src: Uint8Array, size: number): Uint8Array {
  const half = size >> 1;
  const out = new Uint8Array(half * half * 3);
  const stride = size * 3;
  let o = 0;
  for (let y = 0; y < half; y += 1) {
    let i1 = y * 2 * stride;
    let i2 = i1 + stride;
    for (let x = 0; x < half; x += 1) {
      for (let c = 0; c < 3; c += 1) {
        out[o + c] = (src[i1 + c] + src[i1 + 3 + c] + src[i2 + c] + src[i2 + 3 + c] + 2) >> 2;
      }
      o += 3;
      i1 += 6;
      i2 += 6;
    }
  }
  return out;
}

/** Square RGB pixels -> DXT1 DDS with a full mip chain down to 1x1, top mip first. */
export function rgbToPaintingDds(rgb: Uint8Array, size: number): Buffer {
  const parts = [buildDxt1DdsHeader(size, mipLevelSizes(size).length)];
  let level = rgb;
  let levelSize = size;
  parts.push(encodeDxt1(level, levelSize, levelSize));
  while (levelSize > 1) {
    level = halveRgb(level, levelSize);
    levelSize >>= 1;
    parts.push(encodeDxt1(level, levelSize, levelSize));
  }
  return Buffer.concat(parts);
}

/** Drop alpha and expand grayscale; paintings are opaque and DXT1 stores no alpha. */
function toOpaqueRgb(data: Buffer, channels: number): Uint8Array {
  if (channels === 3) {
    return data;
  }
  const texelCount = data.length / channels;
  const rgb = new Uint8Array(texelCount * 3);
  for (let i = 0; i < texelCount; i += 1) {
    const src = i * channels;
    const dst = i * 3;
    rgb[dst] = data[src];
    rgb[dst + 1] = data[channels >= 3 ? src + 1 : src];
    rgb[dst + 2] = data[channels >= 3 ? src + 2 : src];
  }
  return rgb;
}

/** Decode any sharp-supported image, resize to the painting size, and encode the DDS. */
export async function pngToPaintingDds(image: Buffer, size: number = PAINTING_TEXTURE_SIZE): Promise<Buffer> {
  const { data, info } = await sharp(image)
    .resize(size, size, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return rgbToPaintingDds(toOpaqueRgb(data, info.channels), size);
}
