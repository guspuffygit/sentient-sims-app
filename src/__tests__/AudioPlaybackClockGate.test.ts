import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// The renderer's audio player with the browser's audio classes replaced by minimal
// fakes: enough for the clock gate (user pause, game speed) to be exercised in node.
type FakeSource = { playbackRate: { value: number }; onended: (() => void) | null };

class FakeAudioContext {
  state: 'running' | 'suspended' = 'running';

  destination = {};

  currentTime = 0;

  sources: FakeSource[] = [];

  resume(): Promise<void> {
    this.state = 'running';
    return Promise.resolve();
  }

  suspend(): Promise<void> {
    this.state = 'suspended';
    return Promise.resolve();
  }

  decodeAudioData(): Promise<{ duration: number }> {
    return Promise.resolve({ duration: 1 });
  }

  createGain() {
    return { gain: { value: 1 }, connect: () => {}, disconnect: () => {} };
  }

  createBufferSource() {
    const source = {
      buffer: null,
      playbackRate: { value: 1 },
      onended: null as (() => void) | null,
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
    };
    this.sources.push(source);
    return source;
  }
}

const contexts: FakeAudioContext[] = [];

beforeAll(() => {
  vi.stubGlobal(
    'AudioContext',
    class extends FakeAudioContext {
      constructor() {
        super();
        contexts.push(this);
      }
    },
  );
  vi.stubGlobal('fetch', () => Promise.resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) }));
});

afterAll(() => {
  vi.unstubAllGlobals();
});

const userPause = { speed: 'PAUSED', paused: true, paused_by: 'user' as const };
const running = { speed: 'NORMAL', paused: false, paused_by: null };
const speed3 = { speed: 'SPEED3', paused: false, paused_by: null };

function settled(promise: Promise<unknown>, ms: number): Promise<boolean> {
  return Promise.race([
    promise.then(() => true),
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(false);
      }, ms);
    }),
  ]);
}

describe('the audio player and the game clock', () => {
  it('holds a scene line while the player has the game paused', async () => {
    const { playAudioUrl } = await import('renderer/voice/audioPlayback');
    const { setClockState } = await import('renderer/voice/playbackClock');

    setClockState(userPause);
    const line = playAudioUrl('blob:line', 1);
    expect(await settled(line, 250)).toBe(false);

    setClockState(running);
    expect(await settled(line, 1000)).toBe(true);
  });

  it('plays a voice test at once, at rate 1, with the clock paused at speed 3', async () => {
    const { playAudioUrl } = await import('renderer/voice/audioPlayback');
    const { setClockState } = await import('renderer/voice/playbackClock');

    // The pause transition suspends the shared context, as it does in the app
    setClockState(speed3);
    setClockState({ ...userPause, speed: 'SPEED3' });
    const shared = contexts[0];
    expect(shared.state).toBe('suspended');

    const test = playAudioUrl('blob:test', 1, { followsClock: false });
    expect(await settled(test, 1000)).toBe(true);

    // The test plays on its own context; a scene line held mid-word stays held
    const own = contexts.at(-1);
    expect(own).not.toBe(shared);
    expect(own?.state).toBe('running');
    expect(shared.state).toBe('suspended');
    const source = own?.sources.at(-1);
    expect(source?.playbackRate.value).toBe(1);

    // Resuming the clock does not touch the test clip
    setClockState(speed3);
    expect(source?.playbackRate.value).toBe(1);
    setClockState(running);
  });
});
