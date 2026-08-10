import { Box, IconButton, Tooltip } from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import TerminalIcon from '@mui/icons-material/Terminal';
import AppCard from './AppCard';
import { SendLogButton } from './SendLogButton';
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
    void testAI();
    void versions.refresh();
  };

  return (
    <AppCard
      title="Debug Info"
      icon={<TerminalIcon fontSize="small" />}
      headerAction={
        <Tooltip title="Refresh">
          <span>
            <IconButton
              size="small"
              onClick={() => {
                onTest();
              }}
              disabled={versions.loading || aiStatus.loading}
            >
              <CachedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      }
    >
      <Box
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          paddingX: 1.5,
          paddingY: 1,
        }}
      >
        <VersionFormHelper text="App Version" version={versions.app} />
        <VersionFormHelper text="Mod Version" version={versions.mod} />
        <VersionFormHelper text="Game Version" version={versions.game} />
        <AIStatusComponent />
        <PatreonDebug />
        <WebGpuDebug />
      </Box>
      <SendLogButton />
    </AppCard>
  );
}
