import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * Tests run through Electron's Node runtime (ELECTRON_RUN_AS_NODE=true electron
 * ./node_modules/.bin/vitest) because the native `better-sqlite3` addon is built
 * against Electron's ABI, not system Node's. The package.json `test*` scripts launch
 * Vitest that way; this config only describes how Vitest itself behaves.
 *
 * `vite-tsconfig-paths` resolves the `main/...` import alias from tsconfig `baseUrl: ./src`,
 * mirroring the alias handling in electron.vite.config.ts.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    // Several integration tests download from S3 / call live AI APIs; the suite mixes
    // network-bound tests (some already used 30s under jest), so use a generous default.
    testTimeout: 30000,
    // Run test files serially in forked Electron child processes. `fileParallelism: false`
    // (Vitest 4's replacement for poolOptions.forks.singleFork) avoids the fixed Express
    // ports (25198/25199) used by Api/OptionsController tests colliding across workers, and
    // keeps native-module loading deterministic.
    pool: 'forks',
    fileParallelism: false,
    // Node environment externalizes node_modules by default; force `electron` external so
    // `require('electron')` hits the runtime stub instead of Vitest trying to transform it.
    server: {
      deps: { external: ['electron'] },
    },
    coverage: {
      provider: 'istanbul',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html', 'lcov'],
      // Scope to source files only — a bare 'src/**' makes istanbul try to parse
      // non-code files (index.html, tokenizer .json) as JS and crash.
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: [
        'src/**/main.ts',
        'src/**/menu.ts',
        'src/**/preload.ts',
        'src/**/*.test.{ts,tsx}',
        'src/__tests__/**',
        '**/LLamaTokenizer.ts',
        '**/vocab.ts',
      ],
    },
  },
});
