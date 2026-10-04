import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  classify,
  entryCovers,
  isStripped,
  keptLayers,
  loadManifest,
  repoRoot,
  strippedPaths,
  tierStamp,
  type Manifest,
} from '../../scripts/tiers.ts';
import { MAIN_INDEX, RENDERER_INDEX, renderMainIndex, renderRendererIndex } from '../../scripts/gen-tier-index.ts';
import { TIER, TIER_REGISTRATIONS, TIER_STAMP } from '../main/sentient-sims/tiers';

// Release 4.5 build tiers, the app side of the mod's tiers.py / test_tier_boundary.py.
describe('build tiers', () => {
  const manifest = loadManifest();

  // Tier-aware so the same suite runs in a stripped tree (scripts/strip-check.sh): there
  // the stripped paths are gone and the index was regenerated. A non-dev index committed by
  // mistake fails here in the loose tree, where the paths it claims are stripped still exist.
  it('names only paths that exist, except the ones this build stripped', () => {
    const wrong = [...manifest.stream, ...manifest.autonomy, ...manifest.dev].filter(
      (entry) => fs.existsSync(path.join(repoRoot, entry)) === isStripped(entry, TIER, manifest),
    );
    expect(wrong).toEqual([]);
  });

  it('puts every path in exactly one tier', () => {
    const all = [...manifest.stream, ...manifest.autonomy, ...manifest.dev];
    expect(new Set(all).size).toBe(all.length);
  });

  it('only strips source and tests, never config or the tier seams', () => {
    const all = [...manifest.stream, ...manifest.autonomy, ...manifest.dev];
    expect(all.filter((entry) => !entry.startsWith('src/'))).toEqual([]);
    const seams = ['src/main/sentient-sims/tiers/types.ts', 'src/main/sentient-sims/tiers/ipc.ts'];
    expect(seams.filter((seam) => classify(seam, manifest) !== 'core')).toEqual([]);
  });

  it('has both generated indexes exactly as the generator writes them', () => {
    expect(fs.readFileSync(path.join(repoRoot, MAIN_INDEX), 'utf-8')).toBe(renderMainIndex(TIER));
    expect(fs.readFileSync(path.join(repoRoot, RENDERER_INDEX), 'utf-8')).toBe(renderRendererIndex(TIER));
  });

  it('registers the kept layers in order, stream first', () => {
    expect(TIER_STAMP).toBe(tierStamp(TIER));
    expect(TIER_REGISTRATIONS.map((t) => t.name)).toEqual(keptLayers(TIER));
    expect(keptLayers('dev')).toEqual(['stream', 'autonomy', 'dev']);
  });

  it('generates a core index that names no tier module', () => {
    const core = renderMainIndex('core');
    expect(core).not.toMatch(/from '\.\/(stream|autonomy|dev)'/);
    expect(core).toContain("TIER_STAMP = 'sentient-sims-tier:core'");
    expect(renderRendererIndex('core')).not.toMatch(/from '\.\/(stream|autonomy|dev)'/);
    expect(renderMainIndex('stream')).toMatch(/from '\.\/autonomy'/);
    expect(renderMainIndex('stream')).not.toMatch(/from '\.\/dev'/);
    expect(keptLayers('stream')).toEqual(['stream', 'autonomy']);
  });

  it('classifies files and directories', () => {
    const synthetic: Manifest = {
      stream: ['src/main/a/Twitch.ts'],
      autonomy: ['src/main/cognition/'],
      dev: ['src/main/bench/'],
    };
    expect(classify('src/main/a/Twitch.ts', synthetic)).toBe('stream');
    expect(classify('src\\main\\a\\Twitch.ts', synthetic)).toBe('stream');
    expect(classify('src/main/cognition/deep/x.ts', synthetic)).toBe('autonomy');
    expect(classify('src/main/cognitionX.ts', synthetic)).toBe('core');
    expect(entryCovers('src/main/bench/', 'src/main/bench/tier0.ts')).toBe(true);
    expect(isStripped('src/main/bench/tier0.ts', 'stream', synthetic)).toBe(true);
    expect(isStripped('src/main/cognition/x.ts', 'stream', synthetic)).toBe(false);
    expect(isStripped('src/main/cognition/x.ts', 'core', synthetic)).toBe(true);
    expect(isStripped('src/main/cognition/x.ts', 'dev', synthetic)).toBe(false);
    expect(strippedPaths('stream', synthetic)).toEqual(['src/main/bench/']);
  });

  it('keeps the manifest out of the bundles', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(full);
        } else if (
          /\.(ts|tsx)$/.test(entry.name) &&
          /from ['"][^'"]*(tiers\.json|scripts\/tiers)/.test(fs.readFileSync(full, 'utf-8'))
        ) {
          offenders.push(path.relative(repoRoot, full));
        }
      }
    };
    walk(path.join(repoRoot, 'src'));
    expect(offenders).toEqual([]);
  });
});
