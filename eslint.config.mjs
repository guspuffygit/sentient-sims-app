import { defineConfig, globalIgnores } from 'eslint/config';
import { configs as tseslintConfigs } from 'typescript-eslint';
import eslint from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import { flatConfigs as importXFlatConfigs } from 'eslint-plugin-import-x';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
// @ts-expect-error there are no types for this and it works fine
import pluginPromise from 'eslint-plugin-promise';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  eslint.configs.recommended,
  tseslintConfigs.strictTypeChecked,
  reactHooks.configs.flat.recommended,
  eslintReact.configs['recommended-type-checked'],
  importXFlatConfigs.recommended,
  importXFlatConfigs.typescript,
  importXFlatConfigs.electron,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true, allowNullish: true },
      ],
    },
  },
  {
    // Standalone maintenance scripts run under Electron's Node (ELECTRON_RUN_AS_NODE) and
    // sit outside the app's tsconfig project, so the type-aware rules see nothing but
    // `any`. They are CommonJS with Node globals, not browser code.
    files: ['scripts/**/*.cjs'],
    extends: [tseslintConfigs.disableTypeChecked, eslintReact.configs['disable-type-checked']],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
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
