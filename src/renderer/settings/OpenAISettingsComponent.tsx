import { Box, Button, Divider, TextField, Typography } from '@mui/material';
import useSetting from 'renderer/hooks/useSetting';
import log from 'electron-log';
import AppCard from '../AppCard';

export default function OpenAISettingsComponent() {
  const modsDirectory = useSetting('modsDirectory');

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
      <Box display="flex" alignItems="center">
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
    </AppCard>
  );
}
