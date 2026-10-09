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
  // The shared memory row for this scene, once it lands. The mod writes it with
  // round 1's transcript, and the scene's close rewrites it to what was heard.
  memoryId?: string;
  // The paced text of round 1, which is how the memory row is recognised
  openingPacedText?: string;
  // The action sentence that heads the memory row above the dialogue
  openingPreAction?: string;
  // Lines of round 1, which are the lines the row holds as first written
  openingLines: DialogueLine[];
  // Where round 1 starts in allLines
  openingStart: number;
  // How many of the scene's lines actually reached the player
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
  rewriteMemory?: (memoryId: string, content: string) => void;
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

  // Rewrites owed to rows that had not landed when their scene closed, keyed by
  // the paced text the row arrives with
  private readonly lateRewrites = new Map<string, { content: string; closedAt: number }>();

  constructor(private readonly deps: ScenePlaybackDeps) {}

  /** A round's lines have been handed to the renderer. */
  roundQueued(
    sceneId: string,
    participantSimIds: string[],
    round: number,
    lines: DialogueLine[],
    pacedText?: string,
    cast?: SceneCastMember[],
    preAction?: string,
  ) {
    const entry = this.entry(sceneId, participantSimIds);
    entry.pendingRounds += 1;
    entry.touchedAt = Date.now();
    const spoken = lines.filter((line) => !line.skipSceneLine);
    if (round <= 1) {
      // The mod writes the shared memory row from the opening round alone. Later
      // rounds reach the row when the scene closes (settleMemory).
      entry.openingLines = spoken;
      entry.openingStart = entry.allLines.length;
      entry.openingPacedText = pacedText;
      entry.openingPreAction = preAction;
      entry.memoryId = undefined;
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
   * memory row is rewritten to what the player actually heard. Idempotent - a
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
    this.settleMemory(entry, this.heardLines(entry, 'stopped', mode));
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
   * transcript back without ever seeing a scene id. A row that lands after its
   * scene closed gets the rewrite the close could not make.
   */
  attachMemory(pacedText: string, memoryId: string): boolean {
    const late = this.lateRewrites.get(pacedText);
    if (late) {
      this.lateRewrites.delete(pacedText);
      this.rewriteMemory(memoryId, late.content);
      return true;
    }
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
      openingStart: 0,
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
    this.settleMemory(entry, entry.allLines);
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
   * The memory row holds round 1 as written, and every later scene reads it as
   * history. A cut scene's row claims dialogue nobody heard, and a scene that ran
   * on past round 1 has a row that stops before the conversation did. Rewrite the
   * row to the lines that aired.
   */
  private settleMemory(entry: SceneEntry, heard: DialogueLine[]) {
    if (!this.deps.rewriteMemory || entry.openingLines.length === 0) {
      return;
    }
    const kept = heard.slice(entry.openingStart);
    if (kept.length === entry.openingLines.length) {
      // Round 1 was heard whole and nothing aired after it: the row stands as written
      return;
    }
    // The row keeps its action sentence, and a long line that aired in chunks
    // goes back as one line
    const rows: string[] = entry.openingPreAction ? [entry.openingPreAction] : [];
    let joinsPrevious = false;
    kept.forEach((line) => {
      if (joinsPrevious) {
        rows[rows.length - 1] += ` ${line.text}`;
      } else {
        rows.push(`${line.speaker}: ${line.text}`);
      }
      joinsPrevious = Boolean(line.continues);
    });
    if (rows.length === 0) {
      // Nothing was heard and no action heads the row: an empty row would show
      // blank and drop the interaction from history
      return;
    }
    const content = rows.join('\n');
    if (entry.memoryId) {
      this.rewriteMemory(entry.memoryId, content);
    } else if (entry.openingPacedText) {
      this.lateRewrites.set(entry.openingPacedText, { content, closedAt: Date.now() });
    }
  }

  private rewriteMemory(memoryId: string, content: string) {
    try {
      this.deps.rewriteMemory?.(memoryId, content);
    } catch (err) {
      log.error('[Scene] failed to rewrite the scene memory', err);
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
    this.lateRewrites.forEach((late, pacedText) => {
      if (now - late.closedAt > SCENE_TTL_MS) {
        this.lateRewrites.delete(pacedText);
      }
    });
  }
}
