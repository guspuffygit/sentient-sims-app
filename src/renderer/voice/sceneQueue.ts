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
