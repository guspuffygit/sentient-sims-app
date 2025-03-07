import { Box, FormControlLabel, TextField, Checkbox } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import HelpButton from 'renderer/components/HelpButton';
import useSetting from '../hooks/useSetting';

export default function LocalizationSettingsComponent() {
  const localizationEnabled = useSetting(
    SettingsEnum.LOCALIZATION_ENABLED,
    false,
  );
  const localizationLanguage = useSetting(
    SettingsEnum.LOCALIZATION_LANGUAGE,
    '',
  );

  return (
    <>
      <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
        <FormControlLabel
          label="Translate/Language"
          control={
            <Checkbox
              checked={localizationEnabled.value}
              onChange={(change) =>
                localizationEnabled.setSetting(change.target.checked)
              }
            />
          }
        />
        <HelpButton url="https://github.com/guspuffygit/sentient-sims-app/wiki/How%E2%80%90to-Use-The-Sentient-Sims-App#translation-and-language-support" />
      </Box>
      {localizationEnabled.value ? (
        <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
          <TextField
            focused
            id="outlined-basic"
            label="Translate To Language"
            variant="outlined"
            value={localizationLanguage.value}
            size="small"
            fullWidth
            onChange={(change) =>
              localizationLanguage.setSetting(change.target.value)
            }
            sx={{ marginRight: 2 }}
          />
        </Box>
      ) : null}
    </>
  );
}
