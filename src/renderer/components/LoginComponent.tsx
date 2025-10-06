import { Authenticator, Button } from '@aws-amplify/ui-react';
import { signInWithRedirect } from 'aws-amplify/auth';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { GoogleLoginButton } from './GoogleLoginButton';

export function LoginComponent() {
  const [authInProgress, setAuthInProgress] = useState<boolean>(false);

  const onClick = () => {
    const storageLength = window.localStorage.length;
    const keys: string[] = [];
    for (let i = 0; i < storageLength; i++) {
      const key: string | null = window.localStorage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    keys
      .filter((key) => key.startsWith('CognitoIdentityServiceProvider'))
      .forEach((key) => {
        window.localStorage.removeItem(key);
      });
    setAuthInProgress(true);
    signInWithRedirect({
      provider: 'Google',
    });
  };

  const cancelGoogleAuthProgress = (
    <>
      <Typography variant="body2" sx={{ marginBottom: 2 }}>
        External browser was opened to login with Google...
      </Typography>
      <Button onClick={() => setAuthInProgress(false)}>Cancel</Button>
    </>
  );

  const loginAuthenticator = (
    <>
      <Authenticator socialProviders={[]} />
      <GoogleLoginButton onClick={onClick} />
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
