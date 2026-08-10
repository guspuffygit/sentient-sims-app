import { Box, Checkbox, Divider, FormControlLabel, MenuItem, Select, Slider, Stack, Typography } from '@mui/material';
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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box>
          <Typography variant="h6">Text to Speech</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 0.25 }}>
            Sims speak their generated dialogue out loud through an AI voice provider.
          </Typography>
        </Box>
        <HelpButton url="https://github.com/guspuffygit/sentient-sims-app/wiki/Voice#tts" />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1, marginBottom: 2 }}>
        <FormControlLabel
          label="Enable Text to Speech"
          control={
            <Checkbox
              checked={aiSettings.ttsEnabled}
              onChange={(change) => void aiSettings.ttsEnabledSetting.setSetting(change.target.checked)}
            />
          }
        />
      </Box>
      {aiSettings.ttsEnabled ? (
        <>
          <Divider sx={{ marginBottom: 2.5 }} />
          <Typography variant="subtitle1">Playback</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 2 }}>
            Choose which service generates speech and how loud voices play.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2.5, sm: 5 }} sx={{ marginBottom: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 0.75 }}>
                Provider
              </Typography>
              <Select
                size="small"
                labelId="release-type-select-label"
                id="release-type-select"
                value={aiSettings.ttsApiType}
                sx={{ minWidth: 240 }}
                onChange={(change) =>
                  void aiSettings.ttsApiTypeSetting.setSetting(ApiTypeFromValue(change.target.value))
                }
              >
                <MenuItem value={ApiType.SentientSimsAI}>Sentient Sims AI TTS</MenuItem>
                <MenuItem value={ApiType.ElevenLabs}>ElevenLabs</MenuItem>
              </Select>
            </Box>
            <Box sx={{ width: 280 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 0.75 }}>
                Volume
              </Typography>
              <Stack spacing={1.5} direction="row" sx={{ alignItems: 'center' }}>
                <VolumeDown sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Slider
                  aria-label="Volume"
                  value={aiSettings.ttsVolume}
                  onChange={(change, value) => void aiSettings.ttsVolumeSetting.setSetting(value)}
                  step={0.01}
                  min={0.0}
                  max={1}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 0.5, label: '0.5' },
                    { value: 1.0, label: '1' },
                  ]}
                />
                <VolumeUp sx={{ color: 'text.secondary', fontSize: 20 }} />
              </Stack>
            </Box>
          </Stack>
          <Divider sx={{ marginBottom: 2.5 }} />
          {voiceSettingsComponent}
        </>
      ) : null}
    </>
  );
}
