import { useState, useCallback } from 'react';
import log from 'electron-log';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { defaultElevenLabsEndpoint } from 'main/sentient-sims/constants';
import useSetting from 'renderer/hooks/useSetting';
import { defaultElevenLabsTTSSettings, ElevenLabsTTSSettings } from 'main/sentient-sims/models/ElevenLabsTTSSettings';
import { TTSHook } from './TTSHook';

export function useElevenLabsTTS(): TTSHook {
  const aiSettings = useAISettings();
  const elevenLabsKeySetting = useSetting<string>(SettingsEnum.ELEVENLABS_KEY, '');
  const elevenLabsEndpointSetting = useSetting<string>(SettingsEnum.ELEVENLABS_ENDPOINT, defaultElevenLabsEndpoint);
  const elevenLabsTTSSettings = useSetting<ElevenLabsTTSSettings>(
    SettingsEnum.ELEVENLABS_TTS_SETTINGS,
    defaultElevenLabsTTSSettings,
  );
  const [audioSource, setAudioSource] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | undefined>();

  const tts = useCallback(
    async (text: string): Promise<void> => {
      setError(undefined);

      if (!text.trim()) return;

      try {
        const requestBody = {
          text,
          voice_settings: {
            stability: 0,
            similarity_boost: 0,
          },
        };

        const url = `${elevenLabsEndpointSetting.value}/text-to-speech/${elevenLabsTTSSettings.value.voice}`;
        log.debug(`URL: ${url} Body: ${JSON.stringify(requestBody, null, 2)}`);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsKeySetting.value,
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err: any) {
            setError(errorMessage);
          }

          return;
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err: any) {
        const errorMessage = `TTS request failed: ${error}`;
        log.error(errorMessage);
        setError(errorMessage);
      }
    },
    [
      elevenLabsKeySetting.value,
      elevenLabsEndpointSetting.value,
      elevenLabsTTSSettings.value.voice,
      aiSettings.ttsVolume,
      error,
    ],
  );

  const stopTTS = useCallback(() => {
    if (audioSource) {
      audioSource.pause();
      setAudioSource(null);
    }
  }, [audioSource]);

  return { speak: tts, stop: stopTTS, isPlaying: !!audioSource, error };
}
