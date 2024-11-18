import {
  disableDebugLogging,
  enableDebugLogging,
} from 'main/sentient-sims/util/debugLog';

describe('Logging', () => {
  it('disableDebugLogging', () => {
    disableDebugLogging();
  });
  it('enableDebugLogging', () => {
    enableDebugLogging();
  });
});
