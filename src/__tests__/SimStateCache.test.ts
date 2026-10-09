import { describe, expect, it } from 'vitest';
import { SimStateCache } from 'main/sentient-sims/services/SimStateCache';
import { SimStateReport } from 'main/sentient-sims/models/SimStateReport';

function report(seq: number, overrides: Partial<SimStateReport> = {}): SimStateReport {
  return {
    type: 'state_report',
    seq,
    whitelist_version: 'abc123',
    lot: { zone_id: 1, clock: { hour: 9, paused: false } },
    sims: [
      {
        sim_id: '100',
        sims: [],
        objects: [],
        self: { mood: 'Happy', needs: { bladder: 80 } },
        activity: { queue: [], running: null },
      },
    ],
    ...overrides,
  };
}

describe('SimStateCache', () => {
  it('caches the latest report and per-sim entries', () => {
    const cache = new SimStateCache();
    cache.ingest(report(1));
    expect(cache.getReport()?.seq).toBe(1);
    expect(cache.getSim('100')?.self?.mood).toBe('Happy');
    expect(cache.getSimIds()).toEqual(['100']);
    expect(cache.isStale()).toBe(false);
  });

  it('drops late out-of-order reports but accepts newer ones', () => {
    const cache = new SimStateCache();
    cache.ingest(report(5));
    cache.ingest(report(3, { sims: [] }));
    expect(cache.getReport()?.seq).toBe(5);
    cache.ingest(report(6, { sims: [] }));
    expect(cache.getReport()?.seq).toBe(6);
    // Per-sim entries persist across reports that omit them
    expect(cache.getSim('100')).toBeDefined();
  });

  it('reports staleness after three missed windows and pause state', () => {
    const cache = new SimStateCache();
    expect(cache.isStale()).toBe(true);
    const now = Date.now();
    cache.ingest(report(1));
    expect(cache.isStale(now + 5_000)).toBe(false);
    expect(cache.isStale(now + 20_000)).toBe(true);

    cache.ingest(report(2, { paused: true, sims: [] }));
    expect(cache.isPaused()).toBe(true);
  });

  it('notifies listeners on ingest and survives a throwing listener', () => {
    const cache = new SimStateCache();
    const seen: number[] = [];
    cache.onReport(() => {
      throw new Error('bad listener');
    });
    cache.onReport((incoming) => seen.push(incoming.seq));
    cache.ingest(report(1));
    expect(seen).toEqual([1]);
  });

  it('merges request/reply perception snapshots over existing entries', () => {
    const cache = new SimStateCache();
    cache.ingest(report(1));
    cache.ingestPerception({ sim_id: '100', sims: [], objects: [], room_id: 4 });
    const entry = cache.getSim('100');
    expect(entry?.room_id).toBe(4);
    // self status from the state report survives the merge
    expect(entry?.self?.mood).toBe('Happy');
  });

  it('re-flags cached entries from a paused heartbeat carrying the selection', () => {
    const cache = new SimStateCache();
    cache.ingest(
      report(1, {
        sims: [
          { sim_id: '100', sims: [], objects: [], is_active: true },
          { sim_id: '200', sims: [], objects: [] },
        ],
      }),
    );
    // The player pauses and switches sims: the heartbeat has no sims array but
    // names the new selection
    cache.ingest(report(2, { paused: true, sims: undefined, active_sim_id: '200' }));
    expect(cache.getSim('100')?.is_active).toBe(false);
    expect(cache.getSim('200')?.is_active).toBe(true);

    // A selection the cache does not know (mid-swap edge) changes nothing
    cache.ingest(report(3, { paused: true, sims: undefined, active_sim_id: '999' }));
    expect(cache.getSim('200')?.is_active).toBe(true);
  });

  it('reset clears everything', () => {
    const cache = new SimStateCache();
    cache.ingest(report(1));
    cache.reset();
    expect(cache.getReport()).toBeUndefined();
    expect(cache.getSimIds()).toEqual([]);
    expect(cache.isStale()).toBe(true);
  });
});
