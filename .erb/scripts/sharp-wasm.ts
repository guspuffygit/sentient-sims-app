import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Electron links the system glib and the prebuilt Linux libvips bundles its own; the
// two collide on glib >= 2.88 (electron/electron#46323), so Linux runs sharp on wasm.

if (process.platform === 'linux') {
  for (const dir of ['.', 'release/app']) {
    const modules = path.join(dir, 'node_modules');
    const sharpPackage = path.join(modules, 'sharp', 'package.json');
    if (!fs.existsSync(sharpPackage)) continue;
    const { version } = JSON.parse(fs.readFileSync(sharpPackage, 'utf8'));
    const wasmPackage = path.join(modules, '@img', 'sharp-wasm32', 'package.json');
    const installed = fs.existsSync(wasmPackage) ? JSON.parse(fs.readFileSync(wasmPackage, 'utf8')).version : null;
    if (installed !== version) {
      execSync(`npm install --no-save --force --ignore-scripts --no-audit --no-fund @img/sharp-wasm32@${version}`, {
        cwd: dir,
        stdio: 'inherit',
      });
    }
    for (const name of fs.readdirSync(path.join(modules, '@img'))) {
      if (/^sharp-(libvips-)?linux/.test(name)) {
        fs.rmSync(path.join(modules, '@img', name), { recursive: true, force: true });
      }
    }
  }
}
