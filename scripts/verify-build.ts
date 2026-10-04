// Checks a built tree (release/app/dist) against a build tier, the app twin of the mod's
// `ci_verify.py --tier`. All three electron-vite builds emit source maps, and a map's
// `sources` list is every file that went into its bundle, so a stripped path showing up
// there means stripped code shipped. The main bundle must also carry the tier stamp.
//
//   node scripts/verify-build.ts --tier core|stream|dev [--dist release/app/dist]
import * as fs from 'node:fs';
import * as path from 'node:path';
import { argValue, isStripped, loadManifest, normalize, parseTier, repoRoot, tierStamp, type Tier } from './tiers.ts';

const TIERS_ALL: Tier[] = ['core', 'stream', 'dev'];

function listMaps(dir: string): string[] {
  const maps: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      maps.push(...listMaps(full));
    } else if (entry.name.endsWith('.map')) {
      maps.push(full);
    }
  }
  return maps;
}

export function verifyBuild(tier: Tier, dist: string, root: string = repoRoot): string[] {
  const problems: string[] = [];
  const manifest = loadManifest(root);
  if (!fs.existsSync(dist)) {
    return [`no build at ${dist}`];
  }
  const maps = listMaps(dist);
  if (maps.length === 0) {
    problems.push(`no source maps under ${dist}; the check needs sourcemap: true in every build`);
  }
  for (const mapFile of maps) {
    const map = JSON.parse(fs.readFileSync(mapFile, 'utf-8')) as { sources?: string[]; sourceRoot?: string };
    const base = path.resolve(path.dirname(mapFile), map.sourceRoot ?? '');
    for (const source of map.sources ?? []) {
      const cleaned = source.replace(/^[a-z]+:\/\//i, '').replace(/\?.*$/, '');
      const relative = normalize(path.relative(root, path.resolve(base, cleaned)));
      if (isStripped(relative, tier, manifest)) {
        problems.push(`${normalize(path.relative(root, mapFile))} bundles stripped ${relative}`);
      }
    }
  }
  const mainBundle = path.join(dist, 'main', 'main.js');
  if (!fs.existsSync(mainBundle)) {
    problems.push(`no main bundle at ${mainBundle}`);
  } else {
    const code = fs.readFileSync(mainBundle, 'utf-8');
    if (!code.includes(tierStamp(tier))) {
      problems.push(`main bundle lacks the stamp ${tierStamp(tier)}`);
    }
    for (const other of TIERS_ALL.filter((t) => t !== tier)) {
      if (code.includes(tierStamp(other))) {
        problems.push(`main bundle carries the ${other} stamp`);
      }
    }
  }
  return problems;
}

function main(argv: string[]) {
  const tier = parseTier(argValue(argv, '--tier'));
  const dist = path.resolve(repoRoot, argValue(argv, '--dist') ?? 'release/app/dist');
  const problems = verifyBuild(tier, dist);
  if (problems.length > 0) {
    console.error(`verify-build --tier ${tier}: ${problems.length} problem(s)`);
    for (const problem of problems) {
      console.error(`  ${problem}`);
    }
    process.exit(1);
  }
  console.log(`verify-build --tier ${tier}: ok`);
}

main(process.argv.slice(2));
