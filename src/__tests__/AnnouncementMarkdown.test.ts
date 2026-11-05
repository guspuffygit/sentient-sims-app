import { describe, expect, it } from 'vitest';
import { parseInlineMarkdown } from 'renderer/components/announcementMarkdown';

describe('parseInlineMarkdown', () => {
  it('leaves plain text alone', () => {
    expect(parseInlineMarkdown('just words')).toEqual([{ type: 'text', content: 'just words' }]);
  });

  it('turns backticks into a code span', () => {
    expect(parseInlineMarkdown('update to `4.6.11` now')).toEqual([
      { type: 'text', content: 'update to ' },
      { type: 'code', content: '4.6.11' },
      { type: 'text', content: ' now' },
    ]);
  });

  it('turns double stars into bold', () => {
    expect(parseInlineMarkdown('**some words** here')).toEqual([
      { type: 'bold', children: [{ type: 'text', content: 'some words' }] },
      { type: 'text', content: ' here' },
    ]);
  });

  it('keeps stars inside a code span literal', () => {
    expect(parseInlineMarkdown('`**not bold**`')).toEqual([{ type: 'code', content: '**not bold**' }]);
  });

  it('parses links and code inside bold', () => {
    expect(parseInlineMarkdown('**get `4.6.11` from [here](https://x.y)**')).toEqual([
      {
        type: 'bold',
        children: [
          { type: 'text', content: 'get ' },
          { type: 'code', content: '4.6.11' },
          { type: 'text', content: ' from ' },
          { type: 'link', children: [{ type: 'text', content: 'here' }], url: 'https://x.y' },
        ],
      },
    ]);
  });

  it('parses bold inside link text', () => {
    expect(parseInlineMarkdown('[**Patreon**](https://patreon.com)')).toEqual([
      {
        type: 'link',
        children: [{ type: 'bold', children: [{ type: 'text', content: 'Patreon' }] }],
        url: 'https://patreon.com',
      },
    ]);
  });

  it('leaves unmatched markers as text', () => {
    expect(parseInlineMarkdown('a ` and ** b')).toEqual([{ type: 'text', content: 'a ` and ** b' }]);
  });
});
