import { disableDebugLogging, enableDebugLogging } from 'main/sentient-sims/util/debugLog';
import { describe, test } from 'vitest';

describe('Logging', () => {
  test('disableDebugLogging', () => {
    disableDebugLogging();
  });
  test('enableDebugLogging', () => {
    enableDebugLogging();
  });
});
