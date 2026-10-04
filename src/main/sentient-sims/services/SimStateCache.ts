import log from 'electron-log';
import { SimStateEntry, SimStateReport } from '../models/SimStateReport';
import { PerceptionSnapshot } from '../models/PerceptionSnapshot';

// Report cadence on the mod side is 5s; past 3 missed windows the stream is stale —
// which in practice means the game is zone-loading, paused-and-heartbeating (allowed),
// or the mod's drain alarm died (the P0-2 failure mode this staleness makes visible).
const STALE_AFTER_MS = 15_000;

export type StateListener = (report: SimStateReport) => void;

// The app-side terminus of the Block 8 state channel: latest report + per-sim entries,
// with staleness detection. Supersedes CognitionController's ephemeral perception Map —
// request/reply perception snapshots land here too so every consumer reads one cache.
export class SimStateCache {
  private latestReport?: SimStateReport;

  private receivedAt = 0;

  private lastSeq = 0;

  private readonly simEntries = new Map<string, SimStateEntry>();

  private readonly listeners: StateListener[] = [];

  onReport(listener: StateListener) {
    this.listeners.push(listener);
  }

  ingest(report: SimStateReport) {
    // Supplements and out-of-order posts arrive on daemon threads mod-side; a lower
    // seq than the last full report is late traffic, not time travel
    if (report.seq && report.seq < this.lastSeq && !report.paused) {
      log.debug(`[SimStateCache] dropping stale report seq=${report.seq} < ${this.lastSeq}`);
      return;
    }
    this.lastSeq = Math.max(this.lastSeq, report.seq ?? 0);
    this.latestReport = report;
    this.receivedAt = Date.now();
    (report.sims ?? []).forEach((entry) => {
      if (entry.sim_id) {
        this.simEntries.set(entry.sim_id, entry);
      }
    });
    // Sim switching works while paused, so heartbeats carry the selection while the
    // per-sim is_active flags only refresh with a full report — re-flag the cached
    // entries so voice commands and unnamed chat asks follow the player immediately.
    // Only when the selected sim is a cached (reported) sim: a mid-swap or off-lot id
    // must not strip "active" from everyone and send fallbacks to an arbitrary sim.
    const activeId = report.active_sim_id;
    if (activeId && this.simEntries.has(activeId)) {
      this.simEntries.forEach((entry, simId) => {
        const isActive = simId === activeId;
        if (Boolean(entry.is_active) !== isActive) {
          this.simEntries.set(simId, { ...entry, is_active: isActive });
        }
      });
    }
    this.listeners.forEach((listener) => {
      try {
        listener(report);
      } catch (err) {
        log.error('[SimStateCache] state listener failed', err);
      }
    });
  }

  // Legacy request/reply perception snapshots (dev seam) share the cache: merged over
  // the sim's existing entry so self/activity from the last report survive.
  ingestPerception(snapshot: PerceptionSnapshot) {
    if (!snapshot.sim_id) {
      return;
    }
    const existing = this.simEntries.get(snapshot.sim_id);
    this.simEntries.set(snapshot.sim_id, { ...existing, ...snapshot });
  }

  getReport(): SimStateReport | undefined {
    return this.latestReport;
  }

  getSim(simId: string): SimStateEntry | undefined {
    return this.simEntries.get(simId);
  }

  getSimIds(): string[] {
    return [...this.simEntries.keys()];
  }

  isPaused(): boolean {
    return Boolean(this.latestReport?.paused || this.latestReport?.lot?.clock?.paused);
  }

  isStale(now = Date.now()): boolean {
    return this.receivedAt === 0 || now - this.receivedAt > STALE_AFTER_MS;
  }

  reset() {
    this.latestReport = undefined;
    this.receivedAt = 0;
    this.lastSeq = 0;
    this.simEntries.clear();
  }
}
