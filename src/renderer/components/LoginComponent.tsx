import { Authenticator, Button } from '@aws-amplify/ui-react';
import {
  resetPassword,
  ResetPasswordInput,
  signIn,
  SignInInput,
  signInWithRedirect,
  signUp,
  SignUpInput,
} from 'aws-amplify/auth';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { GoogleLoginButton } from './GoogleLoginButton';

// Usernames should not depend on case. New accounts are made lowercase; a
// sign-in or reset tries the name as typed (older mixed-case accounts) and
// then lowercase, so either spelling finds the account.
function isUserNotFound(err: unknown): boolean {
  return err instanceof Error && err.name === 'UserNotFoundException';
}

async function withUsernameCase<T>(username: string, attempt: (name: string) => Promise<T>): Promise<T> {
  const typed = username.trim();
  const lower = typed.toLowerCase();
  try {
    return await attempt(typed);
  } catch (err) {
    if (lower !== typed && isUserNotFound(err)) {
      return attempt(lower);
    }
    throw err;
  }
}

const authServices = {
  handleSignIn: (input: SignInInput) => withUsernameCase(input.username, (username) => signIn({ ...input, username })),
  handleSignUp: (input: SignUpInput) => signUp({ ...input, username: input.username.trim().toLowerCase() }),
  handleForgotPassword: (input: ResetPasswordInput) =>
    withUsernameCase(input.username, (username) => resetPassword({ ...input, username })),
};

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
    void signInWithRedirect({
      provider: 'Google',
    });
  };

  const cancelGoogleAuthProgress = (
    <>
      <Typography variant="body2" sx={{ marginBottom: 2 }}>
        External browser was opened to login with Google...
      </Typography>
      <Button
        onClick={() => {
          setAuthInProgress(false);
        }}
      >
        Cancel
      </Button>
    </>
  );

  const loginAuthenticator = (
    <>
      <Authenticator socialProviders={[]} services={authServices} />
      <GoogleLoginButton onClick={onClick} />
    </>
  );

  return (
    <Box
      sx={{
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {authInProgress ? cancelGoogleAuthProgress : loginAuthenticator}
    </Box>
  );
}
