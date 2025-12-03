import { Box, FormControlLabel, Checkbox, MenuItem, Select, Grid, Slider, Stack, Typography } from '@mui/material';
import HelpButton from 'renderer/components/HelpButton';
import { ApiType, ApiTypeFromValue } from 'main/sentient-sims/models/ApiType';
import { JSX } from 'react';
import { VolumeDown, VolumeUp } from '@mui/icons-material';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { OpenAIVoiceSettingsComponent } from './voice/OpenAIVoiceSettingsComponent';
import { SentientSimsAIVoiceSettingsComponent } from './voice/SentientSimsAIVoiceSettingsComponent';
import { KokoroAIVoiceSettingsComponent } from './voice/KokoroAIVoiceSettingsComponent';
import { ElevenLabsVoiceSettingsComponent } from './voice/ElevenLabsVoiceSettingsComponent';

export default function VoiceSettingsComponent() {
  const aiSettings = useAISettings();

  let voiceSettingsComponent: JSX.Element | undefined;
  if (aiSettings.ttsApiType === ApiType.OpenAI) {
    voiceSettingsComponent = <OpenAIVoiceSettingsComponent />;
  } else if (aiSettings.ttsApiType === ApiType.SentientSimsAI) {
    voiceSettingsComponent = <SentientSimsAIVoiceSettingsComponent />;
  } else if (aiSettings.ttsApiType === ApiType.Kokoro) {
    voiceSettingsComponent = <KokoroAIVoiceSettingsComponent />;
  } else if (aiSettings.ttsApiType === ApiType.ElevenLabs) {
    voiceSettingsComponent = <ElevenLabsVoiceSettingsComponent />;
  }

  return (
    <>
      <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
        <FormControlLabel
          label="Enable Text to Speech"
          control={
            <Checkbox
              checked={aiSettings.ttsEnabled}
              onChange={(change) => aiSettings.ttsEnabledSetting.setSetting(change.target.checked)}
            />
          }
        />
        <HelpButton url="https://github.com/guspuffygit/sentient-sims-app/wiki/Voice#tts" />
      </Box>
      {aiSettings.ttsEnabled ? (
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 8 }}>
            <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
              <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 1 }}>
                <Typography>AI:</Typography>
                <Select
                  size="small"
                  labelId="release-type-select-label"
                  id="release-type-select"
                  value={aiSettings.ttsApiType}
                  sx={{ minWidth: 100, marginRight: 2 }}
                  onChange={(change) => aiSettings.ttsApiTypeSetting.setSetting(ApiTypeFromValue(change.target.value))}
                >
                  <MenuItem value={ApiType.SentientSimsAI}>Sentient Sims AI TTS</MenuItem>
                </Select>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }} container spacing={2}>
            <Box sx={{ width: 300 }}>
              <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 1 }}>
                <Typography>Volume:</Typography>
                <VolumeDown />
                <Slider
                  aria-label="Volume"
                  value={aiSettings.ttsVolume}
                  onChange={(change, value) => aiSettings.ttsVolumeSetting.setSetting(value as number)}
                  step={0.01}
                  min={0.0}
                  max={1}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 0.5, label: '0.5' },
                    { value: 1.0, label: '1' },
                  ]}
                />
                <VolumeUp />
              </Stack>
            </Box>
          </Grid>
          {voiceSettingsComponent}
        </Grid>
      ) : null}
    </>
  );
}
