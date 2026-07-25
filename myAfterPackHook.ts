import { execSync } from 'child_process';
import path from 'path';
import { Arch } from 'electron-builder';
import * as nodeAbi from 'node-abi';
import releasePackageJson from './release/app/package.json' with { type: 'json' };
import packageJson from './package.json' with { type: 'json' };

const betterSqlite3Version = packageJson.devDependencies['better-sqlite3'].replace('^', '');
if (betterSqlite3Version !== releasePackageJson.dependencies['better-sqlite3'].replace('^', '')) {
  throw new Error(`better-sqlite3 must match in package.json and release/app/package.json`);
}

const abiVersion = nodeAbi.getAbi(packageJson.devDependencies.electron.replace('^', ''), 'electron');
console.log(`ABI Version is ${abiVersion}`);

const darwinArchNames: { [arch: number]: string } = {
  [Arch.x64]: 'x64',
  [Arch.arm64]: 'arm64',
};

export default function (context: { appOutDir: string; arch: Arch; electronPlatformName: string }) {
  if (context.electronPlatformName !== 'darwin') {
    return;
  }

  // The universal target packs x64 and arm64 separately (this hook runs once per arch, swapping in the
  // matching prebuilt binary), then @electron/universal lipos the two better_sqlite3.node files into a
  // fat binary during the merge — so there is nothing left to do on the universal pass itself.
  const archName = darwinArchNames[context.arch];
  if (!archName) {
    return;
  }

  const url = `https://github.com/WiseLibs/better-sqlite3/releases/download/v${betterSqlite3Version}/better-sqlite3-v${betterSqlite3Version}-electron-v${abiVersion}-darwin-${archName}.tar.gz`;
  const workDir = path.join(path.dirname(context.appOutDir), `.better-sqlite3-${archName}`);
  const nodeFilePath = `${context.appOutDir}/SentientSims.app/Contents/Resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node`;
  execSync(`mkdir -p ${workDir}`);
  execSync(`curl -fsSL ${url} -o ${workDir}/better-sqlite3.tar.gz`);
  execSync(`tar -xzf ${workDir}/better-sqlite3.tar.gz -C ${workDir}`);
  execSync(`cp ${workDir}/build/Release/better_sqlite3.node "${nodeFilePath}"`);
  console.log(`Replaced better_sqlite3.node with darwin-${archName} prebuild`);
}
