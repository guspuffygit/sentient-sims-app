import { Alert, Box, Button } from '@mui/material';
import { PATREON_MEMBERSHIP_URL } from 'main/sentient-sims/billing/billingFlags';
import { MembershipInfo } from 'main/sentient-sims/models/UserInfo';
import { tierName, upgradeText, usageView } from './membershipView';
import { useBillingActions } from './useBillingActions';
import { useSlowLane } from './useRateCard';

type Props = {
  info: MembershipInfo;
};

// The near, extra and stopped states as one banner. A fast lane member near the cap
// gets a one-click switch to the slow lane when a model in use has one, and a patron
// below the top tier gets the next tier up.
export function UsageAlert({ info }: Props) {
  const { updateSettings, busy } = useBillingActions();
  const slowLane = useSlowLane();
  const { banner } = usageView(info, slowLane);
  if (!banner) {
    return null;
  }
  const { upgrade, offerSlow } = banner;
  const action =
    offerSlow || upgrade ? (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-end' }}>
        {offerSlow ? (
          <Button
            color="inherit"
            size="small"
            disabled={busy}
            onClick={() => {
              void updateSettings({ extraEnabled: info.extraEnabled, extraLimitUsd: info.extraLimitUsd, lane: 'slow' });
            }}
          >
            Switch to slow
          </Button>
        ) : null}
        {upgrade ? (
          <Button
            color="inherit"
            size="small"
            variant="outlined"
            href={PATREON_MEMBERSHIP_URL}
            target="_blank"
            sx={{ whiteSpace: 'nowrap' }}
          >
            Upgrade to {tierName(upgrade.tier)}
          </Button>
        ) : null}
      </Box>
    ) : undefined;
  return (
    <Alert severity={banner.severity} action={action} sx={{ marginTop: 1 }}>
      {banner.text}
      {offerSlow ? ' The slow lane costs less per request and makes your monthly usage last longer.' : ''}
      {upgrade ? ` ${upgradeText(upgrade)}` : ''}
    </Alert>
  );
}
