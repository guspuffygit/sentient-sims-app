/* eslint-disable no-await-in-loop */
import { useState, useCallback, useRef } from 'react';
import log from 'electron-log';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import { sentientSimsAIHost } from 'main/sentient-sims/constants';
import {
  defaultSentientSimsAITTSSettings,
  SentientSimsAITTSSettings,
} from 'main/sentient-sims/models/SentientSimsAITTSSettings';
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
  const queueRef = useRef<string[]>([]);
  const processing = useRef(false);
  const [, setTick] = useState(0);

  const [audioSource, setAudioSource] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | undefined>();

  const processQueue = useCallback(async (): Promise<void> => {
    if (processing.current) return; // Exit if processing is already underway
    processing.current = true;

    setError(undefined);

    while (queueRef.current.length > 0) {
      const text = queueRef.current.shift();
      log.debug(`Sentient Sims TTS: ${text}`);

      if (sentientSimsAITTSSettings.value.voice.length === 0) {
        setError('At least one Sentient Sims Voice must be selected');
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

      const url = `${sentientSimsAIEndpointSetting.value}/v1/audio/speech`;
      log.debug(`URL: ${url} Body: ${JSON.stringify(requestBody, null, 2)}`);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authentication: sentientSimsAITokenSetting.value,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorMessage = `Unable to stream audio: ${response.status}`;
          log.error(errorMessage);

          try {
            const bodyResponse = await response.text();
            log.error(bodyResponse);
            setError(bodyResponse);
          } catch (err: any) {
            setError(errorMessage);
          }

          break;
        }

        const audioUrl = URL.createObjectURL(await response.blob());
        log.debug(`Audio URL: ${audioUrl}`);

        const audio = new Audio(audioUrl);
        audio.volume = aiSettings.ttsVolume;

        setAudioSource(audio); // Store reference for stopping

        await new Promise<void>((resolve) => {
          audio.onended = () => {
            setAudioSource(null);
            resolve();
          };
          audio.play();
        });
      } catch (err: any) {
        const errorMessage = `TTS request failed: ${error}`;
        log.error(errorMessage);
        setError(errorMessage);
        break;
      }
    }

    processing.current = false;
  }, [
    sentientSimsAITTSSettings.value.voice,
    sentientSimsAITTSSettings.value.model,
    sentientSimsAITTSSettings.value.response_format,
    sentientSimsAITTSSettings.value.speed,
    sentientSimsAIEndpointSetting.value,
    sentientSimsAITokenSetting.value,
    aiSettings.ttsVolume,
    error,
  ]);

  const speak = useCallback(
    (text: string) => {
      log.debug(`Sentient Sims Voice Speak called: ${text}`);
      queueRef.current.push(text);
      // Optionally update state if you want to re-render when the queue changes
      setTick((t) => t + 1);
      processQueue();
      log.debug(`Queue done processing?`);
    },
    [processQueue],
  );

  const stopTTS = useCallback(() => {
    if (audioSource) {
      audioSource.pause();
      setAudioSource(null);
    }
  }, [audioSource]);

  return { speak, stop: stopTTS, isPlaying: !!audioSource, error };
}
