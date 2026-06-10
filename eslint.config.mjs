import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import importX from 'eslint-plugin-import-x';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
// @ts-expect-error there are no types for this and it works fine
import pluginPromise from 'eslint-plugin-promise';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  reactHooks.configs.flat.recommended,
  eslintReact.configs['recommended-type-checked'],
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  importX.flatConfigs.electron,
  pluginPromise.configs['flat/recommended'],
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/*'],
    rules: {
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  globalIgnores([
    'logs',
    '*.log',

    // Runtime data
    'pids',
    '*.pid',
    '*.seed',

    // Coverage directory
    'coverage',
    '.eslintcache',

    // Dependency directory
    'node_modules',

    // OSX
    '.DS_Store',

    // Build artifacts
    'release/app/dist',
    'release/build',
    '.erb/dll',

    // IDE files & debug logs
    '.idea',
    'npm-debug.log.*',

    // Type definition files for CSS modules
    '*.css.d.ts',
    '*.sass.d.ts',
    '*.scss.d.ts',

    // Negation pattern
    '!.erb',
  ]),
]);
