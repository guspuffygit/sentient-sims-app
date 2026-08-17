// Directed scenes stream their dialogue lines to the game one at a time, timed to voice
// playback, so their memory must not also be displayed in-game as one subtitle block.
// The memory row is created by the mod POSTing the scene text back after the interaction
// completes, so the app recognizes it by content: the scene registers its final transcript
// here, and the memory_created broadcast consumes the match to flag the message as paced.
const pendingSceneContents = new Map<string, number>();

const pacedSceneTtlMs = 5 * 60 * 1000;

function prune() {
  const now = Date.now();
  pendingSceneContents.forEach((expiresAt, content) => {
    if (expiresAt <= now) {
      pendingSceneContents.delete(content);
    }
  });
}

export function markScenePaced(content: string) {
  prune();
  pendingSceneContents.set(content, Date.now() + pacedSceneTtlMs);
}

// The renderer dropped the scene before any line played, so its lines will never stream
// to the game — un-mark it so the memory_created broadcast shows the normal subtitle block.
export function unmarkScenePaced(content: string) {
  pendingSceneContents.delete(content);
}

export function consumePacedScene(content?: string): boolean {
  prune();
  if (content && pendingSceneContents.has(content)) {
    pendingSceneContents.delete(content);
    return true;
  }
  return false;
}
