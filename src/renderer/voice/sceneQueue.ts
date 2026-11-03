// Ordered insertion for the renderer's TTS scene queue. Pure so it can be unit tested:
// AudioContextProvider hands it the queue ref's array and mutates in place.
//
// Ordering rules:
// - Priority scenes (a reply to the player's own words) rank ahead of non-priority ones,
//   but FIFO among themselves — the old blind unshift made priority LIFO, so a second
//   player reply or a continuation round N+1 could air before round N.
// - Within a rank, ascending seq (the main process's dispatch order).
// - Same-scene guard: a scene never lands ahead of a queued scene with the same sceneId,
//   whatever its flags say — a later round of a conversation never jumps an earlier one.
// - Eviction at the cap drops the oldest NON-priority scene, never the incoming one and
//   never a priority scene; if everything queued is priority, transient overflow is
//   allowed rather than dropping a player-facing reply.

export type OrderedScene = {
  seq: number;
  priority: boolean;
  sceneId?: string;
};

function rank(scene: OrderedScene): number {
  return scene.priority ? 0 : 1;
}

export function insertScene<T extends OrderedScene>(
  queue: T[],
  scene: T,
  maxQueuedScenes: number,
  onDrop: (dropped: T) => void,
): void {
  // Never insert ahead of an already-queued round of the same conversation
  let floor = 0;
  if (scene.sceneId) {
    for (let i = queue.length - 1; i >= 0; i -= 1) {
      if (queue[i].sceneId === scene.sceneId) {
        floor = i + 1;
        break;
      }
    }
  }
  let index = queue.length;
  for (let i = floor; i < queue.length; i += 1) {
    const queued = queue[i];
    if (rank(scene) < rank(queued) || (rank(scene) === rank(queued) && scene.seq < queued.seq)) {
      index = i;
      break;
    }
  }
  queue.splice(index, 0, scene);

  while (queue.length > maxQueuedScenes) {
    const oldestNonPriority = queue.findIndex((queued) => !queued.priority && queued !== scene);
    if (oldestNonPriority === -1) {
      // Everything waiting is player-facing: overflow briefly rather than drop a reply
      break;
    }
    const [dropped] = queue.splice(oldestNonPriority, 1);
    onDrop(dropped);
  }
}

// How a playing scene is ending early. 'soft' and 'hard' come from the game (a sim walked
// away / left the lot); 'yield' is the renderer's own: a reply to the player arrived while
// an autonomous scene was playing, so that scene finishes the LINE it is on (every
// `continues` chunk of it) and hands over, instead of airing all its remaining lines first
// (typed replies waited 8-25 s for that on a busy lot, measured 2026-10-29/30).
export type SceneStopMark = 'soft' | 'hard' | 'yield';

export type YieldScene = {
  priority: boolean;
  paced: boolean;
  sceneId?: string;
};

// Does the incoming scene make the one playing now yield after its current line? Only a
// player reply (priority) over a paced autonomous scene with an id of its own; a reply
// never yields to a reply, and a round of the same conversation is a continuation, not
// an interruption.
export function shouldYieldTo(incoming: YieldScene, current: YieldScene | undefined): boolean {
  if (!incoming.priority || !current) return false;
  if (current.priority || !current.paced || !current.sceneId) return false;
  return incoming.sceneId !== current.sceneId;
}

// May the entry at `next` start, given how (if at all) the scene was marked? Unmarked:
// always. Soft/hard: never (the game ended it). Yield: only while the line in progress
// has more chunks to come (the previous entry `continues`), so a long reply split into
// sentence chunks is still heard whole; a fresh line never starts.
export function mayStartEntry(
  mark: SceneStopMark | undefined,
  entries: { continues?: boolean }[],
  next: number,
): boolean {
  if (!mark) return true;
  if (mark !== 'yield') return false;
  return next > 0 && entries[next - 1]?.continues === true;
}
