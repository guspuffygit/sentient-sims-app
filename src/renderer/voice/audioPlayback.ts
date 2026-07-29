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
  log.info(`[TTS] Playing audio: duration=${audioBuffer.duration.toFixed(2)}s volume=${volume}`);

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
  if (context.state === 'suspended') {
    await context.resume();
  }

  const mediaSource = new MediaSource();
  const audio = new Audio();
  audio.src = URL.createObjectURL(mediaSource);

  const element = context.createMediaElementSource(audio);
  const gain = context.createGain();
  gain.gain.value = volume;
  element.connect(gain);
  gain.connect(context.destination);

  // Ref-object rather than a bare boolean so the flag set by stop() stays visible
  // inside the pump loop without TS narrowing it to its initial value
  const stopState = { current: false };
  const cleanup = () => {
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

  const finished = new Promise<void>((resolve) => {
    audio.addEventListener(
      'ended',
      () => {
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
      cleanup();
    },
  };
}
