// Build tiers (release 4.5): which paths each player build leaves out.
//
// The manifest is tiers.json at the repo root. This module is the only reader; src/ never
// imports the manifest (vite would inline every stripped name into the bundle) and gets the
// tier from the GENERATED src/main/sentient-sims/tiers/index.ts instead (gen-tier-index.ts).
// Erasable TypeScript only: Node runs this file directly (`node scripts/x.ts`, Node 24; on
// Node 22 add --experimental-strip-types), and vitest imports it for Tiers.test.ts.
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

export type Tier = 'core' | 'stream' | 'dev';
export type Layer = 'stream' | 'autonomy' | 'dev';
export type Manifest = Record<Layer, string[]>;

export const LAYERS: Layer[] = ['stream', 'autonomy', 'dev'];

// What each build strips. core = the public release; stream = our fork's build; dev = the
// loose tree, nothing stripped.
export const TIERS: Record<Tier, Layer[]> = {
  core: ['stream', 'autonomy', 'dev'],
  stream: ['dev'],
  dev: [],
};

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function parseTier(value: string | undefined): Tier {
  if (value === 'core' || value === 'stream' || value === 'dev') {
    return value;
  }
  throw new Error(`unknown tier '${String(value)}' (core|stream|dev)`);
}

export function normalize(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

export function loadManifest(root: string = repoRoot): Manifest {
  const raw = JSON.parse(fs.readFileSync(path.join(root, 'tiers.json'), 'utf-8')) as Record<string, unknown>;
  const manifest = {} as Manifest;
  for (const layer of LAYERS) {
    const entries = raw[layer];
    if (!Array.isArray(entries) || !entries.every((e) => typeof e === 'string')) {
      throw new Error(`tiers.json: '${layer}' must be a list of paths`);
    }
    manifest[layer] = entries.map(normalize);
  }
  return manifest;
}

// A manifest entry ending in '/' covers everything under it; otherwise it is one file.
export function entryCovers(entry: string, p: string): boolean {
  const target = normalize(p);
  return entry.endsWith('/') ? target.startsWith(entry) : target === entry;
}

export function classify(p: string, manifest: Manifest = loadManifest()): Layer | 'core' {
  for (const layer of LAYERS) {
    if (manifest[layer].some((entry) => entryCovers(entry, p))) {
      return layer;
    }
  }
  return 'core';
}

export function isStripped(p: string, tier: Tier, manifest: Manifest = loadManifest()): boolean {
  const layer = classify(p, manifest);
  return layer !== 'core' && TIERS[tier].includes(layer);
}

// The manifest entries a build removes, in manifest order.
export function strippedPaths(tier: Tier, manifest: Manifest = loadManifest()): string[] {
  return TIERS[tier].flatMap((layer) => manifest[layer]);
}

// The layers a build keeps, in registration order (stream, autonomy, dev).
export function keptLayers(tier: Tier): Layer[] {
  return LAYERS.filter((layer) => !TIERS[tier].includes(layer));
}

export function tierStamp(tier: Tier): string {
  return `sentient-sims-tier:${tier}`;
}

export function argValue(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return argv[index + 1];
}
