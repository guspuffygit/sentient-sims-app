// Removes, IN PLACE, every path a build tier leaves out, then regenerates the two tier
// index modules for that tier. The app twin of the mod's `ci_compile.py --tier`.
//
// Destructive by design, so it only runs with --yes: in CI on a fresh checkout, or locally
// inside the throwaway worktree scripts/strip-check.sh makes. Never on your working tree.
//
//   node scripts/strip-tree.ts --tier core|stream --yes
import * as fs from 'node:fs';
import * as path from 'node:path';
import { argValue, loadManifest, parseTier, repoRoot, strippedPaths, type Tier } from './tiers.ts';
import { writeIndexes } from './gen-tier-index.ts';

export function stripTree(tier: Tier, root: string = repoRoot): string[] {
  const removed: string[] = [];
  for (const entry of strippedPaths(tier, loadManifest(root))) {
    const target = path.join(root, entry);
    if (!fs.existsSync(target)) {
      // A tree that is itself a stripped tier (the public core tree) has these gone
      // already; Tiers.test.ts is what catches a stale manifest in the loose tree.
      continue;
    }
    fs.rmSync(target, { recursive: true, force: true });
    removed.push(entry);
  }
  writeIndexes(tier, root);
  return removed;
}

function main(argv: string[]) {
  const tier = parseTier(argValue(argv, '--tier'));
  if (tier === 'dev') {
    console.log('--tier dev strips nothing');
    return;
  }
  if (!argv.includes('--yes')) {
    console.error('strip-tree deletes files in place; pass --yes (CI checkout or a throwaway worktree only)');
    process.exit(2);
  }
  const removed = stripTree(tier);
  console.log(`stripped ${removed.length} paths for --tier ${tier}`);
  for (const entry of removed) {
    console.log(`  - ${entry}`);
  }
}

main(process.argv.slice(2));
