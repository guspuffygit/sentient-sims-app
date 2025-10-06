import { Box, FormHelperText, Grid, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import {
  defaultElevenLabsTTSSettings,
  ElevenLabsSpeechModel,
  ElevenLabsTTSSettings,
  toSpeechModel,
} from 'main/sentient-sims/models/ElevenLabsTTSSettings';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { useMemo } from 'react';
import APIKeyInput from 'renderer/APIKeyInput';
import { TestVoiceButton } from 'renderer/components/VoiceTestButton';
import useSetting from 'renderer/hooks/useSetting';
import { useTTS } from 'renderer/providers/AudioContextProvider';

export function ElevenLabsVoiceSettingsComponent() {
  const tts = useTTS();
  const sentientsimsaiTtsSettings = useSetting<ElevenLabsTTSSettings>(
    SettingsEnum.ELEVENLABS_TTS_SETTINGS,
    defaultElevenLabsTTSSettings,
  );

  const elevenlabsKeySetting = useSetting<string>(SettingsEnum.ELEVENLABS_KEY, '');

  const modelMenuItems = useMemo(() => {
    return Object.values(ElevenLabsSpeechModel).map((model) => (
      <MenuItem key={model} value={model}>
        {model}
      </MenuItem>
    ));
  }, []);

  function handleModelChange(model: string) {
    sentientsimsaiTtsSettings.setSetting({
      model: toSpeechModel(model),
      voice: sentientsimsaiTtsSettings.value.voice,
      output_format: sentientsimsaiTtsSettings.value.output_format,
      voice_settings: sentientsimsaiTtsSettings.value.voice_settings,
    });
  }

  function handleVoiceChange(voice: string) {
    sentientsimsaiTtsSettings.setSetting({
      model: sentientsimsaiTtsSettings.value.model,
      voice,
      output_format: sentientsimsaiTtsSettings.value.output_format,
      voice_settings: sentientsimsaiTtsSettings.value.voice_settings,
    });
  }

  return (
    <Grid item xs={12} sm={8}>
      <Box>
        <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ alignItems: 'center', mb: 1, width: '100%' }}>
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
        {tts?.error ? (
          <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
            <FormHelperText error>Error: {tts?.error}</FormHelperText>
          </Box>
        ) : null}
        <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ alignItems: 'center', mb: 1, width: '100%' }}>
            <TextField
              label="Voice"
              variant="outlined"
              fullWidth
              value={sentientsimsaiTtsSettings.value.voice}
              onChange={(change) => handleVoiceChange(change.target.value)}
              sx={{ marginRight: 4 }}
            />
            <TestVoiceButton />
          </Stack>
        </Box>
        <APIKeyInput setting={elevenlabsKeySetting} aiName="ElevenLabs" />
      </Box>
    </Grid>
  );
}
