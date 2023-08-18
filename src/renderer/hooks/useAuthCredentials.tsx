/* eslint-disable promise/always-return,react-hooks/exhaustive-deps */
/* eslint-disable promise/catch-or-return */
import log from 'electron-log';
import { Auth } from 'aws-amplify';
import { CognitoUser } from '@aws-amplify/auth';
import { useEffect } from 'react';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';

function refreshAuth() {
  log.debug('Updating auth credentials');
  Auth.currentAuthenticatedUser({ bypassCache: true })
    .then(async (user: CognitoUser) => {
      if (!user) {
        log.debug('User not logged in?');
        return;
      }
      const session = user.getSignInUserSession();
      if (!session) {
        return;
      }

      log.debug('Updated auth token');
      log.debug(`idToken: ${session.getIdToken().getJwtToken()}`);
      window.electron.setSetting(
        SettingsEnum.ACCESS_TOKEN,
        session.getIdToken().getJwtToken()
      );
    })
    .catch((error: any) => {
      if (error === 'The user is not authenticated') {
        log.debug('User is not logged in');
      } else {
        log.error(`Unknown Error: ${error}`);
      }
    });
}

export default function useAuthCredentials() {
  useEffect(() => {
    refreshAuth();

    const intervalId = setInterval(() => {
      refreshAuth();
    }, 15 * 60 * 1000); // 15 minutes in milliseconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  async function onAuth(_event: any, url: string) {
    log.debug('onAuth running');
    log.debug(`onAuth: ${url}`);
    // eslint-disable-next-line no-restricted-globals
    Object.defineProperty(history, 'replaceState', {
      configurable: true,
      value: () => {},
    });
    // eslint-disable-next-line no-underscore-dangle
    await (Auth as any)._handleAuthResponse(url);
    window.electron.onSuccessfulAuth();
  }

  useEffect(() => {
    const removeListener = window.electron.onAuth(onAuth);

    return () => {
      removeListener();
    };
  }, []);
}
