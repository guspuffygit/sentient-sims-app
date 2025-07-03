import { useState, useCallback, useEffect } from 'react';
import log from 'electron-log';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import {
  defaultKokoroAITTSSettings,
  KokoroAITTSSettings,
} from 'main/sentient-sims/models/KokoroAITTSSettings';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { KokoroTTS } from 'renderer/kokoro/kokoro';
import { TTSHook } from './TTSHook';

const modelId = 'onnx-community/Kokoro-82M-v1.0-ONNX';

export type WebGPUKokoroTTSProperties = {
  isWebGPUSupported: boolean | null;
};

export function useWebGPUKokoro({
  isWebGPUSupported,
}: WebGPUKokoroTTSProperties): TTSHook {
  const aiSettings = useAISettings();
  const kokoroTTSSettings = useSetting<KokoroAITTSSettings>(
    SettingsEnum.KOKOROAI_TTS_SETTINGS,
    defaultKokoroAITTSSettings,
  );
  const [audioSource, setAudioSource] = useState<HTMLAudioElement | null>(null);
  const [kokoroTTS, setKokoroTTS] = useState<KokoroTTS | undefined>();

  useEffect(() => {
    async function loadTTS() {
      if (aiSettings.ttsApiType === ApiType.Kokoro && isWebGPUSupported) {
        try {
          const ttsModel = await KokoroTTS.from_pretrained(modelId, {
            dtype: 'fp32',
            device: 'webgpu',
          });
          setKokoroTTS(ttsModel);
        } catch (err) {
          log.error(`Unable to load WebGPU Kokoro`, err);
        }
      }
    }

    loadTTS();
  }, [aiSettings.ttsApiType, isWebGPUSupported]);

  const tts = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) return;

      if (!kokoroTTS) return;

      try {
        const rawAudio = await kokoroTTS.generate(text, {
          voice: kokoroTTS.getVoice(kokoroTTSSettings.value.voice),
          speed: 1,
        });
        const audioUrl = URL.createObjectURL(
          new Blob([rawAudio.toWav()], { type: 'audio/wav' }),
        );
        log.debug(`Audio URL: ${audioUrl}`);

        const audio = new Audio(audioUrl);
        audio.volume = aiSettings.ttsVolume;

        setAudioSource(audio);

        audio.play();

        audio.onended = () => {
          setAudioSource(null);
        };
      } catch (error) {
        log.error(`Kokoro WebGPU TTS request failed`, error);
      }
    },
    [kokoroTTS, kokoroTTSSettings.value.voice, aiSettings.ttsVolume],
  );

  const stopTTS = useCallback(() => {
    if (audioSource) {
      audioSource.pause();
      setAudioSource(null);
    }
  }, [audioSource]);

  return { speak: tts, stop: stopTTS, isPlaying: !!audioSource };
}
