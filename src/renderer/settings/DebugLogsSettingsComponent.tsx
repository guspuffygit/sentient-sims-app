import { Box, FormControlLabel, Checkbox } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import log from 'electron-log';
import useSetting from '../hooks/useSetting';

export default function DebugLogsSettingsComponent() {
  const debugLogsEnabled = useSetting(SettingsEnum.DEBUG_LOGS, false);

  return (
    <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
      <FormControlLabel
        label="Enable Debug Logging"
        control={
          <Checkbox
            checked={debugLogsEnabled.value}
            onChange={(change) => {
              debugLogsEnabled.setSetting(change.target.checked);
              if (change.target.checked) {
                log.transports.console.level = 'debug';
              } else {
                log.transports.console.level = 'info';
              }
            }}
          />
        }
      />
    </Box>
  );
}
