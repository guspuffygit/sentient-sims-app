// Deterministic SSLocalWork texture instance ids for AI paintings, derived
// from the painting record's uuid so the mod can always rebuild its loose DDS
// cache from the database (see the mod repo's CUSTOM_PAINTING_TEXTURES.md
// Part 5). The 0x5353 ("SS") prefix keeps ids clear of EA content and CC.

const FNV_OFFSET_BASIS = 0xcbf29ce484222325n;
const FNV_PRIME = 0x100000001b3n;
const UINT64_MASK = 0xffffffffffffffffn;

export const PAINTING_INSTANCE_PREFIX = 0x5353000000000000n;
const INSTANCE_RANDOM_MASK = 0x0000ffffffffffffn;

export function fnv1a64(text: string): bigint {
  let hash = FNV_OFFSET_BASIS;
  for (const byte of Buffer.from(text, 'utf8')) {
    hash = ((hash ^ BigInt(byte)) * FNV_PRIME) & UINT64_MASK;
  }
  return hash;
}

/** uuid (plus collision salt) -> 16-char lowercase hex id in the SS range. */
export function deriveTextureInstanceId(uuid: string, salt: number = 0): string {
  const seed = salt === 0 ? uuid : `${uuid}:${salt}`;
  const instanceId = PAINTING_INSTANCE_PREFIX | (fnv1a64(seed) & INSTANCE_RANDOM_MASK);
  return instanceId.toString(16).padStart(16, '0');
}

/** Lowest salt whose derived id is unused; collisions are astronomically rare. */
export function allocateTextureInstanceId(uuid: string, exists: (instanceId: string) => boolean): string {
  for (let salt = 0; ; salt += 1) {
    const instanceId = deriveTextureInstanceId(uuid, salt);
    if (!exists(instanceId)) {
      return instanceId;
    }
  }
}
