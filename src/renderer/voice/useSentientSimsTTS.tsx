/* eslint-disable @typescript-eslint/unbound-method */
import { useState, useCallback, useRef, useEffect } from 'react';
import log from 'electron-log';
import axios from 'axios';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import { defaultSentientSimsAIHost, sceneLineGapMs, sceneLineReadingHoldMs } from 'main/sentient-sims/constants';
import {
  defaultSentientSimsAITTSSettings,
  SentientSimsAITTSSettings,
} from 'main/sentient-sims/models/SentientSimsAITTSSettings';
import { axiosClient } from 'main/sentient-sims/clients/AxiosClient';
import { SentenceTokenizeResponse } from 'main/sentient-sims/models/SentenceTokenizeResponse';
import { SentenceTokenizeRequest } from 'main/sentient-sims/models/SentenceTokenizerRequest';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { assignVoicesToSpeakers } from 'main/sentient-sims/formatter/VoiceAssignment';
import { AudioPlaybackHandle, playAudioUrl } from './audioPlayback';
import { TTSHook } from './TTSHook';

type QueuedSpeech = { text: string; voice: string[] };

export function useSentientSimsTTS(): TTSHook {
  const aiSettings = useAISettings();
  const sentientSimsAIEndpointSetting = useSetting<string>(
    SettingsEnum.SENTIENTSIMSAI_ENDPOINT,
    defaultSentientSimsAIHost,
  );
  const sentientSimsAITokenSetting = useSetting<string>(SettingsEnum.ACCESS_TOKEN, '');
  const sentientSimsAITTSSettings = useSetting<SentientSimsAITTSSettings>(
    SettingsEnum.SENTIENTSIMSAI_TTS_SETTINGS,
    defaultSentientSimsAITTSSettings,
  );

  const [error, setError] = useState<string | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);

  const sentenceQueueRef = useRef<QueuedSpeech[]>([]);
  const audioUrlQueueRef = useRef<string[]>([]);

  const playerRunningRef = useRef(false);
  const fetcherRunningRef = useRef(false);

  const currentPlaybackRef = useRef<AudioPlaybackHandle | null>(null);

  // Bumped by stop() and by each new speakLines run so an in-flight paced loop bails out
  const speakSessionRef = useRef(0);

  // Fetches one utterance's audio and returns an object URL, or null on failure
  const fetchAudioUrl = useCallback(
    async (text: string, voice: string[]): Promise<string | null> => {
      log.debug(`Sentient Sims TTS Fetcher: Fetching audio for "${text}"`);

      if (voice.length === 0) {
        setError('At least one Sentient Sims Voice must be selected');
        return null;
      }

      const requestBody = {
        model: sentientSimsAITTSSettings.value.model,
        input: text,
        voice: voice.join('+'),
        response_format: sentientSimsAITTSSettings.value.response_format,
        speed: sentientSimsAITTSSettings.value.speed ?? defaultSentientSimsAITTSSettings.speed,
      };

      const url = `${sentientSimsAIEndpointSetting.value}/v2/audio/speech`;

      try {
        const doFetch = () =>
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication': sentientSimsAITokenSetting.value,
              'sentient-sims-model': requestBody.model,
            },
            body: JSON.stringify(requestBody),
          });

        let response = await doFetch();
        // Gateway hiccups (502/503 from a worker restart) are usually momentary —
        // one retry saves the line instead of dropping it to a silent subtitle
        if (response.status >= 500) {
          log.debug(`TTS returned ${response.status}, retrying once`);
          await new Promise((resolve) => {
            setTimeout(resolve, 500);
          });
          response = await doFetch();
        }

        if (!response.ok) {
          const errorMessage = `Unable to fetch audio: ${response.status}`;
          log.error(errorMessage);
          try {
            const bodyResponse = await response.text();
            log.error(bodyResponse);
            setError(bodyResponse);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err: any) {
            setError(errorMessage);
          }
          return null;
        }

        // A half-dead gateway can 200 with an HTML error page, which then blows up
        // audio decoding — treat anything that isn't audio bytes as a failed fetch
        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('text/html') || contentType.includes('application/json')) {
          const bodyText = await response.text();
          log.error(`TTS returned non-audio response (${contentType}): ${bodyText.slice(0, 200)}`);
          setError('TTS server returned a non-audio response');
          return null;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        log.debug(`Audio URL created: ${audioUrl}`);
        return audioUrl;
      } catch (err) {
        const errorMessage = `TTS request failed: ${err instanceof Error ? err.message : String(err)}`;
        log.error(errorMessage);
        setError(errorMessage);
        return null;
      }
    },
    [sentientSimsAITTSSettings.value, sentientSimsAIEndpointSetting.value, sentientSimsAITokenSetting.value],
  );

  const fetcherLoop = useCallback(async () => {
    if (fetcherRunningRef.current) return;
    fetcherRunningRef.current = true;

    while (sentenceQueueRef.current.length > 0) {
      const item = sentenceQueueRef.current.shift();
      if (!item) continue;
      const audioUrl = await fetchAudioUrl(item.text, item.voice);
      if (!audioUrl) break;
      audioUrlQueueRef.current.push(audioUrl);
    }

    fetcherRunningRef.current = false;
    log.debug('Fetcher loop finished.');
  }, [fetchAudioUrl]);

  // The Consumer: Plays audio from the audioUrlQueueRef as it becomes available
  const playerLoop = useCallback(async () => {
    if (playerRunningRef.current) return;
    playerRunningRef.current = true;
    setIsPlaying(true);
    setError(undefined);

    while (audioUrlQueueRef.current.length > 0 || fetcherRunningRef.current) {
      if (audioUrlQueueRef.current.length > 0) {
        const audioUrl = audioUrlQueueRef.current.shift();
        if (!audioUrl) continue;

        log.debug(`Player: Playing audio from URL: ${audioUrl}`);
        try {
          const playback = await playAudioUrl(audioUrl, aiSettings.ttsVolume);
          currentPlaybackRef.current = playback;
          await playback.finished;
          log.debug('Audio finished playing.');
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
    log.debug('Player loop finished.');
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
    async (text: string) => {
      log.debug(`Sentient Sims Voice Speak called: ${text}`);

      try {
        const request: SentenceTokenizeRequest = { paragraph: text };
        const options = {
          url: '/sent-tokenize',
          method: 'POST',
          data: request,
          baseURL: sentientSimsAIEndpointSetting.value,
          headers: { Authentication: sentientSimsAITokenSetting.value },
          timeout: 65000,
        };
        const response = await axiosClient<SentenceTokenizeResponse>(options);
        const { sentences } = response.data;

        if (sentences.length > 0) {
          sentences.forEach((sentence) =>
            sentenceQueueRef.current.push({ text: sentence, voice: sentientSimsAITTSSettings.value.voice }),
          );
          log.debug(`Queued ${sentences.length} sentences. Starting fetcher and player.`);
          void fetcherLoop();
          void playerLoop();
          await waitForIdle();
        } else {
          log.error('No sentences returned from tokenization.');
        }
      } catch (err) {
        const errorMessage = `Sentence tokenization failed: ${err instanceof Error ? err.message : String(err)}`;
        const responseData: unknown = axios.isAxiosError(err) ? err.response?.data : undefined;
        log.error(errorMessage, responseData);
        setError(errorMessage);
      }
    },
    [
      sentientSimsAIEndpointSetting.value,
      sentientSimsAITokenSetting.value,
      sentientSimsAITTSSettings.value,
      fetcherLoop,
      playerLoop,
      waitForIdle,
    ],
  );

  const speakLines = useCallback(
    async (lines: DialogueLine[], onLineStart?: (line: DialogueLine) => void): Promise<void> => {
      if (lines.length === 0) return;

      const pool = sentientSimsAITTSSettings.value.voice;
      // Lines carrying a cast/pinned voice don't need the settings pool; only speakers
      // without one (e.g. the Narrator) fall back to it
      const uncastSpeakers = lines.filter((line) => !line.voiceId).map((line) => line.speaker);
      if (pool.length === 0 && uncastSpeakers.length > 0) {
        setError('At least one Sentient Sims Voice must be selected');
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

      log.debug(`Playing ${lines.length} dialogue lines paced to their audio.`);
      try {
        for (let i = 0; i < lines.length; i += 1) {
          if (speakSessionRef.current !== session) break;
          startFetch(i + 1);
          const audioUrl = (await audioPromises[i]) ?? null;
          if (speakSessionRef.current !== session) {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            break;
          }

          onLineStart?.(lines[i]);
          if (audioUrl) {
            try {
              const playback = await playAudioUrl(audioUrl, aiSettings.ttsVolume);
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
            await new Promise((resolve) => {
              setTimeout(resolve, sceneLineReadingHoldMs(lines[i].text));
            });
          }

          if (i < lines.length - 1 && speakSessionRef.current === session) {
            await new Promise((resolve) => {
              setTimeout(resolve, sceneLineGapMs);
            });
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
    [sentientSimsAITTSSettings.value, fetchAudioUrl, aiSettings.ttsVolume],
  );

  const stopTTS = useCallback(() => {
    log.debug('Stop TTS called.');
    speakSessionRef.current += 1;
    if (currentPlaybackRef.current) {
      currentPlaybackRef.current.stop();
      currentPlaybackRef.current = null;
    }

    sentenceQueueRef.current = [];
    audioUrlQueueRef.current.forEach(URL.revokeObjectURL);
    audioUrlQueueRef.current = [];

    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      audioUrlQueueRef.current.forEach(URL.revokeObjectURL);
    };
  }, []);

  return { speak, speakLines, stop: stopTTS, isPlaying, error };
}
