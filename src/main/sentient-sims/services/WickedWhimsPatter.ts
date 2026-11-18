import log from 'electron-log';
import { DialogueLine } from '../formatter/PromptFormatter';
import { WWEventType, WWInteractionEvent } from '../models/InteractionEvents';
import { ClockState } from '../models/ModLogWebsocketMessage';
import { SimStateReport } from '../models/SimStateReport';
import { clockRate } from '../util/clockRate';
import type { SceneClosed } from './ScenePlaybackRegistry';

// WickedWhims sends one event per animation and the app runs one dialogue round per event, so
// an act went silent for a minute or two at a time (61-124 s between animation changes in one
// act we timed). While one animation runs, this service pokes one more round, one Sim at a
// time, every `intervalMs` of quiet:
//   - the scene of the act's current animation is HELD open in the playback registry, so it
//     does not finish when its round has played, and the pokes join its lines and memory row;
//   - the countdown starts when the scene goes idle (its last line played), so a long line
//     never stacks a poke behind it;
//   - it follows the game clock: shorter at speed 2/3, held at ultra speed and while the
//     PLAYER has paused (a mod pause never holds it, as it never holds the audio);
//   - a new animation releases the old scene and starts over; the act's end (the mod's
//     `ended` event, a stopped report fallback, a 15-minute cap) releases it for good.

// No act runs this long without a single animation change
export const WW_PATTER_MAX_MS = 15 * 60_000;
// The game is waiting on an interaction: the poke steps aside and asks again this soon
export const WW_PATTER_RETRY_MS = 5_000;
// At most this many pokes on one animation, then quiet until the next one: past 8 the lines
// decayed in every wording tested (repeats 2% on pokes 1-8, 35-43% on pokes 9-12)
export const WW_PATTER_MAX_POKES_PER_ANIMATION = 8;
// The state-report fallback: no WW event for this long and the cast out of the act twice
export const WW_PATTER_FALLBACK_QUIET_MS = 60_000;
export const WW_PATTER_FALLBACK_REPORTS = 2;
// An ended act's key refuses a late round this long (a round still generating at the end)
const ENDED_TTL_MS = 10 * 60_000;

// What a WW round hands the patter once its lines are with the renderer (AIService.play)
export type PatterRound = {
  event: WWInteractionEvent;
  sceneId: string;
  round: number;
  // Every line of this scene so far, in order
  lines: DialogueLine[];
  // The performers who can speak, in the event's order: who takes the pokes
  speakerIds: string[];
  // Runs the next round for one Sim; the signal fires when the act moves on or ends
  poke: (speakerId: string, signal: AbortSignal) => Promise<void>;
};

export type WickedWhimsPatterDeps = {
  enabled: () => boolean;
  intervalMs: () => number;
  // An interaction the game is blocked on is queued: no poke now
  isGameWaiting: () => boolean;
  hold: (sceneId: string) => boolean;
  release: (sceneId: string) => void;
  now?: () => number;
  setTimeout?: (fn: () => void, ms: number) => unknown;
  clearTimeout?: (handle: unknown) => void;
};

type Act = {
  key: string;
  simIds: string[];
  label: string;
  names: Map<string, string>;
  // The current animation's scene, held open; unset between an animation change and its round
  sceneId?: string;
  round: number;
  lines: DialogueLine[];
  speakerIds: string[];
  nextSpeaker: number;
  poke?: PatterRound['poke'];
  timer?: unknown;
  dueAt?: number;
  // The clock rate the timer was armed at
  rate: number;
  // Normal-speed milliseconds left while the countdown is held (player pause, ultra speed)
  remainingMs?: number;
  inFlight?: AbortController;
  pokes: number;
  // Pokes on the current animation's scene (the cap)
  scenePokes: number;
  // Logged once when the cap is reached; cleared by the next animation
  resting?: boolean;
  lastWwEventAt: number;
  // The fallback trusts the report only once it has seen the cast IN the act (an older mod
  // never reports it, and every act would end a minute after its last animation change)
  sawInAct: boolean;
  quietReports: number;
};

function simIdsOf(event: WWInteractionEvent): string[] {
  return event.sentient_sims.map((sim) => sim.sim_id).filter(Boolean);
}

export function wwActKey(event: WWInteractionEvent): string {
  return event.act_id ?? [...simIdsOf(event)].sort().join('+');
}

export class WickedWhimsPatter {
  private readonly acts = new Map<string, Act>();

  private readonly ended = new Map<string, number>();

  // The mod's clock as last reported (clockChanged); undefined = no mod, normal speed
  private clock?: ClockState;

  private readonly now: () => number;

  private readonly setTimer: (fn: () => void, ms: number) => unknown;

  private readonly clearTimer: (handle: unknown) => void;

  constructor(private readonly deps: WickedWhimsPatterDeps) {
    this.now = deps.now ?? (() => Date.now());
    this.setTimer = deps.setTimeout ?? ((fn, ms) => setTimeout(fn, ms));
    this.clearTimer =
      deps.clearTimeout ??
      ((handle) => {
        clearTimeout(handle as ReturnType<typeof setTimeout>);
      });
  }

  /** Test seam: the acts being followed. */
  get size(): number {
    return this.acts.size;
  }

  /** Test seam: one act's state. */
  actFor(key: string): Readonly<Act> | undefined {
    return this.acts.get(key);
  }

  /**
   * A WickedWhims event reached the app, before it queues: an animation change releases the
   * old scene (its round is coming), an ask or a walk-up ends any act its cast is in, and the
   * end of the act ends it.
   */
  wwEvent(event: WWInteractionEvent) {
    this.pruneEnded();
    const key = wwActKey(event);
    const simIds = simIdsOf(event);
    switch (event.ww_event_type) {
      case WWEventType.ENDED: {
        const act = this.acts.get(key) ?? this.overlapping(simIds).at(0);
        if (act) {
          this.end(act, 'ended');
        } else {
          this.ended.set(key, this.now());
        }
        return;
      }
      case WWEventType.ASKING:
      case WWEventType.STARTING:
        this.overlapping(simIds).forEach((act) => {
          this.end(act, 'restarted');
        });
        return;
      case WWEventType.ACTIVE: {
        // Somebody joined or left: WickedWhims runs the new cast as a new act
        this.overlapping(simIds)
          .filter((act) => act.key !== key)
          .forEach((act) => {
            this.end(act, 'replaced by a new act');
          });
        this.ended.delete(key);
        const act = this.actOf(key, event);
        act.lastWwEventAt = this.now();
        act.quietReports = 0;
        this.detach(act);
        return;
      }
      default:
    }
  }

  /** A WW round's lines are with the renderer (AIService.play, every round of an act). */
  roundAired(round: PatterRound) {
    if (!this.deps.enabled()) {
      return;
    }
    this.pruneEnded();
    const key = wwActKey(round.event);
    if (this.ended.has(key)) {
      log.info(`[Patter] round for an act that has ended; not held (${round.sceneId})`);
      return;
    }
    const act = this.actOf(key, round.event);
    if (act.sceneId !== round.sceneId) {
      if (round.round > 1) {
        // A poke on a scene the act has moved past: it plays out and closes on its own
        return;
      }
      this.detach(act);
      if (!this.deps.hold(round.sceneId)) {
        return;
      }
      act.sceneId = round.sceneId;
      // Round 1 speaks everyone, always in the same order, so starting each animation from
      // "whoever did not speak last" gave the first Sim every first poke (three Sims, animations
      // 40-60 s apart: Marco took every poke). The turn carries across the act's
      // animations; only a new act, or a new cast, starts from whoever did not speak last, and a
      // carried turn never lands on the Sim who just spoke.
      const lastSpeaker = [...round.lines].reverse().find((line) => line.simId)?.simId;
      const count = round.speakerIds.length;
      const lastIndex = lastSpeaker ? round.speakerIds.indexOf(lastSpeaker) : -1;
      const sameCast = act.speakerIds.length > 0 && act.speakerIds.join('+') === round.speakerIds.join('+');
      if (sameCast) {
        let next = act.nextSpeaker % count;
        if (next === lastIndex && count > 1) {
          next = (next + 1) % count;
        }
        act.nextSpeaker = next;
      } else {
        act.nextSpeaker = lastIndex >= 0 ? (lastIndex + 1) % count : 0;
      }
      act.scenePokes = 0;
      act.resting = false;
    }
    act.round = round.round;
    act.lines = round.lines;
    act.speakerIds = round.speakerIds;
    act.poke = round.poke;
  }

  /** The registry's held scene has nothing playing or generating: count down to the next poke. */
  sceneIdle(sceneId: string) {
    const act = this.actWithScene(sceneId);
    if (!act) {
      return;
    }
    // Its generation is over (the registry calls this from generationFinished too)
    act.inFlight = undefined;
    if (act.scenePokes >= WW_PATTER_MAX_POKES_PER_ANIMATION) {
      if (act.timer === undefined && act.remainingMs === undefined && !act.resting) {
        act.resting = true;
        log.info(`[Patter] ${act.label} resting: ${act.scenePokes} pokes on this animation`);
      }
      return;
    }
    this.arm(act, this.deps.intervalMs());
  }

  /** A scene closed. A stop (a walk-away, a zone unload, the player's voice) stops the patter
   * on it; the act lives on, so the next animation's round starts it again. */
  sceneClosed(closed: SceneClosed) {
    const act = this.actWithScene(closed.sceneId);
    if (!act) {
      return;
    }
    act.sceneId = undefined;
    this.stopTimer(act);
    act.inFlight?.abort();
    act.inFlight = undefined;
    if (closed.reason === 'stopped') {
      log.info(`[Patter] ${act.label} held: the scene stopped (${closed.stopReason ?? 'stopped'})`);
    }
  }

  /** The mod's clock changed: re-scale a running countdown, hold it, or resume it. */
  clockChanged(state?: ClockState) {
    this.clock = state;
    this.acts.forEach((act) => {
      if (!act.sceneId) {
        return;
      }
      if (act.timer !== undefined) {
        const rate = this.rateOf(state);
        const held = this.heldBy(state);
        if (held || rate !== act.rate) {
          // What is left, in normal-speed milliseconds, re-armed at the new pace (or held)
          const left = Math.max(0, (act.dueAt ?? this.now()) - this.now()) * act.rate;
          this.arm(act, left);
        }
      } else if (act.remainingMs !== undefined && !this.heldBy(state)) {
        this.arm(act, act.remainingMs);
      }
    });
  }

  /** The 5 s state report: the fallback end and the cap, for a mod that never sends `ended`. */
  stateReport(report: SimStateReport) {
    const entries = new Map((report.sims ?? []).map((entry) => [entry.sim_id, entry]));
    [...this.acts.values()].forEach((act) => {
      if (this.now() - act.lastWwEventAt > WW_PATTER_MAX_MS) {
        this.end(act, 'cap');
        return;
      }
      const seen = act.simIds.flatMap((simId) => {
        const entry = entries.get(simId);
        return entry ? [entry] : [];
      });
      if (seen.length === 0) {
        return;
      }
      if (seen.some((entry) => entry.self?.in_ww_scene === true)) {
        act.sawInAct = true;
        act.quietReports = 0;
        return;
      }
      if (!act.sawInAct) {
        return;
      }
      act.quietReports += 1;
      if (
        act.quietReports >= WW_PATTER_FALLBACK_REPORTS &&
        this.now() - act.lastWwEventAt > WW_PATTER_FALLBACK_QUIET_MS
      ) {
        this.end(act, 'no longer in the act');
      }
    });
  }

  /** The mod disconnected: every act ends. */
  reset() {
    [...this.acts.values()].forEach((act) => {
      this.end(act, 'mod disconnected');
    });
  }

  private actOf(key: string, event: WWInteractionEvent): Act {
    const names = new Map(event.sentient_sims.map((sim) => [sim.sim_id, sim.name]));
    const existing = this.acts.get(key);
    if (existing) {
      existing.simIds = simIdsOf(event);
      existing.names = names;
      existing.label = [...names.values()].join(' & ');
      return existing;
    }
    const act: Act = {
      key,
      simIds: simIdsOf(event),
      label: [...names.values()].join(' & '),
      names,
      round: 1,
      lines: [],
      speakerIds: [],
      nextSpeaker: 0,
      rate: 1,
      pokes: 0,
      scenePokes: 0,
      lastWwEventAt: this.now(),
      sawInAct: false,
      quietReports: 0,
    };
    this.acts.set(key, act);
    return act;
  }

  private actWithScene(sceneId: string): Act | undefined {
    return [...this.acts.values()].find((act) => act.sceneId === sceneId);
  }

  private overlapping(simIds: string[]): Act[] {
    return [...this.acts.values()].filter((act) => act.simIds.some((simId) => simIds.includes(simId)));
  }

  // The act moves past its current scene: no countdown, no poke in flight, the scene finishes
  private detach(act: Act) {
    this.stopTimer(act);
    act.inFlight?.abort();
    act.inFlight = undefined;
    if (act.sceneId) {
      const { sceneId } = act;
      act.sceneId = undefined;
      this.deps.release(sceneId);
    }
  }

  private end(act: Act, reason: string) {
    this.acts.delete(act.key);
    this.ended.set(act.key, this.now());
    this.detach(act);
    log.info(`[Patter] ${act.label} ended: ${reason} (${act.pokes} poke${act.pokes === 1 ? '' : 's'})`);
  }

  private stopTimer(act: Act) {
    if (act.timer !== undefined) {
      this.clearTimer(act.timer);
    }
    act.timer = undefined;
    act.dueAt = undefined;
    act.remainingMs = undefined;
  }

  private rateOf(state?: ClockState): number {
    // Ultra speed has no rate, but the countdown is held there before this is read
    return state ? (clockRate(state.speed) ?? 1) : 1;
  }

  private heldBy(state?: ClockState): 'paused' | 'ultra speed' | undefined {
    if (state?.paused && state.paused_by === 'user') {
      return 'paused';
    }
    if (state && clockRate(state.speed) === null) {
      return 'ultra speed';
    }
    return undefined;
  }

  // Count down `baseMs` of normal-speed time to the next poke, or hold it
  private arm(act: Act, baseMs: number) {
    const wasHeld = act.remainingMs !== undefined;
    this.stopTimer(act);
    if (!this.deps.enabled()) {
      this.end(act, 'switched off');
      return;
    }
    const state = this.clock;
    const held = this.heldBy(state);
    if (held) {
      act.remainingMs = baseMs;
      if (!wasHeld) {
        log.info(`[Patter] ${act.label} held: ${held}`);
      }
      return;
    }
    const rate = this.rateOf(state);
    const ms = Math.max(0, Math.round(baseMs / rate));
    act.rate = rate;
    act.dueAt = this.now() + ms;
    act.timer = this.setTimer(() => {
      this.fire(act.key);
    }, ms);
    log.info(`[Patter] ${act.label} armed ${Math.round(ms / 1000)} s (${state?.speed ?? 'NORMAL'})`);
  }

  private fire(key: string) {
    const act = this.acts.get(key);
    if (!act) {
      return;
    }
    act.timer = undefined;
    act.dueAt = undefined;
    if (this.now() - act.lastWwEventAt > WW_PATTER_MAX_MS) {
      this.end(act, 'cap');
      return;
    }
    if (!act.sceneId || !act.poke || act.speakerIds.length === 0) {
      return;
    }
    if (this.deps.isGameWaiting()) {
      log.info(`[Patter] ${act.label} refused: the game is waiting on an interaction`);
      this.arm(act, WW_PATTER_RETRY_MS * act.rate);
      return;
    }
    const speakerId = act.speakerIds[act.nextSpeaker % act.speakerIds.length];
    act.nextSpeaker = (act.nextSpeaker + 1) % act.speakerIds.length;
    act.pokes += 1;
    act.scenePokes += 1;
    log.info(`[Patter] ${act.label} poke ${act.pokes}: ${act.names.get(speakerId) ?? speakerId}`);
    const controller = new AbortController();
    act.inFlight = controller;
    void act
      .poke(speakerId, controller.signal)
      .catch((error: unknown) => {
        log.warn(`[Patter] ${act.label} poke ${act.pokes} failed`, error);
      })
      .finally(() => {
        if (act.inFlight === controller) {
          act.inFlight = undefined;
        }
      });
  }

  private pruneEnded() {
    const now = this.now();
    this.ended.forEach((at, key) => {
      if (now - at > ENDED_TTL_MS) {
        this.ended.delete(key);
      }
    });
  }
}
