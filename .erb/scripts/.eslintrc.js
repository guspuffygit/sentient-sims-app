module.exports = {
  rules: {
    'no-console': 'off',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
  overrides: [
    {
      files: ['.eslintrc.js'],
      parserOptions: {
        project: null, // Ensures `.eslintrc.js` is not processed as a TypeScript file
      },
    },
  ],
};
