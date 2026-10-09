import * as fs from 'node:fs';
import * as path from 'node:path';

type LockPackage = { os?: string[]; libc?: string[] };

// A Linux binary with no libc field installs next to its twin for the other C library,
// and the AppImage then ships a copy it cannot load.
describe('release lockfile', () => {
  const lockfile = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'release/app/package-lock.json'), 'utf8')) as {
    packages: Record<string, LockPackage>;
  };
  const packages = lockfile.packages;

  it('marks every prebuilt Linux binary with its libc', () => {
    const scopeOf = (name: string) => name.slice(0, name.lastIndexOf('/'));
    const linuxOnly = Object.keys(packages).filter(
      (name) => name.includes('/@') && packages[name].os?.join() === 'linux',
    );
    const scopesWithMusl = new Set(linuxOnly.filter((name) => name.includes('musl')).map(scopeOf));
    const wrong = linuxOnly
      .filter((name) => scopesWithMusl.has(scopeOf(name)))
      .filter((name) => packages[name].libc?.join() !== (name.includes('musl') ? 'musl' : 'glibc'));
    expect(wrong).toEqual([]);
  });
});
