import { Box, MenuItem, Select, Stack, Typography } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import {
  defaultOpenAITTSSettings,
  OpenAISpeechModel,
  OpenAISpeechVoice,
  OpenAITTSSettings,
  toSpeechModel,
  toSpeechVoice,
} from 'main/sentient-sims/models/OpenAITTSSettings';
import useSetting from 'renderer/hooks/useSetting';

export function OpenAIVoiceSettingsComponent() {
  const openaiTtsSettings = useSetting<OpenAITTSSettings>(SettingsEnum.OPENAI_TTS_SETTINGS, defaultOpenAITTSSettings);

  const modelMenuItems: any[] = [];
  Object.values(OpenAISpeechModel).forEach((model) => modelMenuItems.push(<MenuItem value={model}>{model}</MenuItem>));

  const voiceMenuItems: any[] = [];
  Object.entries(OpenAISpeechVoice).forEach((key) => voiceMenuItems.push(<MenuItem value={key[1]}>{key[0]}</MenuItem>));

  function handleModelChange(model: string) {
    openaiTtsSettings.setSetting({
      model: toSpeechModel(model),
      voice: openaiTtsSettings.value.voice,
      response_format: openaiTtsSettings.value.response_format,
    });
  }

  function handleVoiceChange(voice: string) {
    openaiTtsSettings.setSetting({
      model: openaiTtsSettings.value.model,
      voice: toSpeechVoice(voice),
      response_format: openaiTtsSettings.value.response_format,
    });
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ alignItems: 'center', mb: 1, width: '100%' }}>
          <Typography>Speech Model:</Typography>
          <Select
            size="small"
            labelId="tts-models"
            id="tts-models"
            label="TTS Model"
            value={openaiTtsSettings.value.model}
            onChange={(change) => handleModelChange(change.target.value)}
          >
            {modelMenuItems}
          </Select>
        </Stack>
      </Box>
      <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ alignItems: 'center', mb: 1, width: '100%' }}>
          <Typography>Speech Voice:</Typography>
          <Select
            size="small"
            labelId="voice"
            id="voice"
            label="Voice"
            value={openaiTtsSettings.value.voice}
            onChange={(change) => handleVoiceChange(change.target.value)}
          >
            {voiceMenuItems}
          </Select>
        </Stack>
      </Box>
    </Box>
  );
}
