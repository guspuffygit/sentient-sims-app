import { Box, MenuItem, Select, Typography } from '@mui/material';
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
    return openaiTtsSettings.setSetting({
      model: toSpeechModel(model),
      voice: openaiTtsSettings.value.voice,
      response_format: openaiTtsSettings.value.response_format,
    });
  }

  function handleVoiceChange(voice: string) {
    return openaiTtsSettings.setSetting({
      model: openaiTtsSettings.value.model,
      voice: toSpeechVoice(voice),
      response_format: openaiTtsSettings.value.response_format,
    });
  }

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="subtitle1">OpenAI</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 2 }}>
        Speech generated with the OpenAI text to speech API.
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
          value={openaiTtsSettings.value.model}
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
          value={openaiTtsSettings.value.voice}
          sx={{ width: '100%' }}
          onChange={(change) => {
            void handleVoiceChange(change.target.value);
          }}
        >
          {voiceMenuItems}
        </Select>
      </Box>
    </Box>
  );
}
