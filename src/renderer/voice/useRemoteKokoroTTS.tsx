import { useState, useCallback } from 'react';
import axios from 'axios';
import log from 'electron-log';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import {
  defaultKokoroAITTSSettings,
  KokoroAITTSSettings,
} from 'main/sentient-sims/models/KokoroAITTSSettings';
import { TTSHook } from './TTSHook';

export function useRemoteKokoroTTS(): TTSHook {
  const aiSettings = useAISettings();
  const kokoroTTSSettings = useSetting<KokoroAITTSSettings>(
    SettingsEnum.KOKOROAI_TTS_SETTINGS,
    defaultKokoroAITTSSettings,
  );
  const [audioSource, setAudioSource] = useState<HTMLAudioElement | null>(null);

  const tts = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) return;

      const requestBody = {
        model: kokoroTTSSettings.value.model,
        input: text,
        voice: kokoroTTSSettings.value.voice,
        response_format: kokoroTTSSettings.value.response_format,
        speed: 1.0,
      };

      const url = 'https://api.kokorotts.com/v1/audio/speech';
      log.debug(`URL: ${url} Body: ${JSON.stringify(requestBody, null, 2)}`);

      try {
        const response = await axios.post(url, requestBody, {
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        });

        if (response.status !== 200) {
          log.error(`Unable to stream kokoro audio: ${response.status}`);
          return;
        }

        const audioUrl = URL.createObjectURL(response.data);
        log.debug(`Audio URL: ${audioUrl}`);

        const audio = new Audio(audioUrl);
        audio.volume = aiSettings.ttsVolume;

        setAudioSource(audio); // Store reference for stopping

        audio.play();

        audio.onended = () => {
          setAudioSource(null);
        };
      } catch (error) {
        log.error(`TTS request failed: ${error}`);
      }
    },
    [
      kokoroTTSSettings.value.model,
      kokoroTTSSettings.value.voice,
      kokoroTTSSettings.value.response_format,
      aiSettings.ttsVolume,
    ],
  );

  const stopTTS = useCallback(() => {
    if (audioSource) {
      audioSource.pause();
      setAudioSource(null);
    }
  }, [audioSource]);

  return { speak: tts, stop: stopTTS, isPlaying: !!audioSource };
}
