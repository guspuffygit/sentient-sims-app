import { Box, Button, Card, Chip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import { PATREON_MEMBERSHIP_URL } from 'main/sentient-sims/billing/billingFlags';
import { useMembership } from 'renderer/hooks/useMembership';
import { PatreonLinkSection } from 'renderer/PatreonComponent';
import { SubscribeButton } from './SubscribeButton';
import {
  ELEVENLABS_PLAN_PERK,
  formatLongDate,
  formatUsd,
  LAUNCH_BONUS,
  LAUNCH_OFFER_DEADLINE,
  launchOfferOpen,
  offerEndsText,
  RECOMMENDED_TIER,
  STRIPE_ENABLED,
  TierCardView,
  tierCardsView,
  tierName,
} from './membershipView';
import { usePlans } from './usePlans';
import { useOpenPricingFromPlan } from './pricingNavigation';
import { tierAccent } from './tierAccents';
import { useLaunchOfferClock } from './useLaunchOfferClock';

const PATREON_LABELS = {
  join: 'Join on Patreon',
  upgrade: 'Upgrade',
  switch: 'Switch',
};

function LaunchOfferBanner({ now }: { now: number }) {
  const ends = offerEndsText(now);
  const violet = tierAccent('tier3');
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.75,
        padding: 1.75,
        borderRadius: 3,
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
        background: (theme) =>
          `linear-gradient(100deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(violet, 0.12)} 60%, ${alpha(theme.palette.warning.main, 0.08)})`,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          color: 'primary.contrastText',
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${violet})`,
          boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
        }}
      >
        <AutoAwesomeRoundedIcon fontSize="small" />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>
          {LAUNCH_BONUS.multiplier}x AI usage until {formatLongDate(LAUNCH_BONUS.until)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Only for members who join before {LAUNCH_OFFER_DEADLINE}. Their tier includes twice its usage every month
          until {formatLongDate(LAUNCH_BONUS.until)}. Anyone who joins after the deadline gets the regular amount.
        </Typography>
      </Box>
      {ends ? (
        <Chip
          label={ends}
          size="small"
          sx={{ flexShrink: 0, fontWeight: 600, bgcolor: (theme) => alpha(theme.palette.common.white, 0.08) }}
        />
      ) : null}
    </Box>
  );
}

function UsageAmount({ view, accent }: { view: TierCardView; accent: string }) {
  const { plan, bonusUsd, bonusUntil } = view;
  return (
    <Box
      sx={{
        padding: 1.25,
        borderRadius: 2,
        border: `1px solid ${alpha(accent, 0.22)}`,
        backgroundColor: alpha(accent, 0.08),
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        AI usage every month
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 1 }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          {formatUsd(bonusUsd ?? plan.includedUsd)}
        </Typography>
        {bonusUsd ? (
          <>
            <Typography
              variant="body2"
              component="span"
              sx={{ color: 'text.disabled', textDecoration: 'line-through' }}
            >
              {formatUsd(plan.includedUsd)}
            </Typography>
            <Chip
              label={`${Math.round(bonusUsd / plan.includedUsd)}x`}
              size="small"
              color="success"
              sx={{ height: 20, fontWeight: 700, fontSize: '0.7rem' }}
            />
          </>
        ) : null}
      </Box>
      {bonusUsd && bonusUntil ? (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          Until {formatLongDate(bonusUntil)}
        </Typography>
      ) : null}
    </Box>
  );
}

function PerkList({ perks, accent }: { perks: string[]; accent: string }) {
  return (
    <Box
      component="ul"
      sx={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', alignContent: 'start', gap: 0.75, flex: 1 }}
    >
      {perks.map((perk) => {
        const voices = perk === ELEVENLABS_PLAN_PERK;
        const Icon = voices ? RecordVoiceOverRoundedIcon : CheckRoundedIcon;
        return (
          <Box component="li" key={perk} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Icon sx={{ fontSize: 18, marginTop: '1px', color: voices ? accent : 'success.main' }} />
            <Typography variant="body2" sx={{ fontWeight: voices ? 600 : 400 }}>
              {perk}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function CardAction({ view, highlighted }: { view: TierCardView; highlighted: boolean }) {
  if (view.action === 'current') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.75,
          height: 36,
          borderRadius: 2,
          color: 'success.light',
          backgroundColor: (theme) => alpha(theme.palette.success.main, 0.12),
        }}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Your current plan
        </Typography>
      </Box>
    );
  }
  if (STRIPE_ENABLED) {
    return (
      <SubscribeButton
        tier={view.plan.tier}
        label={`Choose ${tierName(view.plan.tier)}`}
        variant={highlighted ? 'contained' : 'outlined'}
        size="medium"
        fullWidth
      />
    );
  }
  const filled = view.action === 'upgrade' || (view.action === 'join' && highlighted);
  return (
    <Button
      href={PATREON_MEMBERSHIP_URL}
      target="_blank"
      variant={filled ? 'contained' : 'outlined'}
      color={view.action === 'switch' ? 'secondary' : 'primary'}
      endIcon={<OpenInNewRoundedIcon sx={{ fontSize: '16px !important' }} />}
      fullWidth
      sx={{ whiteSpace: 'nowrap' }}
    >
      {PATREON_LABELS[view.action]}
    </Button>
  );
}

function PlanCard({ view, highlighted }: { view: TierCardView; highlighted: boolean }) {
  const accent = tierAccent(view.plan.tier);
  const current = view.action === 'current';
  return (
    <Card
      sx={{
        'position': 'relative',
        'display': 'flex',
        'flexDirection': 'column',
        'minWidth': 0,
        'borderColor': highlighted ? alpha(accent, 0.65) : undefined,
        'background': (theme) =>
          `linear-gradient(180deg, ${alpha(accent, highlighted ? 0.16 : 0.09)}, transparent 150px), ${theme.palette.background.paper}`,
        'boxShadow': highlighted ? `0 6px 24px ${alpha(accent, 0.18)}` : undefined,
        'transition': 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '0 0 auto 0',
          height: 3,
          background: `linear-gradient(90deg, ${accent}, ${alpha(accent, 0.25)})`,
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: alpha(accent, 0.55),
          boxShadow: `0 10px 28px ${alpha(accent, 0.2)}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, padding: 2.25, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minHeight: 24 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: accent }}>
            {tierName(view.plan.tier)}
          </Typography>
          {current ? (
            <Chip label="Your plan" size="small" color="success" sx={{ height: 22, fontWeight: 600 }} />
          ) : view.badge ? (
            <Chip
              label={view.badge}
              size="small"
              sx={{ height: 22, fontWeight: 600, color: accent, backgroundColor: alpha(accent, 0.14) }}
            />
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography variant="h3" component="div" sx={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {formatUsd(view.plan.priceUsd)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            / month
          </Typography>
        </Box>
        <UsageAmount view={view} accent={accent} />
        <PerkList perks={view.perks} accent={accent} />
        <CardAction view={view} highlighted={highlighted} />
      </Box>
    </Card>
  );
}

type Props = {
  // Hide the pricing link where the page already has one
  pricingLink?: boolean;
};

// The plans side by side. With Stripe on, prices come from Stripe through the server;
// otherwise these are the Patreon tiers and joining ends with linking the account.
export function PlanPicker({ pricingLink = true }: Props) {
  const { plans } = usePlans();
  const { membership, info } = useMembership();
  const openPricing = useOpenPricingFromPlan();
  const now = useLaunchOfferClock();
  const views = tierCardsView(plans, info, now);
  const hasCurrent = views.some((view) => view.action === 'current');
  const member = membership.isMember();
  const columns = Math.min(views.length, 4);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, containerType: 'inline-size' }}>
      {!member && launchOfferOpen(now) ? <LaunchOfferBanner now={now} /> : null}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: '1fr',
          [`@container (min-width: 440px)`]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
          [`@container (min-width: 760px)`]: { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` },
        }}
      >
        {views.map((view) => (
          <PlanCard
            key={view.plan.tier}
            view={view}
            highlighted={hasCurrent ? view.action === 'current' : view.plan.tier === RECOMMENDED_TIER}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {STRIPE_ENABLED
            ? "Plus tax where applicable. Cancel any time. Checkout opens in your browser. AI usage is metered at the provider's own prices."
            : 'Patreon opens in your browser. Change or cancel your tier there any time.'}
        </Typography>
        {pricingLink ? (
          <Button size="small" onClick={openPricing}>
            See model pricing
          </Button>
        ) : null}
      </Box>
      {STRIPE_ENABLED || member ? null : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1.5,
            padding: 1.5,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            backgroundColor: 'background.elevated',
          }}
        >
          <Typography variant="body2" sx={{ flex: 1, minWidth: 200 }}>
            After you pledge, link your Patreon account so the app knows your tier.
          </Typography>
          <PatreonLinkSection membership={membership} />
        </Box>
      )}
    </Box>
  );
}
