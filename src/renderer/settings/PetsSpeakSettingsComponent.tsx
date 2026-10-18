import { Box, Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from '../hooks/useSetting';

export default function PetsSpeakSettingsComponent() {
  const petsSpeak = useSetting(SettingsEnum.NON_CONTROLLABLE_SIMS_SPEAK, true);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 2,
      }}
    >
      <FormControlLabel
        label="Pets, babies and infants can talk"
        control={
          <Checkbox
            checked={petsSpeak.value}
            onChange={(change) => {
              void petsSpeak.setSetting(change.target.checked);
            }}
          />
        }
      />
      <FormHelperText>
        The Sims you cannot control take speaking turns in scenes. Turn off to keep them quiet: they still think, and
        their thoughts show in the memories window, but they never say a line aloud. Toddlers and up, occults and ghosts
        always talk.
      </FormHelperText>
    </Box>
  );
}
