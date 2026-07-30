import { Box, Chip, FormHelperText, MenuItem, Select, Typography } from '@mui/material';
import {
  defaultKokoroAITTSSettings,
  KokoroAISpeechModel,
  KokoroAISpeechVoice,
  KokoroAITTSSettings,
  KokoroType,
  toKokoroType,
  toSpeechModel,
  toSpeechVoice,
} from 'main/sentient-sims/models/KokoroAITTSSettings';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { TestVoiceButton } from 'renderer/components/VoiceTestButton';
import WebGpuDebug from 'renderer/components/WebGpuDebug';
import useSetting from 'renderer/hooks/useSetting';
import { VOICES } from 'renderer/kokoro/voices';
import { useTTS } from 'renderer/providers/AudioContextProvider';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { AIEndpointComponent } from '../AIEndpointComponent';

export function KokoroAIVoiceSettingsComponent() {
  const aiSettings = useAISettings();
  const tts = useTTS();
  const kokoroaiTtsSettings = useSetting<KokoroAITTSSettings>(
    SettingsEnum.KOKOROAI_TTS_SETTINGS,
    defaultKokoroAITTSSettings,
  );

  const modelMenuItems: any[] = [];
  Object.values(KokoroAISpeechModel).forEach((model) =>
    modelMenuItems.push(<MenuItem value={model}>{model}</MenuItem>),
  );

  const voiceMenuItems: any[] = [];
  Object.entries(KokoroAISpeechVoice).forEach((key) =>
    voiceMenuItems.push(<MenuItem value={key[1]}>{key[0]}</MenuItem>),
  );

  const typeMenuItems: any[] = [];
  Object.entries(KokoroType).forEach((key) => {
    typeMenuItems.push(<MenuItem value={key[1]}>{key[0]}</MenuItem>);
  });

  async function handleModelChange(model: string) {
    return kokoroaiTtsSettings.setSetting({
      model: toSpeechModel(model),
      voice: kokoroaiTtsSettings.value.voice,
      response_format: kokoroaiTtsSettings.value.response_format,
      type: kokoroaiTtsSettings.value.type,
    });
  }

  async function handleVoiceChange(voice: string | KokoroAISpeechVoice[]) {
    const voices: KokoroAISpeechVoice[] = [];
    if (typeof voice === 'string') {
      voice.split(',').forEach((v) => voices.push(toSpeechVoice(v)));
    } else {
      voice.forEach((v) => voices.push(v));
    }

    if (voices.length > 4) {
      return;
    }

    return kokoroaiTtsSettings.setSetting({
      model: kokoroaiTtsSettings.value.model,
      voice: voices,
      response_format: kokoroaiTtsSettings.value.response_format,
      type: kokoroaiTtsSettings.value.type,
    });
  }

  async function handleTypeChange(type: KokoroType) {
    return kokoroaiTtsSettings.setSetting({
      model: kokoroaiTtsSettings.value.model,
      voice: kokoroaiTtsSettings.value.voice,
      response_format: kokoroaiTtsSettings.value.response_format,
      type,
    });
  }

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="subtitle1">Kokoro</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 2 }}>
        Kokoro speech generation, run locally in the app or through a remote endpoint.
      </Typography>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 0.75 }}>
          Speech model
        </Typography>
        <Select
          size="small"
          labelId="tts-models"
          id="tts-models"
          label="TTS Model"
          value={kokoroaiTtsSettings.value.model}
          sx={{ width: '100%' }}
          onChange={(change) => {
            void handleModelChange(change.target.value);
          }}
        >
          {modelMenuItems}
        </Select>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 0.75 }}>
          Speech voice
        </Typography>
        <Select
          size="small"
          labelId="voice"
          id="voice"
          label="Voice"
          multiple
          value={kokoroaiTtsSettings.value.voice}
          sx={{ width: '100%' }}
          onChange={(change) => {
            void handleVoiceChange(change.target.value);
          }}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={VOICES[value].name} />
              ))}
            </Box>
          )}
        >
          {voiceMenuItems}
        </Select>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 0.75 }}>
          Local/Remote
        </Typography>
        <Select
          size="small"
          labelId="local-remote"
          id="local-remote"
          label="Local/Remote"
          value={kokoroaiTtsSettings.value.type}
          sx={{ minWidth: 240 }}
          onChange={(change) => {
            void handleTypeChange(toKokoroType(change.target.value));
          }}
        >
          {typeMenuItems}
        </Select>
      </Box>
      {kokoroaiTtsSettings.value.type === KokoroType.Remote ? (
        <AIEndpointComponent
          type={ApiType.Kokoro}
          selectedApiType={aiSettings.ttsApiType}
          settingsEnum={SettingsEnum.KOKOROAI_ENDPOINT}
        />
      ) : null}
      <Box sx={{ marginTop: 2.5, marginBottom: 2 }}>
        <TestVoiceButton />
      </Box>
      {tts.error ? (
        <Box sx={{ marginBottom: 2 }}>
          <FormHelperText error>Error: {tts.error}</FormHelperText>
        </Box>
      ) : null}
      {kokoroaiTtsSettings.value.type === KokoroType.WebGPU ? (
        <Box sx={{ marginBottom: 2 }}>
          <FormHelperText>
            WebGPU is Experimental. Kokoro runs completely locally using the power of your graphics card. Depending on
            the specs and configuration of your computer it may run too slow.
          </FormHelperText>
        </Box>
      ) : null}
      {kokoroaiTtsSettings.value.type === KokoroType.WebGPU && kokoroaiTtsSettings.value.voice.length > 1 ? (
        <Box sx={{ marginBottom: 2 }}>
          <FormHelperText error>Only one Kokoro Voice can be selected when using WebGPU</FormHelperText>
        </Box>
      ) : null}
      <Box sx={{ marginBottom: 2 }}>
        <WebGpuDebug />
      </Box>
    </Box>
  );
}
