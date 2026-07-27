import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormHelperText,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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
import handleOpenExternalLink from 'renderer/hooks/handleOpenExternalLink';
import { useTTS } from 'renderer/providers/AudioContextProvider';
import { ElevenLabsVoiceInfo } from 'main/sentient-sims/clients/ElevenLabsVoiceRequest';
import { useElevenLabsVoiceInfo } from 'renderer/voice/useElevenLabsVoiceInfo';

const voiceLibraryUrl = 'https://elevenlabs.io/app/voice-library';

function ElevenLabsVoiceCard({ voice }: { voice: ElevenLabsVoiceInfo }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: 1.5,
        marginBottom: 2,
      }}
    >
      <Avatar src={voice.imageUrl} alt={voice.name} sx={{ width: 56, height: 56 }}>
        {voice.name.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 600 }}>{voice.name}</Typography>
          {voice.category ? <Chip size="small" variant="outlined" label={voice.category} /> : null}
        </Stack>
        {voice.labels.length > 0 ? (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, marginTop: 0.5 }}>
            {voice.labels.map((label) => (
              <Chip key={label.name} size="small" title={label.name} label={label.value} />
            ))}
          </Stack>
        ) : null}
        {voice.description ? (
          <Typography variant="body2" color="text.secondary" sx={{ marginTop: 0.5 }}>
            {voice.description}
          </Typography>
        ) : null}
        {voice.redirectedTo ? (
          <Typography variant="caption" color="warning.main" sx={{ display: 'block', marginTop: 0.5 }}>
            This ID is retired. ElevenLabs plays it as the voice above — use {voice.redirectedTo} instead.
          </Typography>
        ) : null}
      </Box>
    </Paper>
  );
}

export function ElevenLabsVoiceSettingsComponent() {
  const tts = useTTS();
  const voiceInfo = useElevenLabsVoiceInfo();
  const elevenLabsTTSSettings = useSetting<ElevenLabsTTSSettings>(
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

  // Keeps the card from describing a voice the user has already typed away from
  const loadedVoice = voiceInfo.voice?.voiceId === elevenLabsTTSSettings.value.voice ? voiceInfo.voice : undefined;

  function handleModelChange(model: string) {
    void elevenLabsTTSSettings.setSetting({
      model: toSpeechModel(model),
      voice: elevenLabsTTSSettings.value.voice,
      output_format: elevenLabsTTSSettings.value.output_format,
      voice_settings: elevenLabsTTSSettings.value.voice_settings,
    });
  }

  function handleVoiceChange(voice: string) {
    void elevenLabsTTSSettings.setSetting({
      model: elevenLabsTTSSettings.value.model,
      voice: voice.trim(),
      output_format: elevenLabsTTSSettings.value.output_format,
      voice_settings: elevenLabsTTSSettings.value.voice_settings,
    });
  }

  return (
    <Grid size={{ xs: 12, sm: 8 }}>
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 1,
          }}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              width: '100%',
            }}
          >
            <Typography>Speech Model:</Typography>
            <Select
              size="small"
              labelId="tts-models"
              id="tts-models"
              label="TTS Model"
              value={elevenLabsTTSSettings.value.model}
              onChange={(change) => {
                handleModelChange(change.target.value);
              }}
            >
              {modelMenuItems}
            </Select>
          </Stack>
        </Box>
        {tts.error ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 2,
            }}
          >
            <FormHelperText error>Error: {tts.error}</FormHelperText>
          </Box>
        ) : null}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            marginBottom: 1,
          }}
        >
          <TextField
            label="Default Voice ID"
            variant="outlined"
            fullWidth
            value={elevenLabsTTSSettings.value.voice}
            onChange={(change) => {
              handleVoiceChange(change.target.value);
            }}
          />
          <TestVoiceButton onTest={() => void voiceInfo.loadVoice(elevenLabsTTSSettings.value.voice)} />
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: 2,
          }}
        >
          <Button
            size="small"
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenExternalLink(voiceLibraryUrl)}
            sx={{ textTransform: 'none' }}
          >
            Voice Library
          </Button>
          <FormHelperText sx={{ margin: 0 }}>
            Pick a voice, click its <MoreVertIcon sx={{ fontSize: 'inherit', verticalAlign: 'middle' }} /> menu, choose
            &quot;Copy voice ID&quot;, then paste it above.
          </FormHelperText>
        </Stack>
        {voiceInfo.isLoading ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', marginBottom: 2 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Looking up voice...
            </Typography>
          </Stack>
        ) : null}
        {voiceInfo.error ? (
          <Box sx={{ marginBottom: 2 }}>
            <FormHelperText error>{voiceInfo.error}</FormHelperText>
          </Box>
        ) : null}
        {loadedVoice ? <ElevenLabsVoiceCard voice={loadedVoice} /> : null}
        <APIKeyInput setting={elevenlabsKeySetting} aiName="ElevenLabs" />
      </Box>
    </Grid>
  );
}
