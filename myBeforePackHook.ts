import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import lockfile from './release/app/package-lock.json' with { type: 'json' };

// sharp loads its native binding from the @img package matching process.arch at runtime, and npm
// only installs the host arch's optional dependencies. The universal mac target packs the same
// node_modules into both slices, so both arches' @img packages must exist before packing; the
// mac.x64ArchFiles rule then lets @electron/universal ship them single-arch as-is.
const darwinSharpPackages = [
  '@img/sharp-darwin-x64',
  '@img/sharp-darwin-arm64',
  '@img/sharp-libvips-darwin-x64',
  '@img/sharp-libvips-darwin-arm64',
];

const lockPackages = lockfile.packages as Record<string, { version?: string; resolved?: string } | undefined>;

export default function (context: { electronPlatformName: string }) {
  if (context.electronPlatformName !== 'darwin') {
    return;
  }

  for (const packageName of darwinSharpPackages) {
    const destination = path.resolve('release/app/node_modules', packageName);
    if (fs.existsSync(destination)) {
      continue;
    }
    const lockEntry = lockPackages[`node_modules/${packageName}`];
    if (!lockEntry?.resolved) {
      throw new Error(`${packageName} is missing from release/app/package-lock.json`);
    }
    execSync(`mkdir -p "${destination}"`);
    execSync(`curl -fsSL ${lockEntry.resolved} | tar -xz -C "${destination}" --strip-components=1`);
    console.log(`Staged ${packageName}@${lockEntry.version} for the universal mac build`);
  }
}
