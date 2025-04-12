import {
  Box,
  Chip,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import { JSX, useMemo } from 'react';
import {
  defaultSentientSimsAITTSSettings,
  SentientSimsAISpeechModel,
  SentientSimsAISpeechVoice,
  SentientSimsAITTSSettings,
  toSpeechModel,
  toSpeechVoice,
} from 'main/sentient-sims/models/SentientSimsAITTSSettings';
import { VOICES } from 'renderer/kokoro/voices';
import { TestVoiceButton } from 'renderer/components/VoiceTestButton';
import { useTTS } from 'renderer/providers/AudioContextProvider';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import SpeedIcon from '@mui/icons-material/Speed';
import log from 'electron-log';

export default function SentientSimsAIVoiceSettingsComponent() {
  const { user } = useAuthenticator((context) => [context.user]);

  const patreonUser = new PatreonUser(user);

  const showLogInError = !user;
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
  Object.entries(SentientSimsAISpeechVoice).forEach((key) =>
    voiceMenuItems.push(
      <MenuItem value={key[1]}>{`${key[0]} (${VOICES[key[1]].gender}) : ${
        VOICES[key[1]].language === 'en-us' ? 'American' : 'British'
      }`}</MenuItem>,
    ),
  );

  function handleModelChange(model: string) {
    sentientsimsaiTtsSettings.setSetting({
      model: toSpeechModel(model),
      voice: sentientsimsaiTtsSettings.value.voice,
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
      voice.split(',').forEach((v) => voices.push(toSpeechVoice(v)));
    } else {
      voice.forEach((v) => voices.push(v));
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

  log.info(speed);

  return (
    <Grid item xs={12} sm={8}>
      <Box>
        <Box>{errors}</Box>
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
              multiple
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
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ alignItems: 'center', mb: 1, width: '100%' }}
          >
            <FormHelperText>
              You can select multiple voices to create a custom voice
            </FormHelperText>
            <TestVoiceButton disabled={showLogInError || showMemberError} />
          </Stack>
        </Box>
        <Box sx={{ width: 300 }}>
          <Stack
            spacing={2}
            direction="row"
            sx={{ alignItems: 'center', mb: 1 }}
          >
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
        {tts?.error ? (
          <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
            <FormHelperText error>Error: {tts?.error}</FormHelperText>
          </Box>
        ) : null}
      </Box>
    </Grid>
  );
}
