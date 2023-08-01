import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import useSetting from 'renderer/hooks/useSetting';
import log from 'electron-log';
import React from 'react';
import AppCard from '../AppCard';

export default function OpenAISettingsComponent() {
  const modsDirectory = useSetting('modsDirectory');
  const customLLMEnabled = useSetting('customLLMEnabled', false);
  const customLLMHostname = useSetting('customLLMHostname');

  const handleDirectoryPicker = async () => {
    try {
      const filePath = await window.electron.selectDirectory();
      if (filePath) {
        log.info(`Changed Mods directory to: ${filePath}`);
        modsDirectory.setSetting(filePath);
      }
    } catch (error) {
      log.error('Error selecting directory:', error);
    }
  };

  return (
    <AppCard>
      <Typography>Settings</Typography>
      <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
      <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
        <TextField
          focused
          id="outlined-basic"
          label="Mods Directory"
          variant="outlined"
          value={modsDirectory.value}
          size="small"
          fullWidth
          InputProps={{
            readOnly: true,
          }}
          sx={{ marginRight: 2 }}
        />
        <Button
          color="secondary"
          variant="outlined"
          onClick={() => handleDirectoryPicker()}
        >
          Modify
        </Button>
      </Box>
      <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
        <FormControlLabel
          label="Enable Custom LLM"
          control={
            <Checkbox
              checked={customLLMEnabled.value}
              onChange={(change) =>
                customLLMEnabled.setSetting(change.target.checked)
              }
            />
          }
        />
      </Box>
      {customLLMEnabled.value ? (
        <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
          <TextField
            focused
            id="outlined-basic"
            label="Custom LLM Hostname"
            variant="outlined"
            value={customLLMHostname.value}
            size="small"
            fullWidth
            onChange={(change) =>
              customLLMHostname.setSetting(change.target.value)
            }
            sx={{ marginRight: 2 }}
          />
        </Box>
      ) : null}
    </AppCard>
  );
}
