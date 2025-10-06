import { Button } from '@aws-amplify/ui-react';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { getPatreonOauthUrl, PatreonButton } from 'renderer/PatreonComponent';

export function PatreonLinkingComponent() {
  const [authInProgress, setAuthInProgress] = useState<boolean>(false);

  const onClick = () => {
    setAuthInProgress(true);
  };

  const cancelGoogleAuthProgress = (
    <>
      <Typography variant="body2" sx={{ marginBottom: 2 }}>
        External browser was opened to link Patreon...
      </Typography>
      <Button onClick={() => setAuthInProgress(false)}>Cancel</Button>
    </>
  );

  const loginAuthenticator = (
    <>
      <Typography align="center" variant="body2" sx={{ mt: 1, mb: 1 }}>
        Link your Patreon account
      </Typography>
      <Box display="flex" justifyContent="center" alignItems="center">
        <PatreonButton url={getPatreonOauthUrl()} onClick={onClick} />
      </Box>
    </>
  );

  return (
    <Box
      minWidth={400}
      minHeight={400}
      justifyContent="center"
      alignItems="center"
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      {authInProgress ? cancelGoogleAuthProgress : loginAuthenticator}
    </Box>
  );
}
