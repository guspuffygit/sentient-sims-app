import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { builtinModules } from 'node:module';
import appPackage from './release/app/package.json';

/**
 * Mirror the previous webpack setup (.erb/configs/webpack.config.base.ts): only
 * the native modules installed into release/app/node_modules are externalized;
 * everything else is bundled into the main/preload output. electron-builder
 * ships only release/app/node_modules in production, so non-native deps must be
 * bundled rather than externalized.
 *
 * Vite's SSR build (which electron-vite uses for main/preload) externalizes every
 * node_modules dependency by default — the opposite of what we need. `ssr.noExternal:
 * true` disables that so all deps are bundled, then this hard `external` list forces
 * back out the handful that genuinely must be required at runtime.
 */
const nativeExternals = Object.keys(appPackage.dependencies || {});
// `ws` pulls these optional native addons via try/catch require(); keep them
// external so the runtime require runs (ws falls back to JS if they're absent),
// instead of Rollup failing to resolve them at build time.
const optionalNativeExternals = ['bufferutil', 'utf-8-validate'];
const nodeExternals = [...builtinModules, ...builtinModules.map((m) => `node:${m}`)];
const external = ['electron', ...nativeExternals, ...optionalNativeExternals, ...nodeExternals];

export default defineConfig({
  main: {
    plugins: [tsconfigPaths()],
    build: {
      // electron-vite externalizes every package.json dependency by default
      // (build.externalizeDeps ?? true). Disable it so all deps are bundled and
      // only the explicit `external` list (native modules, electron, builtins)
      // is required at runtime — matching the old webpack packaging contract.
      externalizeDeps: false,
      outDir: 'release/app/dist/main',
      sourcemap: true,
      lib: {
        entry: 'src/main/main.ts',
        formats: ['cjs'],
      },
      rollupOptions: {
        external,
        output: {
          entryFileNames: 'main.js',
        },
      },
    },
  },
  preload: {
    plugins: [tsconfigPaths()],
    build: {
      externalizeDeps: false,
      outDir: 'release/app/dist/preload',
      sourcemap: true,
      lib: {
        entry: 'src/main/preload.ts',
        formats: ['cjs'],
      },
      rollupOptions: {
        external,
        output: {
          entryFileNames: 'preload.js',
        },
      },
    },
  },
  renderer: {
    root: 'src/renderer',
    plugins: [react(), tsconfigPaths()],
    build: {
      outDir: 'release/app/dist/renderer',
      sourcemap: true,
    },
  },
});
