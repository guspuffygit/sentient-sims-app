import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import log from 'electron-log';
import { useAuth } from 'renderer/providers/AuthProvider';
import { useMembership } from 'renderer/hooks/useMembership';
import { useSnackBar } from 'renderer/providers/SnackBarProvider';
import { cooldownLeftMs, tierChangeMessage } from './planRefresh';

// Module scope, so leaving the tab and coming back does not reset the cooldown
let lastRefreshAt: number | undefined;

// Renews the ID token, rereads the claims and asks /me again. A change of tier is
// announced by TierChangeToast; this button only speaks when nothing changed.
export function RefreshPlanButton() {
  const { refreshUserAttributes } = useAuth();
  const { me, info } = useMembership();
  const { showMessage } = useSnackBar();
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const left = cooldownLeftMs(lastRefreshAt, now);

  useEffect(() => {
    if (left <= 0) {
      return undefined;
    }
    const timer = setTimeout(
      () => {
        setNow(Date.now());
      },
      Math.min(1000, left),
    );
    return () => {
      clearTimeout(timer);
    };
  }, [left]);

  const refresh = async () => {
    const pressedAt = Date.now();
    if (busy || cooldownLeftMs(lastRefreshAt, pressedAt) > 0) {
      return;
    }
    lastRefreshAt = pressedAt;
    setNow(pressedAt);
    setBusy(true);
    const before = info;
    try {
      await refreshUserAttributes();
      const result = await me.refetch();
      if (result.isError) {
        throw result.error;
      }
      if (!tierChangeMessage(before, result.data?.membership)) {
        showMessage('No plan change found. A change on Patreon can take a minute to reach the app.', 'info');
      }
    } catch (error) {
      log.error(`Plan refresh failed: ${error instanceof Error ? error.message : String(error)}`);
      showMessage('Could not reach the Sentient Sims server. Try again in a moment.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const seconds = Math.ceil(left / 1000);
  let label = 'Refresh plan';
  if (busy) {
    label = 'Refreshing…';
  } else if (seconds > 0) {
    label = `Refresh plan (${seconds}s)`;
  }

  return (
    <Button
      variant="outlined"
      size="small"
      disabled={busy || left > 0}
      onClick={() => {
        void refresh();
      }}
    >
      {label}
    </Button>
  );
}
