import { Box, FormControlLabel, TextField, Checkbox } from '@mui/material';
import React from 'react';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from '../hooks/useSetting';

export default function LocalizationSettingsComponent() {
  const customLLMEnabled = useSetting(SettingsEnum.CUSTOM_LLM_ENABLED, false);
  const localizationEnabled = useSetting(
    SettingsEnum.LOCALIZATION_ENABLED,
    false
  );
  const localizationLanguage = useSetting(
    SettingsEnum.LOCALIZATION_LANGUAGE,
    ''
  );

  return (
    <div>
      {!customLLMEnabled.value ? (
        <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
          <FormControlLabel
            label="Localization"
            control={
              <Checkbox
                checked={localizationEnabled.value}
                onChange={(change) =>
                  localizationEnabled.setSetting(change.target.checked)
                }
              />
            }
          />
        </Box>
      ) : null}
      {!customLLMEnabled.value && localizationEnabled.value ? (
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
    </div>
  );
}
