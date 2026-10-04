import log from 'electron-log';
import { DialogueLine } from '../formatter/PromptFormatter';
import { SceneEndedReason } from '../models/ModWebsocketMessage';

// How a scene stops when something outside the pipeline ends it.
//   soft - the line already playing finishes, nothing after it airs. A sim who
//          walks out of the room ends the conversation the way a person does.
//   hard - stop now, mid-word. A sim who left the lot cannot be mid-sentence,
//          and audio from the old lot must never carry into the new one.
export type SceneStopMode = 'soft' | 'hard';

export type SceneStopReason = 'walked_away' | 'left_lot' | 'zone_unload' | 'cheat' | 'preempted';

// A scene whose renderer never reported back (window closed mid-playback) would
// otherwise sit here forever holding a memory id.
const SCENE_TTL_MS = 10 * 60 * 1000;
// A stopped scene is remembered this long so late generation rounds still see the
// stop and bail instead of airing into a conversation that is over.
const STOPPED_TTL_MS = 5 * 60 * 1000;

// Who was in a conversation, as the appraisal at its end needs them: the sim's id
// (lines are tagged with it), the name the lines use, and what the sim was like
// going in. Player personas are never cast members - they have no sim to feel it.
export type SceneCastMember = {
  simId: string;
  name: string;
  traits?: string[];
  moods?: string[];
};

// Everything known about a conversation the moment it is over: who was in it and
// the lines that actually reached the player, however it ended.
export type SceneClosed = {
  sceneId: string;
  participantSimIds: string[];
  cast: SceneCastMember[];
  lines: DialogueLine[];
  reason: 'finished' | 'stopped';
  stopReason?: SceneStopReason;
  mode?: SceneStopMode;
};

type SceneEntry = {
  participantSimIds: string[];
  // Rounds handed to the renderer that have not reported playback finished
  pendingRounds: number;
  // Continuation rounds currently being generated
  generating: number;
  stopped: boolean;
  stoppedAt?: number;
  touchedAt: number;
  // The shared memory row for this scene (round 1's transcript), once it lands
  memoryId?: string;
  // The paced text of round 1, which is how the memory row is recognised
  openingPacedText?: string;
  // Lines of round 1, and how many of them actually reached the player
  openingLines: DialogueLine[];
  airedLines: number;
  // Every round's lines in airing order, so the conversation can be judged whole
  allLines: DialogueLine[];
  cast: SceneCastMember[];
  closed: boolean;
};

export type ScenePlaybackDeps = {
  // Tell the renderer to drop this scene's remaining playback
  notifyStop: (payload: { sceneId: string; mode: SceneStopMode }) => void;
  // Tell the mod the conversation is over
  notifySceneEnded: (sceneId: string, reason: SceneEndedReason) => void;
  // Rewrite the scene's memory row to what was actually said
  trimMemory?: (memoryId: string, content: string) => void;
  // The conversation is over and this is what was heard: appraise what it left behind
  onSceneClosed?: (closed: SceneClosed) => void;
};

/**
 * What the app knows about the conversations it is currently airing.
 *
 * A directed scene is otherwise nothing but a stack of closures: once
 * runDirectedGeneration hands its lines to the renderer, nothing holds the
 * scene, and its continuation rounds keep generating on their own. That is why
 * a conversation kept going after one of its sims walked away - there was
 * nobody to tell. This registry is that somebody: it knows which sims a scene
 * belongs to, whether anything of it is still playing or generating, and it is
 * where a stop from the game lands.
 */
export class ScenePlaybackRegistry {
  private readonly scenes = new Map<string, SceneEntry>();

  constructor(private readonly deps: ScenePlaybackDeps) {}

  /** A round's lines have been handed to the renderer. */
  roundQueued(
    sceneId: string,
    participantSimIds: string[],
    round: number,
    lines: DialogueLine[],
    pacedText?: string,
    cast?: SceneCastMember[],
  ) {
    const entry = this.entry(sceneId, participantSimIds);
    entry.pendingRounds += 1;
    entry.touchedAt = Date.now();
    const spoken = lines.filter((line) => !line.skipSceneLine);
    if (round <= 1) {
      // Only the opening round is ever written to a shared memory row, so it is
      // the only transcript a cut can leave claiming more than was said
      entry.openingLines = spoken;
      entry.openingPacedText = pacedText;
    }
    entry.allLines.push(...spoken);
    if (cast && cast.length > 0 && entry.cast.length === 0) {
      entry.cast = cast;
    }
  }

  /** A continuation round has started generating. */
  generationStarted(sceneId: string) {
    const entry = this.scenes.get(sceneId);
    if (entry) {
      entry.generating += 1;
      entry.touchedAt = Date.now();
    }
  }

  /** A continuation round has finished generating (aired, failed, or bailed). */
  generationFinished(sceneId: string) {
    const entry = this.scenes.get(sceneId);
    if (!entry) return;
    entry.generating = Math.max(0, entry.generating - 1);
    this.finishIfIdle(sceneId, entry);
  }

  /** One of the scene's lines reached the player. */
  lineShown(sceneId?: string) {
    if (!sceneId) return;
    const entry = this.scenes.get(sceneId);
    if (!entry) return;
    entry.airedLines += 1;
    entry.touchedAt = Date.now();
  }

  /** The renderer finished (or abandoned) a round's playback. */
  playbackEnded(sceneId: string, completed: boolean) {
    const entry = this.scenes.get(sceneId);
    if (!entry) return;
    entry.pendingRounds = Math.max(0, entry.pendingRounds - 1);
    entry.touchedAt = Date.now();
    if (!completed && !entry.stopped) {
      // The renderer cut the scene short on its own (the player's voice hotkey
      // pre-empted it): the pipeline must stop feeding it rounds too
      this.stop(sceneId, 'preempted', 'hard');
      return;
    }
    this.finishIfIdle(sceneId, entry);
  }

  /**
   * End a scene: the renderer drops what is left, the mod is told, and the
   * memory row is trimmed to what the player actually heard. Idempotent - a
   * stop from the game and the renderer's own report often both arrive.
   */
  stop(sceneId: string, reason: SceneStopReason, mode: SceneStopMode = 'soft') {
    const entry = this.scenes.get(sceneId);
    if (!entry || entry.stopped) {
      return;
    }
    entry.stopped = true;
    entry.stoppedAt = Date.now();
    entry.pendingRounds = 0;
    log.info(`[Scene] ${sceneId} stopped (${mode}): ${reason}`);
    try {
      this.deps.notifyStop({ sceneId, mode });
    } catch (err) {
      log.error('[Scene] failed to stop playback', err);
    }
    this.trimMemory(entry, mode);
    try {
      this.deps.notifySceneEnded(sceneId, 'stopped');
    } catch (err) {
      log.error('[Scene] failed to report the scene ended', err);
    }
    this.close(sceneId, entry, { reason: 'stopped', stopReason: reason, mode });
  }

  /** Every scene stops now: the lot is going away. */
  stopAll(reason: SceneStopReason = 'zone_unload') {
    [...this.scenes.keys()].forEach((sceneId) => {
      this.stop(sceneId, reason, 'hard');
    });
  }

  isStopped(sceneId?: string): boolean {
    if (!sceneId) return false;
    const entry = this.scenes.get(sceneId);
    return Boolean(entry?.stopped);
  }

  /**
   * The memory row for this scene has landed. Matched on the paced text because
   * that is the only thing the row and the scene share - the mod POSTs the
   * transcript back without ever seeing a scene id.
   */
  attachMemory(pacedText: string, memoryId: string): boolean {
    for (const entry of this.scenes.values()) {
      if (entry.openingPacedText && entry.openingPacedText === pacedText) {
        entry.memoryId = memoryId;
        return true;
      }
    }
    return false;
  }

  /** Test seam. */
  get size() {
    return this.scenes.size;
  }

  private entry(sceneId: string, participantSimIds: string[]): SceneEntry {
    this.sweep();
    const existing = this.scenes.get(sceneId);
    if (existing) {
      return existing;
    }
    const created: SceneEntry = {
      participantSimIds,
      pendingRounds: 0,
      generating: 0,
      stopped: false,
      touchedAt: Date.now(),
      openingLines: [],
      airedLines: 0,
      allLines: [],
      cast: [],
      closed: false,
    };
    this.scenes.set(sceneId, created);
    return created;
  }

  private finishIfIdle(sceneId: string, entry: SceneEntry) {
    if (entry.stopped || entry.pendingRounds > 0 || entry.generating > 0) {
      return;
    }
    // Nothing left playing and nothing left to generate: the conversation ran
    // its course. The mod stops watching it.
    this.scenes.delete(sceneId);
    try {
      this.deps.notifySceneEnded(sceneId, 'finished');
    } catch (err) {
      log.error('[Scene] failed to report the scene finished', err);
    }
    this.close(sceneId, entry, { reason: 'finished' });
  }

  /**
   * The conversation is over, one way or the other: hand what was heard to whoever
   * judges what it leaves behind. Once per scene, and never in the way of the stop
   * itself - an appraisal that throws is that appraisal's problem.
   */
  private close(
    sceneId: string,
    entry: SceneEntry,
    ending: { reason: 'finished' | 'stopped'; stopReason?: SceneStopReason; mode?: SceneStopMode },
  ) {
    if (entry.closed || !this.deps.onSceneClosed) {
      return;
    }
    entry.closed = true;
    const closed: SceneClosed = {
      sceneId,
      participantSimIds: entry.participantSimIds,
      cast: entry.cast,
      lines: this.heardLines(entry, ending.reason, ending.mode),
      reason: ending.reason,
      stopReason: ending.stopReason,
      mode: ending.mode,
    };
    try {
      this.deps.onSceneClosed(closed);
    } catch (err) {
      log.error('[Scene] failed to hand the closed scene on', err);
    }
  }

  // The lines the player actually heard. A scene that ran its course aired every
  // line; a soft stop let the playing line finish; a hard stop cut it off mid-word.
  private heardLines(entry: SceneEntry, reason: 'finished' | 'stopped', mode?: SceneStopMode): DialogueLine[] {
    if (reason === 'finished') {
      return entry.allLines;
    }
    const heard = mode === 'hard' ? Math.max(0, entry.airedLines - 1) : entry.airedLines;
    return entry.allLines.slice(0, Math.min(heard, entry.allLines.length));
  }

  /**
   * A cut scene leaves a memory row claiming dialogue nobody heard, and every
   * later scene reads that row as history. Shrink it to the lines that aired.
   */
  private trimMemory(entry: SceneEntry, mode: SceneStopMode) {
    if (!entry.memoryId || !this.deps.trimMemory || entry.openingLines.length === 0) {
      return;
    }
    // A soft stop lets the line that was playing finish, so it counts as heard;
    // a hard stop cut it off mid-word, so it does not.
    const heard = mode === 'soft' ? entry.airedLines : Math.max(0, entry.airedLines - 1);
    const kept = Math.min(heard, entry.openingLines.length);
    if (kept >= entry.openingLines.length) {
      return;
    }
    const content = entry.openingLines
      .slice(0, kept)
      .map((line) => `${line.speaker}: ${line.text}`)
      .join('\n');
    try {
      this.deps.trimMemory(entry.memoryId, content);
    } catch (err) {
      log.error('[Scene] failed to trim the cut scene memory', err);
    }
  }

  private sweep() {
    const now = Date.now();
    this.scenes.forEach((entry, sceneId) => {
      const ttl = entry.stopped ? STOPPED_TTL_MS : SCENE_TTL_MS;
      const since = entry.stopped ? (entry.stoppedAt ?? entry.touchedAt) : entry.touchedAt;
      if (now - since > ttl) {
        this.scenes.delete(sceneId);
      }
    });
  }
}
