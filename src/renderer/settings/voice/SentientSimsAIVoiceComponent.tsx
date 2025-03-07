import { Box, MenuItem, Select, Stack, Typography } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import {
  defaultSentientSimsAITTSSettings,
  SentientSimsAISpeechModel,
  SentientSimsAISpeechVoice,
  SentientSimsAITTSSettings,
  toSpeechModel,
  toSpeechVoice,
} from 'main/sentient-sims/models/SentientSimsAITTSSettings';

export default function SentientSimsAIVoiceSettingsComponent() {
  const sentientsimsaiTtsSettings = useSetting<SentientSimsAITTSSettings>(
    SettingsEnum.SENTIENTSIMSAI_TTS_SETTINGS,
    defaultSentientSimsAITTSSettings,
  );

  const modelMenuItems: any[] = [];
  Object.values(SentientSimsAISpeechModel).forEach((model) =>
    modelMenuItems.push(<MenuItem value={model}>{model}</MenuItem>),
  );

  const voiceMenuItems: any[] = [];
  Object.entries(SentientSimsAISpeechVoice).forEach((key) =>
    voiceMenuItems.push(<MenuItem value={key[1]}>{key[0]}</MenuItem>),
  );

  function handleModelChange(model: string) {
    sentientsimsaiTtsSettings.setSetting({
      model: toSpeechModel(model),
      voice: toSpeechVoice(sentientsimsaiTtsSettings.value.voice),
      response_format: sentientsimsaiTtsSettings.value.response_format,
    });
  }

  function handleVoiceChange(voice: string) {
    sentientsimsaiTtsSettings.setSetting({
      model: sentientsimsaiTtsSettings.value.model,
      voice: toSpeechVoice(voice),
      response_format: sentientsimsaiTtsSettings.value.response_format,
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
            value={sentientsimsaiTtsSettings.value.model}
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
            value={sentientsimsaiTtsSettings.value.voice}
            onChange={(change) => handleVoiceChange(change.target.value)}
          >
            {voiceMenuItems}
          </Select>
        </Stack>
      </Box>
    </Box>
  );
}
