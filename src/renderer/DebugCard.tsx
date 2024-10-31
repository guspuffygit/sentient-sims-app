import { FormHelperText, Typography } from '@mui/material';
import AppCard from './AppCard';
import SendLogButton from './SendLogButton';
import useAppVersion from './hooks/useAppVersion';
import useModVersion from './hooks/useModVersion';
import { AIStatusComponent } from './AIStatusComponent';

export default function DebugCard() {
  const appVersion = useAppVersion();
  const modVersion = useModVersion();

  return (
    <AppCard>
      <Typography sx={{ marginBottom: 1 }}>Debug</Typography>
      <FormHelperText>App Version: {appVersion}</FormHelperText>
      <FormHelperText>Mod Version: {modVersion}</FormHelperText>
      <AIStatusComponent />
      <SendLogButton />
    </AppCard>
  );
}
