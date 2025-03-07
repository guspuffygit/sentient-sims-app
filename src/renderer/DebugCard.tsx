/* eslint-disable promise/catch-or-return */
/* eslint-disable react/destructuring-assignment */
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import AppCard from './AppCard';
import SendLogButton from './SendLogButton';
import { AIStatusComponent } from './AIStatusComponent';
import { useAISettings } from './providers/AISettingsProvider';
import { useVersions } from './providers/VersionsProvider';
import { VersionFormHelper } from './components/VersionFormHelper';
import PatreonDebug from './components/PatreonDebug';
import WebGpuDebug from './components/WebGpuDebug';

export default function DebugCard() {
  const versions = useVersions();
  const { aiStatus, testAI } = useAISettings();

  const onTest = () => {
    testAI();
    versions.refresh();
  };

  return (
    <AppCard>
      <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
        <Typography>Debug Info</Typography>
        <Tooltip title="Refresh">
          <IconButton
            style={{
              maxWidth: '30px',
              maxHeight: '30px',
              minWidth: '30px',
              minHeight: '30px',
            }}
            sx={{ marginLeft: 1 }}
            onClick={() => onTest()}
            disabled={versions.loading || aiStatus.loading}
          >
            <CachedIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <VersionFormHelper text="App Version" version={versions.app} />
      <VersionFormHelper text="Mod Version" version={versions.mod} />
      <VersionFormHelper text="Game Version" version={versions.game} />
      <AIStatusComponent />
      <PatreonDebug />
      <WebGpuDebug />
      <SendLogButton />
    </AppCard>
  );
}
