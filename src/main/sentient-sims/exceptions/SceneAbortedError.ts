// A provider call cut short because its scene no longer needs it: the game ended the
// scene, or the round gave its queue slot to an interaction the game is waiting on
export class SceneAbortedError extends Error {
  constructor(label: string) {
    super(`${label} aborted: the scene no longer needs it`);
    this.name = 'SceneAbortedError';
  }
}
