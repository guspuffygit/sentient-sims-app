// Did this pair just have this beat?
//
// On Jaz's 10-29 lean day the cat's petInvestigate_Obsess_Watch_Instrument_Vocal fired six
// times in three minutes while Julian played guitar, and every event became a fresh
// three-round scene on the same beat (31 lines, the same joke twice). On 10-30
// petCat_WaitNearbyOwner_Mixer_Active made 39 scenes in 27 minutes. The mod paces per Sim
// (a 10 s beat gap) and the app drops a stale event; nobody asked whether the
// same Sims had just played the same beat.
//
// This is that question (handoff .claude/HANDOFF-SCENE-REPEATS-2026-10-31.md in the mod
// repo, Scott's guard-only cut). Every INTERACTION event is judged before it takes a queue
// slot: inside `sceneRepeatCooldownSeconds` of the last event for its key it is dropped and
// the clock restarts (a sliding window: a loop stays quiet until it has been silent for the
// whole cooldown); otherwise it runs as today. Key = the sorted participant ids plus the
// interaction name, so the same pair on a DIFFERENT beat is not held. A reaction (the mod
// stamps `reaction: true` on events the game's reaction system fired) keys on the actor
// alone: the app runs it as one silent thought, and this guard makes it one per cooldown.
import log from 'electron-log';
import { InteractionEvent, InteractionEvents, SSEventType } from '../models/InteractionEvents';

export type SceneRepeatGuardDeps = {
  // 0 = the guard is off
  cooldownMs: () => number;
};

export type SceneRepeatVerdict = { kind: 'fresh' } | { kind: 'drop'; sinceMs: number };

export function isReactionEvent(event: InteractionEvent): boolean {
  return (event as { reaction?: unknown }).reaction === true;
}

export function repeatKey(event: InteractionEvent): string | undefined {
  if (!Array.isArray(event.sentient_sims) || event.sentient_sims.length === 0 || !event.interaction_name) {
    return undefined;
  }
  if (isReactionEvent(event)) {
    return `${event.sentient_sims[0].sim_id}|${event.interaction_name}`;
  }
  const ids = event.sentient_sims.map((sim) => sim.sim_id).sort();
  return `${ids.join('+')}|${event.interaction_name}`;
}

export class SceneRepeatGuard {
  private readonly lastSeenAt = new Map<string, number>();

  constructor(private readonly deps: SceneRepeatGuardDeps) {}

  /**
   * Judge an interaction event and record it. `drop` means the same cast had this beat
   * inside the cooldown; the window slides so the next repeat is judged from now.
   */
  admit(event: InteractionEvent, now = Date.now()): SceneRepeatVerdict {
    return this.judge(event, now, true);
  }

  /**
   * The same verdict without recording the event: a PREFETCH is speculative (the mod may
   * never claim it and post the real event through the live route instead), so it must
   * not hold the key; a repeat still costs it no model call.
   */
  peek(event: InteractionEvent, now = Date.now()): SceneRepeatVerdict {
    return this.judge(event, now, false);
  }

  private judge(event: InteractionEvent, now: number, record: boolean): SceneRepeatVerdict {
    const cooldown = this.deps.cooldownMs();
    const key = repeatKey(event);
    if (cooldown <= 0 || key === undefined) {
      return { kind: 'fresh' };
    }
    this.prune(now, cooldown);
    const last = this.lastSeenAt.get(key);
    if (record) {
      this.lastSeenAt.set(key, now);
    }
    const reaction = isReactionEvent(event);
    const names = event.sentient_sims.map((sim) => sim.name);
    if (last !== undefined && now - last < cooldown) {
      const sinceMs = now - last;
      if (reaction) {
        log.info(`[Scene] reaction ${event.interaction_name} by ${names[0]}: suppressed (cooldown)`);
      } else {
        log.info(
          `[Scene] repeat beat ${event.interaction_name} for ${names.join('+')}: dropped (cooldown, last ${Math.round(sinceMs / 1000)}s ago)`,
        );
      }
      return { kind: 'drop', sinceMs };
    }
    if (reaction && record) {
      log.info(`[Scene] reaction ${event.interaction_name} by ${names[0]}: one thought`);
    }
    return { kind: 'fresh' };
  }

  /** The admitted event produced no scene (stale, ignored, unmapped): do not hold the pair. */
  forget(event: InteractionEvent) {
    const key = repeatKey(event);
    if (key !== undefined) {
      this.lastSeenAt.delete(key);
    }
  }

  /** The mod disconnected or the lot changed: nothing from before repeats here. */
  reset() {
    this.lastSeenAt.clear();
  }

  private prune(now: number, cooldown: number) {
    for (const [key, at] of this.lastSeenAt) {
      if (now - at >= cooldown) {
        this.lastSeenAt.delete(key);
      }
    }
  }
}

export type InteractionJudgement = {
  // An INTERACTION event with a cast went through the guard (so a non-scene result should
  // `forget` it); anything else passes untouched
  judged: boolean;
  drop: boolean;
  reaction: boolean;
};

/**
 * The one judgement every route makes before an interaction event takes a queue slot:
 * the live route and a claim record the event (`admit`); a prefetch only peeks.
 */
export function judgeInteraction(
  ctx: { sceneRepeatGuard: SceneRepeatGuard },
  event: InteractionEvents,
  now = Date.now(),
  mode: 'admit' | 'peek' = 'admit',
): InteractionJudgement {
  if (event.event_type !== SSEventType.INTERACTION || !Array.isArray(event.sentient_sims)) {
    return { judged: false, drop: false, reaction: false };
  }
  const interaction = event as InteractionEvent;
  const verdict =
    mode === 'peek' ? ctx.sceneRepeatGuard.peek(interaction, now) : ctx.sceneRepeatGuard.admit(interaction, now);
  return { judged: true, drop: verdict.kind === 'drop', reaction: isReactionEvent(interaction) };
}
