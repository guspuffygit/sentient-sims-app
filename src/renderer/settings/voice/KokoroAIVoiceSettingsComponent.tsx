import { Box, MenuItem, Select, Stack, Typography } from '@mui/material';
import {
  defaultKokoroAITTSSettings,
  KokoroAISpeechModel,
  KokoroAISpeechVoice,
  KokoroAITTSSettings,
  toSpeechModel,
  toSpeechVoice,
} from 'main/sentient-sims/models/KokoroAITTSSettings';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';

export default function KokoroAIVoiceSettingsComponent() {
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

  function handleModelChange(model: string) {
    kokoroaiTtsSettings.setSetting({
      model: toSpeechModel(model),
      voice: toSpeechVoice(kokoroaiTtsSettings.value.voice),
      response_format: kokoroaiTtsSettings.value.response_format,
    });
  }

  function handleVoiceChange(voice: string) {
    kokoroaiTtsSettings.setSetting({
      model: kokoroaiTtsSettings.value.model,
      voice: toSpeechVoice(voice),
      response_format: kokoroaiTtsSettings.value.response_format,
    });
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ alignItems: 'center', mb: 1, width: '100%' }}
        >
          <Typography>Speech Model:</Typography>
          <Select
            size="small"
            labelId="tts-models"
            id="tts-models"
            label="TTS Model"
            value={kokoroaiTtsSettings.value.model}
            onChange={(change) => handleModelChange(change.target.value)}
          >
            {modelMenuItems}
          </Select>
        </Stack>
      </Box>
      <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ alignItems: 'center', mb: 1, width: '100%' }}
        >
          <Typography>Speech Voice:</Typography>
          <Select
            size="small"
            labelId="voice"
            id="voice"
            label="Voice"
            value={kokoroaiTtsSettings.value.voice}
            onChange={(change) => handleVoiceChange(change.target.value)}
          >
            {voiceMenuItems}
          </Select>
        </Stack>
      </Box>
    </Box>
  );
}
