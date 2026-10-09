import log from 'electron-log';
import { currentRate, isUserPaused, onPauseChange, onRateChange, waitWhileUserPaused } from './playbackClock';

export type AudioPlaybackHandle = {
  finished: Promise<void>;
  stop: () => void;
  // V-1: driven by the playback clock (user pause / game speed); playAudio* wire them
  pause?: () => void;
  resume?: () => void;
  setRate?: (rate: number) => void;
};

// V-1: a user pause suspends the shared context (every line, WebAudio and media
// element alike); resume brings it back. Registered once, survives every line.
let clockWired = false;
function wirePlaybackClock(context: AudioContext) {
  if (clockWired) {
    return;
  }
  clockWired = true;
  onPauseChange((paused) => {
    if (paused && context.state === 'running') {
      void context.suspend();
    } else if (!paused && context.state === 'suspended') {
      void context.resume();
    }
  });
}

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
  wirePlaybackClock(context);
  // A user pause holds the line before it starts (never resume the context over a pause)
  await waitWhileUserPaused();
  if (context.state === 'suspended' && !isUserPaused()) {
    await context.resume();
  }

  const response = await fetch(audioUrl);
  const audioBuffer = await context.decodeAudioData(await response.arrayBuffer());
  log.info(`[TTS] Playing audio: duration=${audioBuffer.duration.toFixed(2)}s volume=${volume}`);

  const gain = context.createGain();
  gain.gain.value = volume;
  gain.connect(context.destination);

  const source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = currentRate();
  source.connect(gain);

  const offRate = onRateChange((rate) => {
    try {
      source.playbackRate.value = rate;
    } catch (err) {
      log.debug('Could not change playback rate', err);
    }
  });

  const finished = new Promise<void>((resolve) => {
    source.onended = () => {
      offRate();
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
    setRate: (rate: number) => {
      source.playbackRate.value = rate;
    },
  };
}

/**
 * Plays an mp3 byte stream as it arrives via MediaSource, so playback starts on the
 * first chunk instead of after the full file has downloaded. ElevenLabs v3 renders at
 * ~3x realtime after its first chunk, so play-on-first-chunk never underruns. The
 * element is routed through the shared AudioContext to keep the output device warm.
 */
export async function playAudioStream(
  stream: ReadableStream<Uint8Array>,
  volume: number,
): Promise<AudioPlaybackHandle> {
  const context = getAudioContext();
  wirePlaybackClock(context);
  await waitWhileUserPaused();
  if (context.state === 'suspended' && !isUserPaused()) {
    await context.resume();
  }
  if (context.state !== 'running') {
    log.warn(`[TTS] AudioContext not running after resume: ${context.state} — stream will be silent`);
  }

  const mediaSource = new MediaSource();
  const audio = new Audio();
  audio.src = URL.createObjectURL(mediaSource);
  audio.playbackRate = currentRate();
  const offRate = onRateChange((rate) => {
    audio.playbackRate = rate;
  });
  // The element keeps its own transport: pause/resume it with the user pause too
  const offPause = onPauseChange((paused) => {
    if (paused) {
      audio.pause();
    } else {
      void audio.play().catch((err: unknown) => {
        log.debug('resume after user pause failed', err);
      });
    }
  });

  const element = context.createMediaElementSource(audio);
  const gain = context.createGain();
  gain.gain.value = volume;
  element.connect(gain);
  gain.connect(context.destination);

  // Ref-object rather than a bare boolean so the flag set by stop() stays visible
  // inside the pump loop without TS narrowing it to its initial value
  const stopState = { current: false };
  // stop() and the element's own 'ended'/'error' can each fire; the second must not
  // disconnect nodes twice or revoke an already-revoked URL
  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    offRate();
    offPause();
    element.disconnect();
    gain.disconnect();
    URL.revokeObjectURL(audio.src);
  };

  await new Promise<void>((resolve) => {
    mediaSource.addEventListener(
      'sourceopen',
      () => {
        resolve();
      },
      { once: true },
    );
  });
  const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');

  const appendChunk = (chunk: Uint8Array) =>
    new Promise<void>((resolve, reject) => {
      sourceBuffer.addEventListener(
        'updateend',
        () => {
          resolve();
        },
        { once: true },
      );
      sourceBuffer.addEventListener(
        'error',
        () => {
          reject(new Error('SourceBuffer append failed'));
        },
        { once: true },
      );
      // slice() re-copies so the append covers only this chunk's bytes, not the
      // chunk's whole (possibly shared) underlying buffer
      sourceBuffer.appendBuffer(chunk.slice().buffer);
    });

  const reader = stream.getReader();
  const startedAt = Date.now();
  // Feed the buffer in the background while the element plays from it
  void (async () => {
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done || stopState.current) break;
        await appendChunk(value);
      }
      if (!stopState.current && mediaSource.readyState === 'open') {
        mediaSource.endOfStream();
      }
    } catch (err) {
      log.error('[TTS] Stream pump failed', err);
      try {
        if (mediaSource.readyState === 'open') mediaSource.endOfStream();
      } catch (endErr) {
        log.debug('MediaSource already closed', endErr);
      }
    }
  })();

  // audio.pause() in stop() fires neither 'ended' nor 'error', so stop() must settle
  // this itself — a caller awaiting `finished` (the scene drain loop) would otherwise
  // hang forever after the player pre-empts a line, and no later scene would ever play
  let settle: () => void = () => {};
  const finished = new Promise<void>((resolve) => {
    settle = resolve;
    audio.addEventListener(
      'ended',
      () => {
        // currentTime near zero at 'ended' is the smoking gun for a silent death —
        // observed live: a line logged 'playback started' and produced no audio, and
        // with no completion logging the failure was invisible
        const played = audio.currentTime;
        if (played < 0.5) {
          log.warn(
            `[TTS] Streaming playback ENDED after only ${played.toFixed(2)}s — likely silent failure (context state: ${context.state})`,
          );
        } else {
          log.info(`[TTS] Streaming playback finished after ${played.toFixed(2)}s`);
        }
        cleanup();
        resolve();
      },
      { once: true },
    );
    audio.addEventListener(
      'error',
      () => {
        log.error(`[TTS] Streaming audio element error: ${audio.error?.message}`);
        cleanup();
        resolve();
      },
      { once: true },
    );
  });

  audio.addEventListener(
    'playing',
    () => {
      log.info(`[TTS] Streaming playback started ${Date.now() - startedAt}ms after fetch, volume=${volume}`);
    },
    { once: true },
  );
  await audio.play();

  return {
    finished,
    stop: () => {
      stopState.current = true;
      reader.cancel().catch((err: unknown) => {
        log.debug('Stream reader already cancelled', err);
      });
      audio.pause();
      log.info(`[TTS] Streaming playback stopped after ${audio.currentTime.toFixed(2)}s`);
      cleanup();
      settle();
    },
    pause: () => {
      audio.pause();
    },
    resume: () => {
      void audio.play();
    },
    setRate: (rate: number) => {
      audio.playbackRate = rate;
    },
  };
}
