/* eslint-disable promise/always-return */

import log from 'electron-log';
import { fetchAuthSession } from '@aws-amplify/auth';
import { useEffect } from 'react';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';

export function refreshAuth() {
  log.debug('Updating auth credentials');
  fetchAuthSession({ forceRefresh: true })
    .then((authSession) => {
      if (!authSession.userSub) {
        log.debug('User not logged in?');
        return;
      }

      if (!authSession.credentials) {
        return;
      }

      log.debug('Updating auth token');
      window.electron.setSetting(SettingsEnum.ACCESS_TOKEN, authSession.tokens?.idToken?.toString());
    })
    .catch((error: unknown) => {
      if (error === 'The user is not authenticated') {
        log.debug('User is not logged in');
      } else {
        log.error(`Unknown Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      }
    });
}

export default function useAuthCredentials() {
  useEffect(() => {
    refreshAuth();

    const intervalId = setInterval(
      () => {
        refreshAuth();
      },
      15 * 60 * 1000,
    ); // 15 minutes in milliseconds

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const removeListener = window.electron.refreshAuth(() => {
      refreshAuth();
    });

    return () => {
      removeListener();
    };
  }, []);
}
