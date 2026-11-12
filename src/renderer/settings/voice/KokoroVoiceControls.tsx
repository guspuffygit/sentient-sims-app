import { Box, Chip, FormHelperText, MenuItem, Select, Slider, Stack, Typography } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import {
  isKokoroSpeechVoice,
  kokoroSpeechVoices,
  maxKokoroBlendVoices,
  SentientSimsAISpeechKokoroVoice,
} from 'main/sentient-sims/models/SentientSimsAITTSSettings';
import { VOICES } from 'renderer/kokoro/voices';

function voiceName(voice: string): string {
  return voice in VOICES ? VOICES[voice].name : voice;
}

function voiceLabel(voice: SentientSimsAISpeechKokoroVoice): string {
  const { name, gender, language } = VOICES[voice];
  return `${name} (${gender}) : ${language === 'en-us' ? 'American' : 'British'}`;
}

type KokoroVoiceSelectProps = {
  value: string[];
  onChange: (voices: SentientSimsAISpeechKokoroVoice[]) => void;
};

// The Sentient Sims AI and self-hosted Kokoro panels share this, so they offer the same voices
export function KokoroVoiceSelect({ value, onChange }: KokoroVoiceSelectProps) {
  function handleChange(picked: string | string[]) {
    const voices = (typeof picked === 'string' ? picked.split(',') : picked).filter(isKokoroSpeechVoice);
    if (voices.length <= maxKokoroBlendVoices) {
      onChange(voices);
    }
  }

  return (
    <Box sx={{ marginBottom: 2 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 0.75 }}>
        Speech voice
      </Typography>
      <Select
        size="small"
        id="voice"
        multiple
        value={value}
        sx={{ width: '100%' }}
        onChange={(change) => {
          handleChange(change.target.value);
        }}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((voice) => (
              <Chip key={voice} label={voiceName(voice)} />
            ))}
          </Box>
        )}
      >
        {kokoroSpeechVoices.map((voice) => (
          <MenuItem key={voice} value={voice}>
            {voiceLabel(voice)}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText sx={{ marginTop: 0.75 }}>You can select multiple voices to create a custom voice</FormHelperText>
    </Box>
  );
}

type KokoroSpeedSliderProps = {
  value: number;
  onChange: (speed: number) => void;
};

export function KokoroSpeedSlider({ value, onChange }: KokoroSpeedSliderProps) {
  return (
    <Box sx={{ width: 280, marginBottom: 2 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 0.75 }}>
        Speed
      </Typography>
      <Stack spacing={1.5} direction="row" sx={{ alignItems: 'center' }}>
        <Slider
          aria-label="Speed"
          value={value}
          onChange={(_change, speed) => {
            onChange(speed);
          }}
          step={0.01}
          min={0.4}
          max={2}
          marks={[
            { value: 0.4, label: '0.4' },
            { value: 1.0, label: '1' },
            { value: 2.0, label: '2' },
          ]}
        />
        <SpeedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
      </Stack>
    </Box>
  );
}
