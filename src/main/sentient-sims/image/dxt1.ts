// Minimal self-contained DXT1 (BC1) block encoder for opaque textures.
// Each 4x4 texel block becomes 8 bytes: two RGB565 endpoint colors followed by
// sixteen 2-bit palette indices. Endpoints are written color0 > color1 so
// decoders stay in the opaque 4-color mode (no 1-bit punch-through alpha).

const BLOCK_BYTES = 8;
const BLOCK_TEXELS = 16;

export function to565(r: number, g: number, b: number): number {
  return ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3);
}

export function from565(color: number): [number, number, number] {
  const r = (color >> 11) & 0x1f;
  const g = (color >> 5) & 0x3f;
  const b = color & 0x1f;
  return [(r << 3) | (r >> 2), (g << 2) | (g >> 4), (b << 3) | (b >> 2)];
}

export function dxt1LevelByteSize(width: number, height: number): number {
  return Math.ceil(width / 4) * Math.ceil(height / 4) * BLOCK_BYTES;
}

function buildPalette(color0: number, color1: number): number[] {
  const [r0, g0, b0] = from565(color0);
  const [r1, g1, b1] = from565(color1);
  // color0 > color1 selects 4-color mode: two interpolants at 1/3 and 2/3
  return [
    r0,
    g0,
    b0,
    r1,
    g1,
    b1,
    Math.round((2 * r0 + r1) / 3),
    Math.round((2 * g0 + g1) / 3),
    Math.round((2 * b0 + b1) / 3),
    Math.round((r0 + 2 * r1) / 3),
    Math.round((g0 + 2 * g1) / 3),
    Math.round((b0 + 2 * b1) / 3),
  ];
}

function nearestPaletteIndex(palette: number[], r: number, g: number, b: number): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 4; i += 1) {
    const dr = palette[i * 3] - r;
    const dg = palette[i * 3 + 1] - g;
    const db = palette[i * 3 + 2] - b;
    const distance = dr * dr + dg * dg + db * db;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best;
}

function writeBlock(texels: Uint8Array, out: Buffer, offset: number): number {
  // endpoints: the block's extreme texels along a luminance axis
  let minLuma = Number.POSITIVE_INFINITY;
  let maxLuma = Number.NEGATIVE_INFINITY;
  let minTexel = 0;
  let maxTexel = 0;
  for (let i = 0; i < BLOCK_TEXELS; i += 1) {
    const luma = 2 * texels[i * 3] + 4 * texels[i * 3 + 1] + texels[i * 3 + 2];
    if (luma < minLuma) {
      minLuma = luma;
      minTexel = i;
    }
    if (luma > maxLuma) {
      maxLuma = luma;
      maxTexel = i;
    }
  }
  let color0 = to565(texels[maxTexel * 3], texels[maxTexel * 3 + 1], texels[maxTexel * 3 + 2]);
  let color1 = to565(texels[minTexel * 3], texels[minTexel * 3 + 1], texels[minTexel * 3 + 2]);
  if (color0 < color1) {
    [color0, color1] = [color1, color0];
  }
  out.writeUInt16LE(color0, offset);
  out.writeUInt16LE(color1, offset + 2);
  if (color0 === color1) {
    // solid block: index 0 always decodes to color0, and never emitting index 3
    // keeps the equal-endpoint 3-color mode's transparent entry unreachable
    out.writeUInt32LE(0, offset + 4);
    return offset + BLOCK_BYTES;
  }
  const palette = buildPalette(color0, color1);
  let indices = 0;
  for (let i = 0; i < BLOCK_TEXELS; i += 1) {
    indices |= nearestPaletteIndex(palette, texels[i * 3], texels[i * 3 + 1], texels[i * 3 + 2]) << (i * 2);
  }
  out.writeUInt32LE(indices >>> 0, offset + 4);
  return offset + BLOCK_BYTES;
}

/** Encode tightly packed 8-bit RGB pixels (3 bytes per texel) as DXT1 block data. */
export function encodeDxt1(rgb: Uint8Array, width: number, height: number): Buffer {
  if (rgb.length !== width * height * 3) {
    throw new Error(`encodeDxt1: expected ${width * height * 3} RGB bytes for ${width}x${height}, got ${rgb.length}`);
  }
  const blocksX = Math.ceil(width / 4);
  const blocksY = Math.ceil(height / 4);
  const out = Buffer.alloc(blocksX * blocksY * BLOCK_BYTES);
  const texels = new Uint8Array(BLOCK_TEXELS * 3);
  let offset = 0;
  for (let by = 0; by < blocksY; by += 1) {
    for (let bx = 0; bx < blocksX; bx += 1) {
      for (let ty = 0; ty < 4; ty += 1) {
        // clamping to the edge replicates texels for levels smaller than 4x4 (1x1, 2x2)
        const y = Math.min(by * 4 + ty, height - 1);
        for (let tx = 0; tx < 4; tx += 1) {
          const x = Math.min(bx * 4 + tx, width - 1);
          const src = (y * width + x) * 3;
          const dst = (ty * 4 + tx) * 3;
          texels[dst] = rgb[src];
          texels[dst + 1] = rgb[src + 1];
          texels[dst + 2] = rgb[src + 2];
        }
      }
      offset = writeBlock(texels, out, offset);
    }
  }
  return out;
}
