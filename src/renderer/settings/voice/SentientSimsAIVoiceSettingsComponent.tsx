import { Box, Chip, FormHelperText, Grid, MenuItem, Select, Slider, Stack, Typography } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import { JSX, useMemo } from 'react';
import {
  defaultSentientSimsAITTSSettings,
  SentientSimsAISpeechModel,
  SentientSimsAISpeechKokoroVoice,
  SentientSimsAITTSSettings,
  toSpeechModel,
  toSpeechVoice,
  SentientSimsAISpeechVoice,
  SentientSimsAISpeechOrpheusVoice,
} from 'main/sentient-sims/models/SentientSimsAITTSSettings';
import { VOICES } from 'renderer/kokoro/voices';
import { TestVoiceButton } from 'renderer/components/VoiceTestButton';
import { useTTS } from 'renderer/providers/AudioContextProvider';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import SpeedIcon from '@mui/icons-material/Speed';
import { useAuth } from '../../providers/AuthProvider';

export function SentientSimsAIVoiceSettingsComponent() {
  const { userAttributes } = useAuth();

  const patreonUser = new PatreonUser(userAttributes);

  const showLogInError = !userAttributes;
  const showMemberError = !patreonUser.isMember();

  const errors: JSX.Element[] = [];
  if (showLogInError) {
    errors.push(
      <FormHelperText sx={{ marginBottom: 2 }} error>
        You must be logged in to use the Sentient Sims AI API
      </FormHelperText>,
    );
  }
  if (showMemberError) {
    errors.push(
      <FormHelperText sx={{ marginBottom: 2 }} error>
        You must be a Founder or Patron to use the Sentient Sims Uncensored AI
      </FormHelperText>,
    );
  }
  const tts = useTTS();
  const sentientsimsaiTtsSettings = useSetting<SentientSimsAITTSSettings>(
    SettingsEnum.SENTIENTSIMSAI_TTS_SETTINGS,
    defaultSentientSimsAITTSSettings,
  );

  const modelMenuItems: any[] = [];
  Object.values(SentientSimsAISpeechModel).forEach((model) =>
    modelMenuItems.push(<MenuItem value={model}>{model}</MenuItem>),
  );

  const voiceMenuItems: any[] = [];
  if (sentientsimsaiTtsSettings.value.model === SentientSimsAISpeechModel.KOKORO) {
    Object.entries(SentientSimsAISpeechKokoroVoice).forEach((key) => {
      // this voice doesn't work for some reason
      if (key[1] !== SentientSimsAISpeechKokoroVoice.Isabella) {
        voiceMenuItems.push(
          <MenuItem value={key[1]}>{`${key[0]} (${VOICES[key[1]].gender}) : ${
            VOICES[key[1]].language === 'en-us' ? 'American' : 'British'
          }`}</MenuItem>,
        );
      }
    });
  } else {
    Object.entries(SentientSimsAISpeechOrpheusVoice).forEach((key) => {
      voiceMenuItems.push(<MenuItem value={key[1]}>{key[0]}</MenuItem>);
    });
  }

  function handleModelChange(model: string) {
    const speechModel = toSpeechModel(model);

    let voice: SentientSimsAISpeechVoice[] = [SentientSimsAISpeechKokoroVoice.Heart];
    if (speechModel === SentientSimsAISpeechModel.ORPHEUS) {
      voice = [SentientSimsAISpeechOrpheusVoice.Tara];
    }

    sentientsimsaiTtsSettings.setSetting({
      model: speechModel,
      voice,
      response_format: sentientsimsaiTtsSettings.value.response_format,
      speed: sentientsimsaiTtsSettings.value.speed,
    });
  }

  function handleSpeedChange(speed: number) {
    sentientsimsaiTtsSettings.setSetting({
      model: sentientsimsaiTtsSettings.value.model,
      voice: sentientsimsaiTtsSettings.value.voice,
      response_format: sentientsimsaiTtsSettings.value.response_format,
      speed,
    });
  }

  function handleVoiceChange(voice: string | SentientSimsAISpeechVoice[]) {
    const voices: SentientSimsAISpeechVoice[] = [];
    if (typeof voice === 'string') {
      voice.split(',').forEach((v) => {
        const speechVoice = toSpeechVoice(v);
        if (speechVoice !== SentientSimsAISpeechKokoroVoice.Isabella) {
          voices.push(speechVoice);
        }
      });
    } else {
      voice.forEach((v) => {
        if (v !== SentientSimsAISpeechKokoroVoice.Isabella) {
          voices.push(v);
        }
      });
    }

    if (voices.length > 4) {
      return;
    }

    sentientsimsaiTtsSettings.setSetting({
      model: sentientsimsaiTtsSettings.value.model,
      voice: voices,
      response_format: sentientsimsaiTtsSettings.value.response_format,
      speed: sentientsimsaiTtsSettings.value.speed,
    });
  }

  const speed = useMemo(() => {
    if (sentientsimsaiTtsSettings.value.speed) {
      return sentientsimsaiTtsSettings.value.speed;
    }

    return defaultSentientSimsAITTSSettings.speed;
  }, [sentientsimsaiTtsSettings.value.speed]);

  return (
    <Grid size={{ xs: 12, sm: 8 }}>
      <Box>
        <Box>{errors}</Box>
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
        <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ alignItems: 'center', mb: 1, width: '100%' }}>
            <Typography>Speech Voice:</Typography>
            <Select
              size="small"
              labelId="voice"
              id="voice"
              label="Voice"
              multiple={sentientsimsaiTtsSettings.value.model === SentientSimsAISpeechModel.KOKORO}
              value={sentientsimsaiTtsSettings.value.voice}
              onChange={(change) => handleVoiceChange(change.target.value)}
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
          </Stack>
        </Box>
        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ alignItems: 'center', mb: 1, width: '100%' }}>
            {sentientsimsaiTtsSettings.value.model === SentientSimsAISpeechModel.KOKORO && (
              <FormHelperText>You can select multiple voices to create a custom voice</FormHelperText>
            )}
            <TestVoiceButton disabled={showLogInError || showMemberError} />
          </Stack>
        </Box>
        {sentientsimsaiTtsSettings.value.model === SentientSimsAISpeechModel.KOKORO && (
          <Box sx={{ width: 300 }}>
            <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 1 }}>
              <Typography>Speed:</Typography>
              <Slider
                aria-label="Speed"
                value={speed}
                onChange={(change, value) => handleSpeedChange(value as number)}
                step={0.01}
                min={0.4}
                max={2}
                marks={[
                  { value: 0.4, label: '0.4' },
                  { value: 1.0, label: '1' },
                  { value: 2.0, label: '2' },
                ]}
              />
              <SpeedIcon />
            </Stack>
          </Box>
        )}
        {tts?.error && (
          <Box display="flex" alignItems="center" sx={{ marginBottom: 2, marginTop: 2 }}>
            <FormHelperText error>Error: {tts?.error}</FormHelperText>
          </Box>
        )}
      </Box>
    </Grid>
  );
}
