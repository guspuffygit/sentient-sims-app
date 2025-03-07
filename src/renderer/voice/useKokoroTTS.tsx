import { useState, useCallback, useEffect } from 'react';
import log from 'electron-log';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import {
  defaultKokoroAITTSSettings,
  KokoroAITTSSettings,
  KokoroType,
} from 'main/sentient-sims/models/KokoroAITTSSettings';
import { KokoroTTS } from 'renderer/kokoro/kokoro';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { defaultKokoroEndpoint } from 'main/sentient-sims/constants';
import { TTSHook } from './TTSHook';

const modelId = 'onnx-community/Kokoro-82M-v1.0-ONNX';

export type KokoroTTSProperties = {
  isWebGPUSupported: boolean | null;
};

export function useKokoroTTS({
  isWebGPUSupported,
}: KokoroTTSProperties): TTSHook {
  const aiSettings = useAISettings();
  const kokoroTTSSettings = useSetting<KokoroAITTSSettings>(
    SettingsEnum.KOKOROAI_TTS_SETTINGS,
    defaultKokoroAITTSSettings,
  );
  const kokoroEndpointSetting = useSetting<string>(
    SettingsEnum.KOKOROAI_ENDPOINT,
    defaultKokoroEndpoint,
  );
  const [audioSource, setAudioSource] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [kokoroTTS, setKokoroTTS] = useState<KokoroTTS | undefined>();

  useEffect(() => {
    async function loadTTS() {
      setError(undefined);

      if (
        aiSettings.ttsApiType === ApiType.Kokoro &&
        isWebGPUSupported &&
        kokoroTTSSettings.value.type === KokoroType.WebGPU
      ) {
        try {
          const ttsModel = await KokoroTTS.from_pretrained(modelId, {
            dtype: 'fp32',
            device: 'webgpu',
          });
          setKokoroTTS(ttsModel);
        } catch (err) {
          log.error(`Unable to load WebGPU Kokoro`, err);
          setError(`Unable to load WebGPU Kokoro ${err}`);
        }
      }
    }

    loadTTS();
  }, [aiSettings.ttsApiType, isWebGPUSupported, kokoroTTSSettings.value.type]);

  const tts = useCallback(
    async (text: string): Promise<void> => {
      setError(undefined);
      if (!text.trim()) return;

      const requestBody = {
        model: kokoroTTSSettings.value.model,
        input: text,
        voice: kokoroTTSSettings.value.voice.join('+'),
        response_format: kokoroTTSSettings.value.response_format,
        speed: 1.0,
      };

      const url = `${kokoroEndpointSetting.value}/v1/audio/speech`;
      log.debug(`URL: ${url} Body: ${JSON.stringify(requestBody, null, 2)}`);

      let audioUrl: string | undefined;

      try {
        if (kokoroTTSSettings.value.type === KokoroType.Remote) {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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

            return;
          }

          audioUrl = URL.createObjectURL(await response.blob());
        } else if (kokoroTTSSettings.value.type === KokoroType.WebGPU) {
          if (isWebGPUSupported) {
            if (!kokoroTTS) {
              const errorMessage = 'Kokoro WebGPU was unable to be loaded.';
              log.error(errorMessage);
              setError(errorMessage);
              return;
            }

            const rawAudio = await kokoroTTS.generate(text, {
              voice: kokoroTTS.getVoice(kokoroTTSSettings.value.voice[0]),
              speed: 1,
            });
            audioUrl = URL.createObjectURL(
              new Blob([rawAudio.toWav()], { type: 'audio/wav' }),
            );
          } else {
            const errorMessage =
              'WebGPU is not supported in this runtime environment. Use a third-party TTS service instead.';
            log.error(errorMessage);
            setError(errorMessage);
            return;
          }
        }

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
        const errorMessage = `Request Failed: ${err}`;
        log.error(errorMessage);
        setError(errorMessage);
      }
    },
    [
      kokoroTTSSettings.value.model,
      kokoroTTSSettings.value.voice,
      kokoroTTSSettings.value.response_format,
      kokoroTTSSettings.value.type,
      kokoroEndpointSetting.value,
      aiSettings.ttsVolume,
      isWebGPUSupported,
      kokoroTTS,
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
