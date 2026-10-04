import { describe, expect, it } from 'vitest';
import { recencyScore, scoreCandidate } from 'main/sentient-sims/services/MemoryRetrievalService';
import { MemoryWithIndex } from 'main/sentient-sims/db/entities/MemoryIndexEntity';

// H3: retrieval measures time the way the sim does. Core (release 4.5): moved out of
// FactsInPrompts.test.ts, whose tick-prompt half is autonomy.
describe('game-day recency', () => {
  const now = new Date('2026-09-03T12:00:00Z');

  it('measures in game days when both ends are known', () => {
    // Same real timestamp, three game days apart: the older one must score lower
    const fresh = recencyScore('2026-09-03 11:00:00', now, 78, 78);
    const stale = recencyScore('2026-09-03 11:00:00', now, 75, 78);
    expect(fresh).toBeCloseTo(1, 5);
    expect(stale).toBeLessThan(fresh);
    // Half-life of about three game days
    expect(stale).toBeCloseTo(0.5, 1);
  });

  it('falls back to real time when the memory has no game day', () => {
    const withoutDay = recencyScore('2026-09-03 11:00:00', now, undefined, 78);
    const realTime = recencyScore('2026-09-03 11:00:00', now);
    expect(withoutDay).toBe(realTime);
  });

  it('falls back to real time when today is unknown', () => {
    // The scenario tester and the main menu have no state report
    expect(recencyScore('2026-09-03 11:00:00', now, 78, undefined)).toBe(recencyScore('2026-09-03 11:00:00', now));
  });

  it('clamps a memory from the future rather than scoring above 1', () => {
    // A save reloaded to an earlier day puts existing rows in the future
    expect(recencyScore('2026-09-03 11:00:00', now, 90, 78)).toBe(1);
  });

  it('beats real time in the score, so a sim week feels like a week', () => {
    // Both rows were written minutes ago in real time; only the game clock separates them
    const base = { id: '1', timestamp: '2026-09-03 11:59:00', event_type: 'observation' };
    const today = { ...base, game_day: 78 } as unknown as MemoryWithIndex;
    const lastWeek = { ...base, id: '2', game_day: 71 } as unknown as MemoryWithIndex;
    const scoredToday = scoreCandidate(today, undefined, undefined, now, 78);
    const scoredLastWeek = scoreCandidate(lastWeek, undefined, undefined, now, 78);
    expect(scoredToday.recency).toBeGreaterThan(scoredLastWeek.recency);
    expect(scoredToday.score).toBeGreaterThan(scoredLastWeek.score);
  });
});
