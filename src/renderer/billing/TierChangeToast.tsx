import { useEffect, useRef } from 'react';
import { MembershipInfo } from 'main/sentient-sims/models/UserInfo';
import { useMembership } from 'renderer/hooks/useMembership';
import { useSnackBar } from 'renderer/providers/SnackBarProvider';
import { tierChangeMessage } from './planRefresh';

// Watches every /me answer, so an upgrade shows up whichever path fetched it: the
// poll, the Refresh plan button, or the Stripe return. The query is keyed per account,
// so a sign-out hands the next account an empty "before"
export function TierChangeToast() {
  const { info } = useMembership();
  const { showMessage } = useSnackBar();
  const seenRef = useRef<MembershipInfo | undefined>(undefined);

  useEffect(() => {
    if (!info) {
      seenRef.current = undefined;
      return;
    }
    const before = seenRef.current;
    seenRef.current = info;
    const message = tierChangeMessage(before, info);
    if (message) {
      showMessage(message, 'success');
    }
  }, [info, showMessage]);

  return null;
}
