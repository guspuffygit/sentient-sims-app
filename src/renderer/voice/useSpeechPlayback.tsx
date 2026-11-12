import { useState, useCallback, useRef, useEffect } from 'react';
import log from 'electron-log';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { sceneChunkGapMs, sceneLineGapMs, sceneLineReadingHoldMs } from 'main/sentient-sims/constants';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { assignVoicesToSpeakers } from 'main/sentient-sims/formatter/VoiceAssignment';
import { AudioPlaybackHandle, playAudioUrl } from './audioPlayback';
import { pacedDelay } from './playbackClock';
import { SpeakOptions, TTSHook } from './TTSHook';

// The lines either side of the one being spoken; only ElevenLabs reads them
export type LineContext = { previousText?: string; nextText?: string };

export type SpeechAudioResult = { url: string } | { error: string };

export type SpeechSource = {
  // Voices picked in settings, for a speaker without a cast voice
  pool: string[];
  noVoiceError: string;
  // Fetches one utterance's audio as an object URL
  fetchAudio: (text: string, voice: string[], context?: LineContext) => Promise<SpeechAudioResult>;
  // speak() plays sentence by sentence, so the first one starts while the rest generate
  toSentences: (text: string) => Promise<string[]>;
  // What to send for one dialogue line; the line's own text when absent
  lineRequest?: (lines: DialogueLine[], index: number) => { text: string; context?: LineContext };
};

type QueuedSpeech = { text: string; voice: string[]; followsClock: boolean };
type QueuedAudio = { url: string; followsClock: boolean };

/**
 * Queueing, pacing and playback for a text-to-speech service that answers one request with
 * one whole clip. The Sentient Sims AI service and a self-hosted Kokoro server both speak
 * through it and differ only in their SpeechSource.
 */
export function useSpeechPlayback(source: SpeechSource): TTSHook {
  const { pool, noVoiceError, fetchAudio, toSentences, lineRequest } = source;
  const aiSettings = useAISettings();

  const [error, setError] = useState<string | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);

  const sentenceQueueRef = useRef<QueuedSpeech[]>([]);
  const audioUrlQueueRef = useRef<QueuedAudio[]>([]);

  const playerRunningRef = useRef(false);
  const fetcherRunningRef = useRef(false);

  const currentPlaybackRef = useRef<AudioPlaybackHandle | null>(null);

  // Bumped by stop() and by each new speakLines run so an in-flight paced loop bails out
  const speakSessionRef = useRef(0);

  // Returns null on failure, with the reason left in `error`
  const fetchAudioUrl = useCallback(
    async (text: string, voice: string[], context?: LineContext): Promise<string | null> => {
      if (voice.length === 0) {
        setError(noVoiceError);
        return null;
      }

      const result = await fetchAudio(text, voice, context);
      if ('error' in result) {
        setError(result.error);
        return null;
      }
      return result.url;
    },
    [fetchAudio, noVoiceError],
  );

  const fetcherLoop = useCallback(async () => {
    if (fetcherRunningRef.current) return;
    fetcherRunningRef.current = true;

    while (sentenceQueueRef.current.length > 0) {
      const item = sentenceQueueRef.current.shift();
      if (!item) continue;
      const audioUrl = await fetchAudioUrl(item.text, item.voice);
      if (!audioUrl) {
        // Sentences left behind would keep waitForIdle spinning and play ahead of the next speak()
        sentenceQueueRef.current = [];
        break;
      }
      audioUrlQueueRef.current.push({ url: audioUrl, followsClock: item.followsClock });
    }

    fetcherRunningRef.current = false;
    log.debug('TTS fetcher loop finished.');
  }, [fetchAudioUrl]);

  // The Consumer: Plays audio from the audioUrlQueueRef as it becomes available
  const playerLoop = useCallback(async () => {
    if (playerRunningRef.current) return;
    playerRunningRef.current = true;
    setIsPlaying(true);
    setError(undefined);

    while (audioUrlQueueRef.current.length > 0 || fetcherRunningRef.current) {
      if (audioUrlQueueRef.current.length > 0) {
        const queued = audioUrlQueueRef.current.shift();
        if (!queued) continue;
        const audioUrl = queued.url;

        try {
          const playback = await playAudioUrl(audioUrl, aiSettings.ttsVolume, { followsClock: queued.followsClock });
          currentPlaybackRef.current = playback;
          await playback.finished;
        } catch (err) {
          // DOMExceptions don't survive electron-log's IPC serialization — stringify here
          log.error(`Error playing audio: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`);
          setError('An error occurred during audio playback.');
        } finally {
          currentPlaybackRef.current = null;
          URL.revokeObjectURL(audioUrl);
        }
      } else {
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
      }
    }

    playerRunningRef.current = false;
    setIsPlaying(false);
    log.debug('TTS player loop finished.');
  }, [aiSettings.ttsVolume]);

  // Resolves once every queued sentence has been fetched and played, so callers can
  // await full playback and serialize one scene after another
  const waitForIdle = useCallback(async () => {
    while (
      fetcherRunningRef.current ||
      playerRunningRef.current ||
      sentenceQueueRef.current.length > 0 ||
      audioUrlQueueRef.current.length > 0
    ) {
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    }
  }, []);

  const speak = useCallback(
    async (text: string, speakOptions?: SpeakOptions) => {
      const followsClock = speakOptions?.followsClock ?? true;

      let sentences: string[];
      try {
        sentences = await toSentences(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return;
      }

      if (sentences.length === 0) {
        log.error('TTS: no sentences to speak.');
        return;
      }

      sentences.forEach((sentence) => sentenceQueueRef.current.push({ text: sentence, voice: pool, followsClock }));
      log.debug(`TTS: queued ${sentences.length} sentences.`);
      void fetcherLoop();
      void playerLoop();
      await waitForIdle();
    },
    [pool, toSentences, fetcherLoop, playerLoop, waitForIdle],
  );

  const speakLines = useCallback(
    async (
      lines: DialogueLine[],
      onLineStart?: (line: DialogueLine, voiced: boolean) => void,
      onLineEnd?: (line: DialogueLine) => void,
      shouldContinue?: (nextIndex: number, entries: DialogueLine[]) => boolean,
    ): Promise<void> => {
      if (lines.length === 0) return;

      // Lines carrying a cast/pinned voice don't need the settings pool; only speakers
      // without one (e.g. the Narrator) fall back to it
      const uncastSpeakers = lines.filter((line) => !line.voiceId).map((line) => line.speaker);
      if (pool.length === 0 && uncastSpeakers.length > 0) {
        setError(noVoiceError);
        return;
      }

      const assignments = assignVoicesToSpeakers(uncastSpeakers, pool);
      const lineVoice = (line: DialogueLine): string[] => {
        // A cast voice is a single voice or a Kokoro blend like 'af_heart+af_sky'
        log.info(`[TTS] Line for ${line.speaker}: voice=${line.voiceId ?? '(default, no cast voice)'}`);
        if (line.voiceId) {
          return line.voiceId.split('+');
        }
        return assignments.get(line.speaker) ?? pool;
      };

      speakSessionRef.current += 1;
      const session = speakSessionRef.current;
      setIsPlaying(true);
      setError(undefined);

      // Conversation pacing: each line runs for exactly its audio's duration, with the
      // next line's audio prefetched while this one plays so lines flow back-to-back
      const audioPromises: (Promise<string | null> | undefined)[] = [];
      const startFetch = (index: number) => {
        if (index < lines.length && !audioPromises[index]) {
          const line = lines[index];
          const { text, context } = lineRequest ? lineRequest(lines, index) : { text: line.text };
          audioPromises[index] = fetchAudioUrl(text, lineVoice(line), context);
        }
      };
      startFetch(0);

      log.debug(`TTS: playing ${lines.length} dialogue lines paced to their audio.`);
      try {
        for (let i = 0; i < lines.length; i += 1) {
          if (speakSessionRef.current !== session) break;
          // The conversation ended while the previous line was playing; that line got
          // to finish, this one never starts
          if (shouldContinue && !shouldContinue(i, lines)) break;
          startFetch(i + 1);
          const audioUrl = (await audioPromises[i]) ?? null;
          if (speakSessionRef.current !== session) {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            break;
          }

          onLineStart?.(lines[i], audioUrl !== null);
          try {
            if (audioUrl) {
              try {
                const playback = await playAudioUrl(audioUrl, aiSettings.ttsVolume, {
                  followsClock: lines[i].followsClock,
                });
                currentPlaybackRef.current = playback;
                await playback.finished;
              } catch (err) {
                log.error(`Error playing audio: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`);
                setError('An error occurred during audio playback.');
              } finally {
                currentPlaybackRef.current = null;
                URL.revokeObjectURL(audioUrl);
              }
            } else {
              // No audio to time the subtitle — hold for its reading time instead
              // (paced: scales with game speed, freezes on a user pause — V-1)
              await pacedDelay(sceneLineReadingHoldMs(lines[i].text));
            }
          } finally {
            // Whatever ended the line (audio done, error, stop()), the mod hears it
            onLineEnd?.(lines[i]);
          }

          if (i < lines.length - 1 && speakSessionRef.current === session) {
            // A scene that will not go on skips the gap too (see useElevenLabsTTS)
            if (shouldContinue && !shouldContinue(i + 1, lines)) break;
            await pacedDelay(lines[i].continues ? sceneChunkGapMs : sceneLineGapMs);
          }
        }
      } finally {
        // Release any prefetched audio that never played (cancelled session)
        const leftovers = await Promise.allSettled(audioPromises.filter(Boolean) as Promise<string | null>[]);
        leftovers.forEach((settled) => {
          if (settled.status === 'fulfilled' && settled.value && speakSessionRef.current !== session) {
            URL.revokeObjectURL(settled.value);
          }
        });
        setIsPlaying(false);
      }
    },
    [pool, noVoiceError, lineRequest, fetchAudioUrl, aiSettings.ttsVolume],
  );

  const stopTTS = useCallback(() => {
    log.debug('Stop TTS called.');
    speakSessionRef.current += 1;
    if (currentPlaybackRef.current) {
      currentPlaybackRef.current.stop();
      currentPlaybackRef.current = null;
    }

    sentenceQueueRef.current = [];
    audioUrlQueueRef.current.forEach((queued) => {
      URL.revokeObjectURL(queued.url);
    });
    audioUrlQueueRef.current = [];

    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      audioUrlQueueRef.current.forEach((queued) => {
        URL.revokeObjectURL(queued.url);
      });
    };
  }, []);

  return { speak, speakLines, stop: stopTTS, isPlaying, error };
}
