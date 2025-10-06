import { Button } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { PatreonButton } from 'renderer/PatreonComponent';
import log from 'electron-log';
import { useAuth } from 'renderer/providers/AuthProvider';

export function PatreonSubscribingComponent() {
  const { refreshUserAttributes } = useAuth();
  const [subscribingInProgress, setSubscribingInProgress] = useState<boolean>(false);

  const onClick = () => {
    setSubscribingInProgress(true);
  };

  const cancelSubscribingInProgress = (
    <>
      <Typography variant="body2" sx={{ marginBottom: 2 }}>
        External browser was opened to subscribe to Patreon...
      </Typography>
      <Button onClick={() => setSubscribingInProgress(false)}>Cancel</Button>
    </>
  );

  const subscribeToPatreon = (
    <>
      <Typography align="center" variant="body2" sx={{ mt: 1, mb: 1 }}>
        Click this button to open Patreon to subscribe
      </Typography>
      <Box display="flex" justifyContent="center" alignItems="center">
        <PatreonButton url="https://www.patreon.com/SentientSims/membership" onClick={onClick} />
      </Box>
    </>
  );

  useEffect(() => {
    const performTask = () => {
      refreshUserAttributes();
    };

    const intervalId = setInterval(performTask, 10000);

    return () => {
      clearInterval(intervalId);
      log.debug('refreshUserAttributes interval cleared');
    };
  }, [refreshUserAttributes]);

  return (
    <Box
      minWidth={400}
      minHeight={400}
      justifyContent="center"
      alignItems="center"
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      {subscribingInProgress ? cancelSubscribingInProgress : subscribeToPatreon}
      <Typography variant="body2" sx={{ marginTop: 2 }}>
        This page automatically refreshes
      </Typography>
    </Box>
  );
}
