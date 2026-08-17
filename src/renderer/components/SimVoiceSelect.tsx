import SyncIcon from '@mui/icons-material/Sync';
import {
  Box,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
} from '@mui/material';
import { useElevenLabsVoices } from 'renderer/hooks/useElevenLabsVoices';
import { TestVoiceButton } from './VoiceTestButton';

export type SimVoiceSelection = {
  voiceId: string;
  voiceName?: string;
};

type SimVoiceSelectProps = {
  voiceId?: string;
  voiceName?: string;
  onChange: (voice: SimVoiceSelection) => void;
};

// Value used for the automatic casting option. Empty rather than a sentinel string so it
// round trips to the API as "no voice pinned".
const defaultVoiceValue = '';

/**
 * Picks which ElevenLabs voice a sim speaks with, from the user's cached My Voices
 * collection. "Default" leaves the sim to the automatic personality-based casting.
 */
export function SimVoiceSelect({ voiceId, voiceName, onChange }: SimVoiceSelectProps) {
  const { cache, isLoading, isRefreshing, error, refresh } = useElevenLabsVoices();

  const selected = voiceId ?? defaultVoiceValue;
  // A voice the user removed from My Voices still plays, so keep it selectable
  const isMissingFromCollection = selected !== defaultVoiceValue && !cache.voices.some((v) => v.voiceId === selected);

  let helperText = 'Default casts a voice automatically from the sim’s age, gender, traits and mood.';
  if (error) {
    helperText = error;
  } else if (isMissingFromCollection) {
    helperText = 'This voice is no longer in your My Voices collection, but it will still be used.';
  } else if (cache.voices.length === 0 && !isLoading && !isRefreshing) {
    helperText = 'No voices loaded yet. Refresh to pull your My Voices collection from ElevenLabs.';
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: 2 }}>
      <FormControl fullWidth size="small" error={Boolean(error)}>
        <InputLabel id="sim-voice-label">ElevenLabs Voice</InputLabel>
        <Select
          labelId="sim-voice-label"
          id="sim-voice"
          label="ElevenLabs Voice"
          value={selected}
          onChange={(change) => {
            const nextVoiceId = change.target.value;
            onChange({
              voiceId: nextVoiceId,
              voiceName: cache.voices.find((voice) => voice.voiceId === nextVoiceId)?.name,
            });
          }}
        >
          <MenuItem value={defaultVoiceValue}>Default (automatic casting)</MenuItem>
          {isMissingFromCollection ? (
            <MenuItem value={selected}>{voiceName ? `${voiceName} (removed)` : selected}</MenuItem>
          ) : null}
          {cache.voices.map((voice) => (
            <MenuItem key={voice.voiceId} value={voice.voiceId}>
              {voice.name}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
      <Tooltip title="Refresh voices from ElevenLabs">
        <span>
          <IconButton
            disabled={isRefreshing}
            onClick={() => {
              void refresh();
            }}
          >
            {isRefreshing ? <CircularProgress size={20} /> : <SyncIcon />}
          </IconButton>
        </span>
      </Tooltip>
      {/* Default selection tests the settings-default voice (automatic casting varies per sim) */}
      <Box sx={{ marginLeft: 1 }}>
        <TestVoiceButton voiceId={selected || undefined} />
      </Box>
    </Box>
  );
}
