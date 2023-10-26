import { Box, FormControlLabel, Checkbox } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from '../hooks/useSetting';

export default function NsfwSettingsComponent() {
  const nsfwEnabled = useSetting(SettingsEnum.NSFW_ENABLED, false);

  return (
    <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
      <FormControlLabel
        label="Force Enable NSFW"
        control={
          <Checkbox
            checked={nsfwEnabled.value}
            onChange={(change) => nsfwEnabled.setSetting(change.target.checked)}
          />
        }
      />
    </Box>
  );
}
