import { FormHelperText } from '@mui/material';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import {
  defaultKokoroAITTSSettings,
  KokoroAITTSSettings,
  KokoroType,
} from 'main/sentient-sims/models/KokoroAITTSSettings';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { useTTS } from 'renderer/providers/AudioContextProvider';

export default function WebGpuDebug() {
  const tts = useTTS();
  const aiSettings = useAISettings();
  const kokoroaiTtsSettings = useSetting<KokoroAITTSSettings>(
    SettingsEnum.KOKOROAI_TTS_SETTINGS,
    defaultKokoroAITTSSettings,
  );

  if (
    !tts.isWebGPUSupported &&
    aiSettings.ttsEnabled &&
    aiSettings.ttsApiType === ApiType.Kokoro &&
    kokoroaiTtsSettings.value.type === KokoroType.WebGPU
  ) {
    return (
      <FormHelperText error>
        WebGPU is not supported in this runtime environment to use Kokoro WebGPU. Use a third-party TTS service instead.
      </FormHelperText>
    );
  }

  return null;
}
