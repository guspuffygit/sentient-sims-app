import { describe, expect, it } from 'vitest';
import { RecentThoughts, THOUGHT_ECHO_WINDOW_MS } from 'main/sentient-sims/util/recentThoughts';

describe('thoughts said aloud lately', () => {
  it('knows a thought the same Sim has just said, reworded or not', () => {
    const thoughts = new RecentThoughts(() => 0);
    thoughts.note('1', 'this is exactly what I needed to unwind after a long day of being stuck at that dead-end job.');

    expect(
      thoughts.repeats(
        '1',
        'This is exactly what I needed to unwind after a long day of being stuck in that dead-end job',
      ),
    ).toBe(true);
    expect(thoughts.repeats('1', 'Nobody is home until six.')).toBe(false);
  });

  it('keeps each Sim to their own thoughts', () => {
    const thoughts = new RecentThoughts(() => 0);
    thoughts.note('1', 'Finally some quiet.');

    expect(thoughts.repeats('2', 'Finally some quiet.')).toBe(false);
  });

  it('hands back the newest thoughts, oldest first', () => {
    const thoughts = new RecentThoughts(() => 0);
    ['one', 'two', 'three'].forEach((text) => {
      thoughts.note('1', text);
    });

    expect(thoughts.recent('1', 2)).toEqual(['two', 'three']);
    expect(thoughts.recent('2', 2)).toEqual([]);
  });

  it('lets a thought come back once it is no longer recent', () => {
    let now = 0;
    const thoughts = new RecentThoughts(() => now);
    thoughts.note('1', 'Finally some quiet.');

    now = THOUGHT_ECHO_WINDOW_MS - 1;
    expect(thoughts.repeats('1', 'Finally some quiet.')).toBe(true);
    now = THOUGHT_ECHO_WINDOW_MS + 1;
    expect(thoughts.repeats('1', 'Finally some quiet.')).toBe(false);
  });
});
