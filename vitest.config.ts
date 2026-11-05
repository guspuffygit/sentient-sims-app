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
    // Test files run in parallel forked Electron child processes. Each worker binds its
    // Express servers in its own port block (testPort in src/__tests__/util.tsx).
    pool: 'forks',
    // Node environment externalizes node_modules by default; force `electron` external so
    // `require('electron')` hits the runtime stub instead of Vitest trying to transform it.
    server: {
      deps: { external: ['electron'] },
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html', 'lcov'],
      // Scope to source files only. A bare 'src/**' makes the provider parse
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
