import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    rules: {
      'no-console': 'off',
      'global-require': 'off',
      'import/no-dynamic-require': 'off',
    },
  },
]);
