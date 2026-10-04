import log from 'electron-log';
import { randomUUID } from 'crypto';
import { DialogueLine } from '../formatter/PromptFormatter';

// A conversation between the player (The Voice, the conscience, the chat window, Twitch
// chat) and a sim, kept as a thread across the player's lines.
//
// Until 2026-09-21 every player line was a fresh scene: the sim saw the last six memory
// rows and nothing else, so a follow-up ("recent experiences how?") landed on a sim with
// no idea what it was following up on, and nothing ever ended — the player just stopped
// typing. This service is the thread: which sims, which speaker, the lines so far, and
// whether the sim has said their piece. It never generates a line on its own (a solo reply
// still waits for the player — the 2026-08-17 wrong-voice bug stays fixed); it gives each
// reply the whole exchange, and it lets the sim close the conversation.

export type ConversationCloseReason = 'landed' | 'idle' | 'stopped' | 'scene_boundary' | 'reset';

export type PlayerConversation = {
  key: string;
  // Rides every round of the thread as the directed scene's id, so a stop from the game
  // (walk-away, left lot) reaches the thread through ScenePlaybackRegistry
  sceneId: string;
  simIds: string[];
  simNames: string[];
  speaker: string;
  lines: DialogueLine[];
  startedAt: number;
  lastActivityAt: number;
  closed: boolean;
  closedReason?: ConversationCloseReason;
};

export type PlayerConversationDeps = {
  // Real milliseconds of silence after which an open thread is forgotten
  idleMs: () => number;
  notifyClosed?: (conversation: PlayerConversation, reason: ConversationCloseReason) => void;
  now?: () => number;
};

// How much of the thread each reply sees. Twitch can run long; the memory rows hold the rest.
export const CONVERSATION_CONTEXT_LINES = 16;
// A new thread opened right after one closed starts with the tail of the old one, so the
// sim is not amnesiac about the conversation they just wrapped up
export const CONVERSATION_SEED_LINES = 4;

export class PlayerConversationService {
  private readonly threads = new Map<string, PlayerConversation>();

  constructor(private readonly deps: PlayerConversationDeps) {}

  static keyFor(simIds: string[], speaker: string): string {
    return `${[...simIds].sort().join(',')}|${speaker}`;
  }

  /**
   * The thread a reply belongs to: the open one for these sims and this speaker, or a new
   * one. A thread that closed within the idle window seeds the new one with its tail.
   */
  begin(params: { simIds: string[]; simNames: string[]; speaker: string }): {
    conversation: PlayerConversation;
    resumed: boolean;
  } {
    this.sweep();
    const key = PlayerConversationService.keyFor(params.simIds, params.speaker);
    const existing = this.threads.get(key);
    const now = this.now();
    if (existing && !existing.closed && now - existing.lastActivityAt < this.deps.idleMs()) {
      existing.lastActivityAt = now;
      return { conversation: existing, resumed: true };
    }
    const seed =
      existing && now - existing.lastActivityAt < this.deps.idleMs()
        ? existing.lines.slice(-CONVERSATION_SEED_LINES)
        : [];
    const created: PlayerConversation = {
      key,
      sceneId: randomUUID(),
      simIds: [...params.simIds],
      simNames: [...params.simNames],
      speaker: params.speaker,
      lines: seed,
      startedAt: now,
      lastActivityAt: now,
      closed: false,
    };
    this.threads.set(key, created);
    log.info(
      `[Conversation] ${params.speaker} -> ${params.simNames.join(' & ')}: new thread ${created.sceneId}` +
        (seed.length > 0 ? ` (seeded with ${seed.length} lines of the last one)` : ''),
    );
    return { conversation: created, resumed: false };
  }

  /** The lines a reply should see as "the conversation so far". */
  contextLines(conversation: PlayerConversation): DialogueLine[] {
    return conversation.lines.slice(-CONVERSATION_CONTEXT_LINES);
  }

  /**
   * A round aired: the player's line and the sim's reply join the thread. `landed` is the
   * scorer's verdict that the beat could end here — the sim has said their piece — which
   * closes the thread; the next player line starts a fresh one seeded with this tail.
   */
  record(key: string, lines: DialogueLine[], verdict: { landed: boolean }) {
    const conversation = this.threads.get(key);
    if (!conversation || conversation.closed) {
      return;
    }
    conversation.lines.push(...lines);
    conversation.lastActivityAt = this.now();
    if (verdict.landed) {
      this.close(conversation, 'landed');
    }
  }

  get(key: string): PlayerConversation | undefined {
    return this.threads.get(key);
  }

  /** A scene the game ended (walk-away, left lot, zone unload) closes its thread. */
  onSceneStopped(sceneId: string) {
    this.threads.forEach((conversation) => {
      if (conversation.sceneId === sceneId && !conversation.closed) {
        this.close(conversation, 'stopped');
      }
    });
  }

  /** The location changed, or the save was unloaded: no thread survives it. */
  closeAll(reason: ConversationCloseReason) {
    this.threads.forEach((conversation) => {
      if (!conversation.closed) {
        this.close(conversation, reason);
      }
    });
    if (reason === 'reset') {
      this.threads.clear();
    }
  }

  /** Test seam. */
  get size() {
    return this.threads.size;
  }

  private close(conversation: PlayerConversation, reason: ConversationCloseReason) {
    conversation.closed = true;
    conversation.closedReason = reason;
    // A thread the sim just wrapped up seeds the next one; a thread that went quiet for
    // the whole idle window is simply forgotten (its timestamp stays old, so it neither
    // seeds nor lingers)
    if (reason === 'landed') {
      conversation.lastActivityAt = this.now();
    }
    log.info(`[Conversation] ${conversation.speaker} -> ${conversation.simNames.join(' & ')}: closed (${reason})`);
    // A stop or a boundary is not the sim's doing — nothing to announce in the chat window
    if (reason === 'landed' || reason === 'idle') {
      try {
        this.deps.notifyClosed?.(conversation, reason);
      } catch (error) {
        log.warn('[Conversation] failed to announce the closed thread', error);
      }
    }
  }

  private sweep() {
    const now = this.now();
    const idle = this.deps.idleMs();
    this.threads.forEach((conversation, key) => {
      if (!conversation.closed && now - conversation.lastActivityAt >= idle) {
        this.close(conversation, 'idle');
      }
      // A closed thread outlives the window only long enough to seed its successor
      if (conversation.closed && now - conversation.lastActivityAt >= idle) {
        this.threads.delete(key);
      }
    });
  }

  private now(): number {
    return this.deps.now ? this.deps.now() : Date.now();
  }
}
