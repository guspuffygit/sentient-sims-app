import { FormHelperText } from '@mui/material';
import log from 'electron-log';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { useTTS } from 'renderer/providers/AudioContextProvider';

export default function WebGpuDebug() {
  const tts = useTTS();
  const aiSettings = useAISettings();

  if (
    tts.isWebGPUSupported ||
    !aiSettings.ttsEnabled ||
    aiSettings.ttsApiType !== ApiType.Kokoro
  ) {
    log.debug(
      `isWebGPUSupported: ${
        tts.isWebGPUSupported
      }. !aiSettings.ttsEnabled: ${!aiSettings.ttsEnabled} aiSettings.ttsApiType !== ApiType.Kokoro: ${
        aiSettings.aiApiType !== ApiType.Kokoro
      }`,
    );
    return null;
  }

  return (
    <FormHelperText error>
      Kokoro requires WebGPU to function and WebGPU is not supported in this
      runtime environment. Use a third-party TTS service instead.
    </FormHelperText>
  );
}
