import log from 'electron-log';

export type AudioPlaybackHandle = {
  finished: Promise<void>;
  stop: () => void;
};

// One AudioContext shared by all TTS playback. Spinning up a fresh HTMLAudioElement per
// line lets the output device go idle between lines, and the first fraction of a second
// gets clipped while it wakes back up — a persistent context keeps the device warm.
let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

// Start playback slightly in the future so the first syllable isn't swallowed
// while the output stream is still waking up.
const playbackLeadInSeconds = 0.1;

/**
 * Plays audio from a (blob) URL through the shared AudioContext. The audio is fully
 * decoded before playback starts, so nothing is dropped to buffering either.
 */
export async function playAudioUrl(audioUrl: string, volume: number): Promise<AudioPlaybackHandle> {
  const context = getAudioContext();
  if (context.state === 'suspended') {
    await context.resume();
  }

  const response = await fetch(audioUrl);
  const audioBuffer = await context.decodeAudioData(await response.arrayBuffer());

  const gain = context.createGain();
  gain.gain.value = volume;
  gain.connect(context.destination);

  const source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(gain);

  const finished = new Promise<void>((resolve) => {
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      resolve();
    };
  });

  source.start(context.currentTime + playbackLeadInSeconds);

  return {
    finished,
    stop: () => {
      try {
        source.stop();
      } catch (err) {
        log.debug('Audio source already stopped', err);
      }
    },
  };
}
