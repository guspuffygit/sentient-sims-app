import { describe, expect, it } from 'vitest';
import { crashReportDescription } from 'renderer/components/AppErrorBoundary';

describe('crashReportDescription', () => {
  it('leads with the crash message and keeps the player text, stack, and component stack', () => {
    const error = new Error('Minified React error #185');
    error.stack = 'Error: Minified React error #185\n    at render (index.js:1:1)';

    const description = crashReportDescription('  opened the Sims page  ', error, '\n    at Sims\n    at App');

    expect(description).toBe(
      [
        'Renderer crash: Minified React error #185',
        'opened the Sims page',
        error.stack,
        '\n    at Sims\n    at App',
      ].join('\n\n'),
    );
  });

  it('drops empty parts when there is no stack or player text', () => {
    const error = new Error('boom');
    error.stack = undefined;

    expect(crashReportDescription('', error)).toBe('Renderer crash: boom');
  });
});
