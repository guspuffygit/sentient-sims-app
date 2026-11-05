import log from 'electron-log';
import { fetchAuthSession } from '@aws-amplify/auth';
import { useEffect } from 'react';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';

// Forces a new ID token from Cognito and hands it to the main process, which sends it
// on every Sentient Sims AI request. Resolves without a token when nobody is signed in.
export async function refreshAuthToken(): Promise<string | undefined> {
  log.debug('Updating auth credentials');
  const authSession = await fetchAuthSession({ forceRefresh: true });
  if (!authSession.userSub) {
    log.debug('User not logged in?');
    return undefined;
  }
  if (!authSession.credentials) {
    return undefined;
  }

  log.debug('Updating auth token');
  const idToken = authSession.tokens?.idToken?.toString();
  window.electron.setSetting(SettingsEnum.ACCESS_TOKEN, idToken);
  return idToken;
}

export function refreshAuth() {
  refreshAuthToken().catch((error: unknown) => {
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
