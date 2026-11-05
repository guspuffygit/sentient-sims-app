import { useEffect } from 'react';
import log from 'electron-log';
import { useQueryClient } from '@tanstack/react-query';
import { BillingReturnKind } from 'main/sentient-sims/billing/billingReturn';
import { UsageHeader } from 'main/sentient-sims/billing/usageHeader';
import { UserInfo } from 'main/sentient-sims/models/UserInfo';
import { useAuth } from 'renderer/providers/AuthProvider';
import { fetchMe, useMembership } from 'renderer/hooks/useMembership';
import { meQueryKey, patchMeUsage } from './meQuery';
import { waitForStripeMembership } from './waitForStripeMembership';

// Runs once the browser has landed on /billing/return: renews the ID token (the
// Stripe webhook also writes the Cognito claims), then rereads /me until the new
// membership shows, so the wizard and the panel move on without a restart
export function BillingReturnListener() {
  const { refreshUserAttributes } = useAuth();
  const { endpoint } = useMembership();
  const queryClient = useQueryClient();

  useEffect(() => {
    const removeListener = window.electron.onUsage((_event: unknown, header: UsageHeader) => {
      queryClient.setQueriesData<UserInfo>({ queryKey: meQueryKey }, (me) => patchMeUsage(me, header));
    });
    return () => {
      removeListener();
    };
  }, [queryClient]);

  useEffect(() => {
    const removeListener = window.electron.onBillingReturn((_event: unknown, kind: BillingReturnKind) => {
      log.info(`Billing return: ${kind}`);
      void (async () => {
        await refreshUserAttributes();
        await queryClient.invalidateQueries({ queryKey: meQueryKey });
        if (kind !== 'success') {
          return;
        }
        const info = await waitForStripeMembership(async () => (await fetchMe(endpoint)).membership);
        await refreshUserAttributes();
        await queryClient.invalidateQueries({ queryKey: meQueryKey });
        log.info(`Membership after checkout: ${info ? `${info.source} ${info.member}` : 'unknown'}`);
      })();
    });

    return () => {
      removeListener();
    };
  }, [endpoint, queryClient, refreshUserAttributes]);

  return null;
}
