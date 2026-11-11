import { useState, useCallback, useRef, useEffect } from 'react';
import log from 'electron-log';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import {
  defaultKokoroEndpoint,
  sceneChunkGapMs,
  sceneLineGapMs,
  sceneLineReadingHoldMs,
} from 'main/sentient-sims/constants';
import { defaultKokoroAITTSSettings, KokoroAITTSSettings } from 'main/sentient-sims/models/KokoroAITTSSettings';
import { buildKokoroSpeechRequest, splitSentences } from 'main/sentient-sims/clients/KokoroTTSRequest';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { assignVoicesToSpeakers } from 'main/sentient-sims/formatter/VoiceAssignment';
import { AudioPlaybackHandle, playAudioUrl } from './audioPlayback';
import { pacedDelay } from './playbackClock';
import { SpeakOptions, TTSHook } from './TTSHook';

type QueuedSpeech = { text: string; voice: string[]; followsClock: boolean };
type QueuedAudio = { url: string; followsClock: boolean };

/**
 * Text to speech through a self-hosted Kokoro server (an OpenAI-compatible
 * /v1/audio/speech endpoint such as Kokoro-FastAPI). Same playback behaviour as the
 * Sentient Sims AI hook, minus the membership plumbing.
 */
export function useKokoroTTS(): TTSHook {
  const aiSettings = useAISettings();
  const kokoroEndpointSetting = useSetting<string>(SettingsEnum.KOKOROAI_ENDPOINT, defaultKokoroEndpoint);
  const kokoroTTSSettings = useSetting<KokoroAITTSSettings>(
    SettingsEnum.KOKOROAI_TTS_SETTINGS,
    defaultKokoroAITTSSettings,
  );

  const [error, setError] = useState<string | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);

  const sentenceQueueRef = useRef<QueuedSpeech[]>([]);
  const audioUrlQueueRef = useRef<QueuedAudio[]>([]);

  const playerRunningRef = useRef(false);
  const fetcherRunningRef = useRef(false);

  const currentPlaybackRef = useRef<AudioPlaybackHandle | null>(null);

  // Bumped by stop() and by each new speakLines run so an in-flight paced loop bails out
  const speakSessionRef = useRef(0);

  // Fetches one utterance's audio and returns an object URL, or null on failure
  const fetchAudioUrl = useCallback(
    async (text: string, voice: string[]): Promise<string | null> => {
      if (voice.length === 0) {
        setError('At least one Kokoro voice must be selected');
        return null;
      }

      const { url, headers, body } = buildKokoroSpeechRequest({
        endpoint: kokoroEndpointSetting.value,
        text,
        voice,
        model: kokoroTTSSettings.value.model,
        responseFormat: kokoroTTSSettings.value.response_format,
      });
      const startedAt = Date.now();
      log.info(`[TTS] Kokoro request voice=${body.voice} chars=${text.length}`);

      try {
        const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
        log.info(`[TTS] Kokoro response voice=${body.voice} status=${response.status} in ${Date.now() - startedAt}ms`);

        if (!response.ok) {
          const bodyText = await response.text().catch(() => '');
          log.error(`Kokoro TTS returned ${response.status}: ${bodyText.slice(0, 500)}`);
          setError(`Kokoro server returned ${response.status}${bodyText ? `: ${bodyText.slice(0, 200)}` : ''}`);
          return null;
        }

        // A server that answers 200 with a JSON or HTML page is not sending audio
        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('text/html') || contentType.includes('application/json')) {
          const bodyText = await response.text();
          log.error(`Kokoro TTS returned non-audio response (${contentType}): ${bodyText.slice(0, 200)}`);
          setError('Kokoro server returned a non-audio response');
          return null;
        }

        return URL.createObjectURL(await response.blob());
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        log.error(`Kokoro TTS request failed: ${reason}`);
        setError(`Unable to reach the Kokoro server at ${kokoroEndpointSetting.value}. Is it running? (${reason})`);
        return null;
      }
    },
    [kokoroEndpointSetting.value, kokoroTTSSettings.value],
  );

  const fetcherLoop = useCallback(async () => {
    if (fetcherRunningRef.current) return;
    fetcherRunningRef.current = true;

    while (sentenceQueueRef.current.length > 0) {
      const item = sentenceQueueRef.current.shift();
      if (!item) continue;
      const audioUrl = await fetchAudioUrl(item.text, item.voice);
      if (!audioUrl) break;
      audioUrlQueueRef.current.push({ url: audioUrl, followsClock: item.followsClock });
    }

    fetcherRunningRef.current = false;
    log.debug('Kokoro fetcher loop finished.');
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
    log.debug('Kokoro player loop finished.');
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
      const sentences = splitSentences(text);

      if (sentences.length === 0) {
        log.error('Kokoro TTS: no sentences to speak.');
        return;
      }

      sentences.forEach((sentence) =>
        sentenceQueueRef.current.push({
          text: sentence,
          voice: kokoroTTSSettings.value.voice,
          followsClock,
        }),
      );
      log.debug(`Kokoro TTS: queued ${sentences.length} sentences.`);
      void fetcherLoop();
      void playerLoop();
      await waitForIdle();
    },
    [kokoroTTSSettings.value, fetcherLoop, playerLoop, waitForIdle],
  );

  const speakLines = useCallback(
    async (
      lines: DialogueLine[],
      onLineStart?: (line: DialogueLine, voiced: boolean) => void,
      onLineEnd?: (line: DialogueLine) => void,
      shouldContinue?: (nextIndex: number, entries: DialogueLine[]) => boolean,
    ): Promise<void> => {
      if (lines.length === 0) return;

      const pool: string[] = kokoroTTSSettings.value.voice;
      // Lines carrying a cast/pinned voice don't need the settings pool; only speakers
      // without one (e.g. the Narrator) fall back to it
      const uncastSpeakers = lines.filter((line) => !line.voiceId).map((line) => line.speaker);
      if (pool.length === 0 && uncastSpeakers.length > 0) {
        setError('At least one Kokoro voice must be selected');
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
          audioPromises[index] = fetchAudioUrl(line.text, lineVoice(line));
        }
      };
      startFetch(0);

      log.debug(`Kokoro TTS: playing ${lines.length} dialogue lines paced to their audio.`);
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
              // (paced: scales with game speed, freezes on a user pause)
              await pacedDelay(sceneLineReadingHoldMs(lines[i].text));
            }
          } finally {
            // Whatever ended the line (audio done, error, stop()), the mod hears it
            onLineEnd?.(lines[i]);
          }

          if (i < lines.length - 1 && speakSessionRef.current === session) {
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
    [kokoroTTSSettings.value, fetchAudioUrl, aiSettings.ttsVolume],
  );

  const stopTTS = useCallback(() => {
    log.debug('Stop Kokoro TTS called.');
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
