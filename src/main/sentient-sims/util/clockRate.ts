// How fast the game clock runs, as the voice playback follows it (V-1): the renderer's
// playbackClock and the Wicked Whims patter (services/WickedWhimsPatter) read the same table.
// The mod sends the game's ClockSpeedMode name on clock_state.
export const PLAYBACK_RATE_BY_SPEED: Record<string, number> = {
  PAUSED: 1,
  NORMAL: 1,
  SPEED2: 1.25,
  SPEED3: 1.5,
  SUPER_SPEED3: 1.5,
  INTERACTION_STARTUP_SPEED: 1,
};

// What the playback runs at: 1 for a speed nobody has named
export function playbackRate(speed: string): number {
  return PLAYBACK_RATE_BY_SPEED[speed.toUpperCase()] ?? 1;
}

// The patter's pace: the same table, except that ultra speed (SUPER_SPEED3, the
// game's own sleep fast-forward) is null, because a minute of game passes in about a second
// there and nobody would hear a line before the act moved on
export function clockRate(speed: string): number | null {
  if (speed.toUpperCase() === 'SUPER_SPEED3') {
    return null;
  }
  return playbackRate(speed);
}
