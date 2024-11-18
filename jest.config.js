module.exports = {
  // Conditionally enable coverage based on an environment variable
  collectCoverage: process.env.JEST_DISABLE_COVERAGE !== 'true',

  moduleDirectories: ['node_modules', 'release/app/node_modules', 'src'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/.erb/mocks/fileMock.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  setupFiles: ['./.erb/scripts/check-build-exists.ts'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.js'],
  testEnvironment: 'node',
  testEnvironmentOptions: {
    url: 'http://localhost:25198/',
  },
  testPathIgnorePatterns: ['release/app/dist', '.erb/dll'],
  transformIgnorePatterns: [
    'node_modules/(?!(@aws-amplify)/)',
    'node_modules/(?!(@aws-sdk)/)',
    'node_modules/(?!(uuid)/)',
  ],
  transform: {
    '\\.(ts|tsx|js|jsx)$': 'ts-jest',
  },
  collectCoverageFrom: ['./src/**'],
  coveragePathIgnorePatterns: [
    'main.ts',
    'menu.ts',
    'preload.ts',
    'util.ts',
    'LLamaTokenizer.ts',
    'vocab.ts',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
