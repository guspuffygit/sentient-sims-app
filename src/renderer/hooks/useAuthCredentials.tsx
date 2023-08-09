/* eslint-disable promise/always-return,react-hooks/exhaustive-deps */
/* eslint-disable promise/catch-or-return */
import log from 'electron-log';
import { Auth } from 'aws-amplify';
import { CognitoUser } from '@aws-amplify/auth';
import { useEffect } from 'react';
import { AmplifyUser } from '@aws-amplify/ui';

function refreshAuth(amplifyUser?: AmplifyUser) {
  log.debug('Updating auth credentials');
  if (!amplifyUser) {
    return;
  }

  Auth.currentAuthenticatedUser({ bypassCache: true }).then(
    async (user: CognitoUser) => {
      if (!user) {
        return;
      }
      const session = user.getSignInUserSession();
      if (!session) {
        return;
      }

      window.electron.setAccessToken(session.getAccessToken().getJwtToken());
    }
  );
}

export default function useAuthCredentials(amplifyUser?: AmplifyUser) {
  useEffect(() => {
    refreshAuth(amplifyUser);

    const intervalId = setInterval(() => {
      refreshAuth(amplifyUser);
    }, 15 * 60 * 1000); // 15 minutes in milliseconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);
}
