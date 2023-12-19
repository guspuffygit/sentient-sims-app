import {
  Box,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import useSetting from 'renderer/hooks/useSetting';
import log from 'electron-log';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import EditIcon from '@mui/icons-material/Edit';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import AppCard from '../AppCard';
import CustomLLMSettingsComponent from './CustomLLMSettings';
import LocalizationSettingsComponent from './LocalizationSettingsComponent';
import DebugLogsSettingsComponent from './DebugLogsSettingsComponent';
import NsfwSettingsComponent from './NsfwSettingsComponent';

export default function OpenAISettingsComponent() {
  const modsDirectory = useSetting(SettingsEnum.MODS_DIRECTORY);

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
          sx={{ marginRight: 1 }}
        />
        <Tooltip title="Edit">
          <IconButton onClick={() => handleDirectoryPicker()}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset to Default">
          <IconButton onClick={() => modsDirectory.resetSetting()}>
            <RotateLeftIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <CustomLLMSettingsComponent />
      <LocalizationSettingsComponent />
      <NsfwSettingsComponent />
      <DebugLogsSettingsComponent />
    </AppCard>
  );
}
