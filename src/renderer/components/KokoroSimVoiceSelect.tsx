import { Box, Chip, FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { kokoroVoiceCatalog } from 'main/sentient-sims/formatter/KokoroVoiceCasting';
import { TestVoiceButton } from './VoiceTestButton';
import { SimVoiceSelection } from './SimVoiceSelect';

type KokoroSimVoiceSelectProps = {
  voiceId?: string;
  onChange: (voice: SimVoiceSelection) => void;
};

// Kokoro blends degrade into mush past a few voices; same cap as the settings voice picker
const maxBlendVoices = 4;

const voiceById = new Map(kokoroVoiceCatalog.map((voice) => [voice.voiceId, voice]));

function voiceLabel(voiceId: string): string {
  const voice = voiceById.get(voiceId);
  if (!voice) return voiceId;
  const accent = voiceId.startsWith('b') ? 'British' : 'American';
  return `${voice.name} (${voice.gender === 'female' ? 'Female' : 'Male'}) : ${accent}`;
}

/**
 * Picks which Kokoro voice a sim speaks with. Selecting more than one voice blends them
 * into a single custom voice. An empty selection leaves the sim to the automatic
 * casting, which blends a unique voice from the sim's age, gender, traits and mood.
 */
export function KokoroSimVoiceSelect({ voiceId, onChange }: KokoroSimVoiceSelectProps) {
  const selected = voiceId ? voiceId.split('+') : [];

  const handleChange = (value: string | string[]) => {
    const voices = (typeof value === 'string' ? value.split(',') : value).filter(Boolean);
    if (voices.length > maxBlendVoices) {
      return;
    }
    onChange({
      voiceId: voices.join('+'),
      voiceName: voices.length > 0 ? voices.map((voice) => voiceById.get(voice)?.name ?? voice).join(' + ') : undefined,
    });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: 2 }}>
      <FormControl fullWidth size="small">
        {/* shrink + displayEmpty so the label doesn't overlap the "Default" render of an empty selection */}
        <InputLabel id="kokoro-sim-voice-label" shrink>
          Kokoro Voice
        </InputLabel>
        <Select
          labelId="kokoro-sim-voice-label"
          id="kokoro-sim-voice"
          label="Kokoro Voice"
          notched
          displayEmpty
          multiple
          value={selected}
          onChange={(change) => {
            handleChange(change.target.value);
          }}
          renderValue={(values) =>
            values.length === 0 ? (
              'Default (automatic casting)'
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {values.map((value) => (
                  <Chip key={value} size="small" label={voiceById.get(value)?.name ?? value} />
                ))}
              </Box>
            )
          }
        >
          {kokoroVoiceCatalog.map((voice) => (
            <MenuItem key={voice.voiceId} value={voice.voiceId}>
              {voiceLabel(voice.voiceId)}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          Empty blends a unique voice automatically from the sim&rsquo;s age, gender, traits and mood. Pick up to{' '}
          {maxBlendVoices} voices to blend a custom voice instead.
        </FormHelperText>
      </FormControl>
      {/* Empty selection tests the settings-default voice (automatic casting varies per sim) */}
      <Box sx={{ marginLeft: 1 }}>
        <TestVoiceButton voiceId={voiceId || undefined} />
      </Box>
    </Box>
  );
}
