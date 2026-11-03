import { Box, Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from '../hooks/useSetting';

export default function DirectedScenesSettingsComponent() {
  const directedScenesEnabled = useSetting(SettingsEnum.DIRECTED_SCENES_ENABLED, true);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 2,
      }}
    >
      <FormControlLabel
        label="Directed Scenes"
        control={
          <Checkbox
            checked={directedScenesEnabled.value}
            onChange={(change) => {
              void directedScenesEnabled.setSetting(change.target.checked);
            }}
          />
        }
      />
      <FormHelperText>
        Screenplay-style dialogue scenes with a director pass, per-character voices, and paced in-game subtitles.
        Disable to return to the classic narrated-story playstyle.
      </FormHelperText>
    </Box>
  );
}
