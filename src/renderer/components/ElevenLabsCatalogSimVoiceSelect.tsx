import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { elevenLabsVoiceCatalog } from 'main/sentient-sims/formatter/ElevenLabsVoiceCasting';
import { TestVoiceButton } from './VoiceTestButton';
import { SimVoiceSelection } from './SimVoiceSelect';

type ElevenLabsCatalogSimVoiceSelectProps = {
  voiceId?: string;
  onChange: (voice: SimVoiceSelection) => void;
};

const defaultVoiceValue = '';

const voiceById = new Map(elevenLabsVoiceCatalog.map((voice) => [voice.voiceId, voice]));

const ageWords = { child: 'child', young: 'young', middle: 'middle-aged', old: 'older' };

export function elevenLabsCatalogVoiceLabel(voiceId: string): string {
  const voice = voiceById.get(voiceId);
  if (!voice) return voiceId;
  return `${voice.name} (${voice.gender === 'female' ? 'Female' : 'Male'}, ${ageWords[voice.age]}) : ${voice.tags.join(', ')}`;
}

/**
 * Picks which ElevenLabs premade voice a sim speaks with through Sentient Sims AI.
 * The catalog is the app's own list, so no ElevenLabs key is needed. "Default" leaves
 * the sim to the automatic casting from age, gender and traits.
 */
export function ElevenLabsCatalogSimVoiceSelect({ voiceId, onChange }: ElevenLabsCatalogSimVoiceSelectProps) {
  const selected = voiceId ?? defaultVoiceValue;
  const isUnknown = selected !== defaultVoiceValue && !voiceById.has(selected);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="elevenlabs-catalog-sim-voice-label" shrink>
          ElevenLabs Voice
        </InputLabel>
        <Select
          labelId="elevenlabs-catalog-sim-voice-label"
          id="elevenlabs-catalog-sim-voice"
          label="ElevenLabs Voice"
          notched
          displayEmpty
          value={selected}
          onChange={(change) => {
            const value = change.target.value;
            onChange({ voiceId: value, voiceName: voiceById.get(value)?.name });
          }}
          renderValue={(value) =>
            value === defaultVoiceValue ? 'Default (automatic casting)' : (voiceById.get(value)?.name ?? value)
          }
        >
          <MenuItem value={defaultVoiceValue}>Default (automatic casting)</MenuItem>
          {isUnknown ? <MenuItem value={selected}>{selected}</MenuItem> : null}
          {elevenLabsVoiceCatalog.map((voice) => (
            <MenuItem key={voice.voiceId} value={voice.voiceId}>
              {elevenLabsCatalogVoiceLabel(voice.voiceId)}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          Empty casts a voice automatically from the sim&rsquo;s age, gender and traits. These are the ElevenLabs
          premade voices, spoken through Sentient Sims AI.
        </FormHelperText>
      </FormControl>
      <Box sx={{ marginLeft: 1 }}>
        <TestVoiceButton voiceId={voiceId || undefined} />
      </Box>
    </Box>
  );
}
