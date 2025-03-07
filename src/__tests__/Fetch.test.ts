/* eslint-disable no-console */
import '@testing-library/jest-dom';
import { fetchWithTimeout } from 'main/sentient-sims/util/fetchWithTimeout';
import { fetchWithRetries } from 'main/sentient-sims/util/fetchWithRetries';

describe('Fetch', () => {
  it('fetch with retries', async () => {
    await fetchWithRetries('https://www.google.com');
  });

  it('fetch with timeout', async () => {
    await expect(
      fetchWithTimeout('https://www.google.com', { timeout: 1 }),
    ).rejects.toThrow('The operation was aborted.');

    await fetchWithTimeout('https://www.google.com', {});
  });
});
