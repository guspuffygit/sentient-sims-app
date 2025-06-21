/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import { useState, useCallback, useRef, useEffect } from 'react';
import log from 'electron-log';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import { sentientSimsAIHost } from 'main/sentient-sims/constants';
import {
  defaultSentientSimsAITTSSettings,
  SentientSimsAITTSSettings,
} from 'main/sentient-sims/models/SentientSimsAITTSSettings';
import { axiosClient } from 'main/sentient-sims/clients/AxiosClient';
import { SentenceTokenizeResponse } from 'main/sentient-sims/models/SentenceTokenizeResponse';
import { SentenceTokenizeRequest } from 'main/sentient-sims/models/SentenceTokenizerRequest';
import { TTSHook } from './TTSHook';

export function useSentientSimsTTS(): TTSHook {
  const aiSettings = useAISettings();
  const sentientSimsAIEndpointSetting = useSetting<string>(
    SettingsEnum.SENTIENTSIMSAI_ENDPOINT,
    sentientSimsAIHost,
  );
  const sentientSimsAITokenSetting = useSetting<string>(
    SettingsEnum.ACCESS_TOKEN,
    '',
  );
  const sentientSimsAITTSSettings = useSetting<SentientSimsAITTSSettings>(
    SettingsEnum.SENTIENTSIMSAI_TTS_SETTINGS,
    defaultSentientSimsAITTSSettings,
  );

  const [error, setError] = useState<string | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);

  const sentenceQueueRef = useRef<string[]>([]);
  const audioUrlQueueRef = useRef<string[]>([]);

  const playerRunningRef = useRef(false);
  const fetcherRunningRef = useRef(false);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const fetcherLoop = useCallback(async () => {
    if (fetcherRunningRef.current) return;
    fetcherRunningRef.current = true;

    while (sentenceQueueRef.current.length > 0) {
      const text = sentenceQueueRef.current.shift();
      if (!text) continue;

      log.debug(`Sentient Sims TTS Fetcher: Fetching audio for "${text}"`);

      if (sentientSimsAITTSSettings.value.voice.length === 0) {
        setError('At least one Sentient Sims Voice must be selected');
        sentenceQueueRef.current = [];
        audioUrlQueueRef.current = [];
        break;
      }

      const requestBody = {
        model: sentientSimsAITTSSettings.value.model,
        input: text,
        voice: sentientSimsAITTSSettings.value.voice.join('+'),
        response_format: sentientSimsAITTSSettings.value.response_format,
        speed:
          sentientSimsAITTSSettings.value.speed ??
          defaultSentientSimsAITTSSettings.speed,
      };

      const url = `${sentientSimsAIEndpointSetting.value}/v2/audio/speech`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authentication: sentientSimsAITokenSetting.value,
            'sentient-sims-model': requestBody.model,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorMessage = `Unable to fetch audio: ${response.status}`;
          log.error(errorMessage);
          try {
            const bodyResponse = await response.text();
            log.error(bodyResponse);
            setError(bodyResponse);
          } catch (err: any) {
            setError(errorMessage);
          }
          sentenceQueueRef.current = [];
          audioUrlQueueRef.current = [];
          break;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        log.debug(`Audio URL created and queued: ${audioUrl}`);
        audioUrlQueueRef.current.push(audioUrl);
      } catch (err: any) {
        const errorMessage = `TTS request failed: ${err.message}`;
        log.error(errorMessage);
        setError(errorMessage);
        sentenceQueueRef.current = [];
        audioUrlQueueRef.current = [];
        break;
      }
    }

    fetcherRunningRef.current = false;
    log.debug('Fetcher loop finished.');
  }, [
    sentientSimsAITTSSettings.value,
    sentientSimsAIEndpointSetting.value,
    sentientSimsAITokenSetting.value,
  ]);

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
        const audio = new Audio(audioUrl);
        audio.volume = aiSettings.ttsVolume;
        currentAudioRef.current = audio;

        await new Promise<void>((resolve) => {
          audio.onended = () => {
            log.debug('Audio finished playing.');
            currentAudioRef.current = null;
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.onerror = () => {
            log.error('Error playing audio element.');
            setError('An error occurred during audio playback.');
            currentAudioRef.current = null;
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.play();
        });
      } else {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      }
    }

    playerRunningRef.current = false;
    setIsPlaying(false);
    log.debug('Player loop finished.');
  }, [aiSettings.ttsVolume]);

  const speak = useCallback(
    async (text: string) => {
      log.debug(`Sentient Sims Voice Speak called: ${text}`);

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      sentenceQueueRef.current = [];
      audioUrlQueueRef.current = [];

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

        if (sentences?.length > 0) {
          sentenceQueueRef.current = sentences;
          log.debug(
            `Queued ${sentences.length} sentences. Starting fetcher and player.`,
          );
          fetcherLoop();
          playerLoop();
        } else {
          log.error('No sentences returned from tokenization.');
        }
      } catch (err: any) {
        const errorMessage = `Sentence tokenization failed: ${err.message}`;
        log.error(errorMessage, err.response?.data);
        setError(errorMessage);
      }
    },
    [
      sentientSimsAIEndpointSetting.value,
      sentientSimsAITokenSetting.value,
      fetcherLoop,
      playerLoop,
    ],
  );

  const stopTTS = useCallback(() => {
    log.debug('Stop TTS called.');
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
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

  return { speak, stop: stopTTS, isPlaying, error };
}
