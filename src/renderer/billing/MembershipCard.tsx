import { Box, Button, LinearProgress, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate } from 'react-router-dom';
import { Membership } from 'main/sentient-sims/wrappers/Membership';
import AppCard from 'renderer/AppCard';
import { useAuth } from 'renderer/providers/AuthProvider';
import { useDebugMode } from 'renderer/providers/DebugModeProvider';
import { useMembership } from 'renderer/hooks/useMembership';
import { ThankYouList } from 'renderer/ThankYouCard';
import { UsageAlert } from './UsageAlert';
import { formatUsd, tierName, usageView } from './membershipView';
import { usePlans } from './usePlans';

function MemberThanks({ membership }: { membership: Membership }) {
  const { enableDebugMode } = useDebugMode();
  if (membership.isDev()) {
    return (
      <Button
        onClick={() => {
          enableDebugMode();
        }}
      >
        Thank you for being a Dev!
      </Button>
    );
  }
  const text = membership.isPatreonMember()
    ? `Thank you for being a ${tierName(membership.getTier())} Patreon supporter!`
    : `Thank you for being a ${tierName(membership.getTier())} Sentient Sims member!`;
  return (
    <Typography variant="h6" align="center">
      {text}
    </Typography>
  );
}

function JoinPrompt() {
  const { plans } = usePlans();
  const navigate = useNavigate();
  const cheapest = plans.reduce((low, plan) => (plan.priceUsd < low.priceUsd ? plan : low), plans[0]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, margin: 2 }}>
      <Typography variant="body1" align="center">
        Sentient Sims AI from {formatUsd(cheapest.priceUsd)} a month, with AI usage included.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => {
          void navigate('/settings', { state: { tab: 'membership' } });
        }}
      >
        See plans
      </Button>
    </Box>
  );
}

function MembershipSummary() {
  const { userAttributes } = useAuth();
  const { membership, info } = useMembership();
  const navigate = useNavigate();
  if (!userAttributes) {
    return null;
  }
  if (!membership.isMember()) {
    return <JoinPrompt />;
  }
  const view = info && !membership.isDev() ? usageView(info) : undefined;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, margin: 2 }}>
      <MemberThanks membership={membership} />
      {view ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">{view.usageText}</Typography>
            <Button
              size="small"
              onClick={() => {
                void navigate('/settings', { state: { tab: 'membership' } });
              }}
            >
              Plan
            </Button>
          </Box>
          <LinearProgress variant="determinate" value={view.percent} sx={{ height: 6, borderRadius: 3 }} />
        </Box>
      ) : null}
      {info ? <UsageAlert info={info} /> : null}
    </Box>
  );
}

export function MembershipCard() {
  return (
    <AppCard
      title="Your plan"
      subtitle="Thanks to the Devs, members and Patrons who make Sentient Sims possible"
      icon={<FavoriteIcon fontSize="small" />}
    >
      <MembershipSummary />
      <ThankYouList />
    </AppCard>
  );
}
