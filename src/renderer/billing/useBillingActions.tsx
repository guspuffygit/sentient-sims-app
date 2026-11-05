import { useCallback, useState } from 'react';
import log from 'electron-log';
import { fetchAuthSession } from 'aws-amplify/auth';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';
import { BillingSettingsRequest, MembershipInfo, Tier } from 'main/sentient-sims/models/UserInfo';
import { useMembership } from 'renderer/hooks/useMembership';

const client = new SentientSimsAppClient();

async function idToken(): Promise<string> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) {
    throw new Error('Sign in first');
  }
  return token;
}

function errorText(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

// Checkout and the customer portal open in the system browser; the browser lands
// back on the app's /billing/return route, which refreshes the membership
export function useBillingActions() {
  const { endpoint, refresh } = useMembership();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    setBusy(true);
    setError(undefined);
    try {
      return await action();
    } catch (err) {
      log.error('Billing action failed', err);
      setError(errorText(err));
      return undefined;
    } finally {
      setBusy(false);
    }
  }, []);

  const subscribe = useCallback(
    (tier: Tier) =>
      run(async () => {
        const url = await client.sentientSimsAiApi.createCheckout({ tier }, await idToken(), endpoint);
        window.electron.openBrowserLink(url);
        return true;
      }),
    [endpoint, run],
  );

  const manage = useCallback(
    () =>
      run(async () => {
        const url = await client.sentientSimsAiApi.createPortal({}, await idToken(), endpoint);
        window.electron.openBrowserLink(url);
      }),
    [endpoint, run],
  );

  const updateSettings = useCallback(
    (settings: BillingSettingsRequest): Promise<MembershipInfo | undefined> =>
      run(async () => {
        const info = await client.sentientSimsAiApi.updateBillingSettings(settings, await idToken(), endpoint);
        await refresh();
        return info;
      }),
    [endpoint, refresh, run],
  );

  return { subscribe, manage, updateSettings, busy, error };
}
