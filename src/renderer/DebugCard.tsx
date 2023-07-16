import { Typography } from '@mui/material';
import AppCard from './AppCard';
import SendLogButton from './SendLogButton';
import useAppVersion from './hooks/useAppVersion';
import useModVersion from './hooks/useModVersion';

export default function DebugCard() {
  const appVersion = useAppVersion();
  const modVersion = useModVersion();

  return (
    <AppCard>
      <Typography sx={{ marginBottom: 1 }}>Debug</Typography>
      <Typography variant="body2" color="text.secondary">
        App Version: {appVersion}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ marginBottom: 3 }}
      >
        Mod Version: {modVersion}
      </Typography>
      <SendLogButton />
    </AppCard>
  );
}
