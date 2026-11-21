import { NEAR_DUP_JACCARD, trigramJaccard } from './memoryHygiene';

// How long a thought said aloud still counts as just said
export const THOUGHT_ECHO_WINDOW_MS = 5 * 60 * 1000;

// The thoughts each Sim has said aloud lately. The memory store already drops a thought it was
// handed twice (near-duplicate, memoryHygiene); this is the same test for the voice, which a
// repeated thought otherwise reaches: a solo act's walk-up and its first animation ask for a
// thought a second apart and can get the same sentence back.
export class RecentThoughts {
  private readonly bySim = new Map<string, { text: string; at: number }[]>();

  private readonly now: () => number;

  constructor(now: () => number = Date.now) {
    this.now = now;
  }

  private live(simId: string): { text: string; at: number }[] {
    const cutoff = this.now() - THOUGHT_ECHO_WINDOW_MS;
    const kept = (this.bySim.get(simId) ?? []).filter((thought) => thought.at >= cutoff);
    this.bySim.set(simId, kept);
    return kept;
  }

  repeats(simId: string, text: string): boolean {
    return this.live(simId).some((thought) => trigramJaccard(thought.text, text) >= NEAR_DUP_JACCARD);
  }

  // The newest `limit` thoughts, oldest first
  recent(simId: string, limit: number): string[] {
    return this.live(simId)
      .slice(-limit)
      .map((thought) => thought.text);
  }

  note(simId: string, text: string): void {
    this.live(simId).push({ text, at: this.now() });
  }
}
