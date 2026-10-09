// V-1: the renderer-side playback clock. Voice lines and subtitle pacing follow the game:
// a USER pause (player hits space, a game dialog) suspends audio and holds the scene
// queue; resume continues; speed 2/3 speeds playback and shortens the pacing gaps.
//
// Mod-initiated pauses (paused_by === 'mod': pause_on_generation, the voice hold, error
// dialogs) NEVER gate playback — that would be a deadlock: subtitles pause the clock,
// the paused clock freezes the subtitles, forever. Nothing here reads clock state
// except through setClockState(); the main process forwards CLOCK_STATE from the mod.

import log from 'electron-log';

export type ClockState = { speed: string; paused: boolean; paused_by?: 'user' | 'mod' | null };

const RATE_BY_SPEED: Record<string, number> = {
  PAUSED: 1,
  NORMAL: 1,
  SPEED2: 1.25,
  SPEED3: 1.5,
  SUPER_SPEED3: 1.5,
  INTERACTION_STARTUP_SPEED: 1,
};

type RateListener = (rate: number) => void;

let userPaused = false;
let rate = 1;
const rateListeners = new Set<RateListener>();
const pauseListeners = new Set<(paused: boolean) => void>();

export function setClockState(state: ClockState) {
  const nextPaused = state.paused && state.paused_by === 'user';
  const nextRate = RATE_BY_SPEED[state.speed.toUpperCase()] ?? 1;
  if (nextPaused !== userPaused) {
    userPaused = nextPaused;
    log.info(`[PlaybackClock] user pause ${userPaused ? 'ON' : 'OFF'} (game ${state.speed})`);
    pauseListeners.forEach((listener) => {
      listener(userPaused);
    });
  }
  if (!nextPaused && nextRate !== rate) {
    rate = nextRate;
    log.info(`[PlaybackClock] rate ${rate} (game ${state.speed})`);
    rateListeners.forEach((listener) => {
      listener(rate);
    });
  }
}

export function isUserPaused(): boolean {
  return userPaused;
}

export function currentRate(): number {
  return rate;
}

export function onRateChange(listener: RateListener): () => void {
  rateListeners.add(listener);
  return () => rateListeners.delete(listener);
}

export function onPauseChange(listener: (paused: boolean) => void): () => void {
  pauseListeners.add(listener);
  return () => pauseListeners.delete(listener);
}

// Resolves once the user pause (if any) lifts
export function waitWhileUserPaused(): Promise<void> {
  if (!userPaused) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const off = onPauseChange((paused) => {
      if (!paused) {
        off();
        resolve();
      }
    });
  });
}

// A pacing delay (line gap, reading hold) that scales with the game speed and stops
// counting while the user has the game paused
export function pacedDelay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    let remaining = ms;
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      if (!userPaused) {
        remaining -= (now - last) * rate;
      }
      last = now;
      if (remaining <= 0) {
        resolve();
        return;
      }
      setTimeout(tick, Math.min(100, Math.max(10, remaining / rate)));
    };
    setTimeout(tick, Math.min(100, ms));
  });
}
