import {
  Box,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import EditIcon from '@mui/icons-material/Edit';
import useSetting from 'renderer/hooks/useSetting';

import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType, ApiTypeFromValue } from 'main/sentient-sims/models/ApiType';
import AppCard from './AppCard';
import SentientSimsSettingsComponent from './settings/CustomLLMSettings';
import DebugLogsSettingsComponent from './settings/DebugLogsSettingsComponent';
import LocalizationSettingsComponent from './settings/LocalizationSettingsComponent';
import OpenAISettingsComponent from './settings/OpenAISettingsComponent';
import { AISelectionComponent } from './settings/AISelectionComponent';
import { AnimationMappingSettingsComponent } from './settings/AnimationMappingSettingsComponent';
import { KoboldAISettingsComponent } from './settings/KoboldAISettingsComponent';

export default function SettingsPage() {
  const aiType = useSetting(
    SettingsEnum.AI_API_TYPE,
    ApiType.OpenAI.toString()
  );
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

  const apiType = ApiTypeFromValue(aiType.value);

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
      <DebugLogsSettingsComponent />
      <AISelectionComponent aiType={aiType} apiType={apiType} />
      <OpenAISettingsComponent apiType={apiType}>
        <LocalizationSettingsComponent />
      </OpenAISettingsComponent>
      <KoboldAISettingsComponent apiType={apiType} />
      <SentientSimsSettingsComponent apiType={apiType} />
      <AnimationMappingSettingsComponent apiType={apiType} />
    </AppCard>
  );
}
