import { defineConfig, globalIgnores } from 'eslint/config';
import pluginJest from 'eslint-plugin-jest';
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
// @ts-expect-error there are no types for this and it works fine
import pluginPromise from 'eslint-plugin-promise';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  eslint.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.test.ts'],
    plugins: { jest: pluginJest },
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...jsxA11y.flatConfigs.recommended,
    languageOptions: {
      ...jsxA11y.flatConfigs.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  pluginPromise.configs['flat/recommended'],
  // {
  //   extends: ['erb'],
  //   // plugins: { tseslint },
  //   rules: {
  //     // A temporary hack related to IDE not resolving correct package.json
  //     'import/no-extraneous-dependencies': 'off',
  //     'react/react-in-jsx-scope': 'off',
  //     'react/jsx-filename-extension': 'off',
  //     'import/extensions': 'off',
  //     'import/no-unresolved': 'off',
  //     'import/no-import-module-exports': 'off',
  //     'no-shadow': 'off',
  //     '@typescript-eslint/no-shadow': 'error',
  //     'no-unused-vars': 'off',
  //     '@typescript-eslint/no-unused-vars': 'error',
  //     'jest/expect-expect': 'off',
  //   },
  //   settings: {
  //     'import/resolver': {
  //       // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
  //       node: {},
  //       webpack: {
  //         config: eslintConfig,
  //       },
  //       typescript: {},
  //     },
  //     'import/parsers': {
  //       '@typescript-eslint/parser': ['.ts', '.tsx'],
  //     },
  //   },
  // },
  {
    files: ['**/*'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': 'off',
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
      'import/no-import-module-exports': 'off',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'jest/expect-expect': 'off',
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
