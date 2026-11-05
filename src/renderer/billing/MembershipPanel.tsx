import {
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  FormHelperText,
  LinearProgress,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { useState } from 'react';
import { Lane, MembershipInfo } from 'main/sentient-sims/models/UserInfo';
import { Membership } from 'main/sentient-sims/wrappers/Membership';
import { useAuth } from 'renderer/providers/AuthProvider';
import { useMembership } from 'renderer/hooks/useMembership';
import { PatreonLinkSection } from 'renderer/PatreonComponent';
import { ManageBillingButton } from './ManageBillingButton';
import { PlanPicker } from './PlanPicker';
import { RefreshPlanButton } from './RefreshPlanButton';
import { tierAccent } from './tierAccents';
import { UsageAlert } from './UsageAlert';
import { UsageGuide } from './UsageGuide';
import { useBillingActions } from './useBillingActions';
import { useSlowLane } from './useRateCard';
import {
  bonusText,
  clampExtraLimit,
  EXTRA_LIMIT_MAX_USD,
  formatUsd,
  FOUNDER_ACCESS_TEXT,
  patreonPlans,
  planLabel,
  sourceName,
  statusView,
  STRIPE_ENABLED,
  tierName,
  usageView,
} from './membershipView';

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="subtitle2">{title}</Typography>
      {hint ? <FormHelperText sx={{ margin: 0, marginBottom: 1 }}>{hint}</FormHelperText> : null}
      {children}
    </Box>
  );
}

function PlanHeader({ membership, info }: { membership: Membership; info?: MembershipInfo }) {
  const status = statusView(info);
  const bonus = bonusText(info);
  const source = sourceName(membership.getSource());
  const accent = tierAccent(membership.getTier());
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        borderRadius: 3,
        border: `1px solid ${alpha(accent, 0.35)}`,
        background: `linear-gradient(115deg, ${alpha(accent, 0.18)}, ${alpha(accent, 0.03)} 70%)`,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          width: 48,
          height: 48,
          borderRadius: 2.5,
          color: accent,
          backgroundColor: alpha(accent, 0.16),
          border: `1px solid ${alpha(accent, 0.3)}`,
        }}
      >
        <WorkspacePremiumRoundedIcon />
      </Box>
      <Box sx={{ flex: 1, minWidth: 200 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Your plan
        </Typography>
        <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
          {source ? tierName(membership.getTier()) : planLabel(membership)}
        </Typography>
        {source ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {source}
            {info?.priceUsd ? ` · ${formatUsd(info.priceUsd)} a month` : ''}
            {info ? ` · ${formatUsd(info.includedUsd)} of AI usage included` : ''}
          </Typography>
        ) : null}
        {bonus ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, marginTop: 0.25, color: 'success.light' }}>
            <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {bonus}
            </Typography>
          </Box>
        ) : null}
      </Box>
      {status ? <Chip label={status.text} color={status.color} size="small" variant="outlined" /> : null}
    </Box>
  );
}

function UsageMeter({ info }: { info: MembershipInfo }) {
  const view = usageView(info);
  return (
    <Section title="Usage this month">
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2">{view.usageText}</Typography>
        {view.resetText ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {view.resetText}
          </Typography>
        ) : null}
      </Box>
      <LinearProgress
        variant="determinate"
        value={view.percent}
        color={view.percent >= 100 ? 'error' : view.percent >= 80 ? 'warning' : 'primary'}
        sx={{ marginTop: 0.5, height: 8, borderRadius: 4 }}
      />
      {view.extraText ? (
        <Typography variant="body2" sx={{ marginTop: 0.5 }}>
          {view.extraText}
        </Typography>
      ) : null}
      <UsageAlert info={info} />
    </Section>
  );
}

// Only a model with a slow cost on the rate card has a lane to choose; any other runs fast either way
function LaneSwitch({ info }: { info: MembershipInfo }) {
  const { updateSettings, busy } = useBillingActions();
  const slowLane = useSlowLane();
  if (!slowLane) {
    return null;
  }
  return (
    <Section
      title="Chat lane"
      hint="Fast answers right away. Slow may take longer and uses less of your monthly usage."
    >
      <ToggleButtonGroup
        exclusive
        size="small"
        value={info.lane}
        disabled={busy}
        onChange={(_event, lane: Lane | null) => {
          if (lane && lane !== info.lane) {
            void updateSettings({ extraEnabled: info.extraEnabled, extraLimitUsd: info.extraLimitUsd, lane });
          }
        }}
      >
        <ToggleButton value="fast">Fast</ToggleButton>
        <ToggleButton value="slow">Slow</ToggleButton>
      </ToggleButtonGroup>
    </Section>
  );
}

// Extra usage past the included usage, billed at member prices up to the member's own limit
function ExtraUsageSettings({ info }: { info: MembershipInfo }) {
  const { updateSettings, busy, error } = useBillingActions();
  const [limit, setLimit] = useState(String(info.extraLimitUsd));
  const parsed = clampExtraLimit(Number(limit));
  const dirty = parsed !== info.extraLimitUsd;

  const saveLimit = () => {
    setLimit(String(parsed));
    if (dirty) {
      void updateSettings({ extraEnabled: info.extraEnabled, extraLimitUsd: parsed, lane: info.lane });
    }
  };

  return (
    <Section
      title="Extra usage"
      hint={`Keep playing past the ${formatUsd(info.includedUsd)} of included usage at the prices on the Pricing page, up to a monthly limit you set. Added to your next invoice.`}
    >
      <FormControlLabel
        control={
          <Switch
            checked={info.extraEnabled}
            disabled={busy}
            onChange={(_event, extraEnabled) => {
              void updateSettings({ extraEnabled, extraLimitUsd: info.extraLimitUsd, lane: info.lane });
            }}
          />
        }
        label={info.extraEnabled ? 'Extra usage on' : 'Extra usage off'}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 1 }}>
        <TextField
          size="small"
          label="Monthly limit"
          type="number"
          value={limit}
          disabled={busy || !info.extraEnabled}
          onChange={(event) => {
            setLimit(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              saveLimit();
            }
          }}
          slotProps={{ htmlInput: { min: 0, max: EXTRA_LIMIT_MAX_USD, step: 1 } }}
          sx={{ maxWidth: 200 }}
        />
        <Button variant="outlined" size="medium" disabled={busy || !info.extraEnabled || !dirty} onClick={saveLimit}>
          Save
        </Button>
      </Box>
      <FormHelperText sx={{ margin: 0 }}>Up to {formatUsd(EXTRA_LIMIT_MAX_USD)} a month.</FormHelperText>
      {error ? <FormHelperText error>{error}</FormHelperText> : null}
    </Section>
  );
}

function RefreshRow() {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <FormHelperText sx={{ margin: 0, flex: 1 }}>Just pledged or changed tiers? Refresh to pick it up.</FormHelperText>
      <RefreshPlanButton />
    </Box>
  );
}

function PatreonOffer({ membership }: { membership: Membership }) {
  return (
    <Section
      title="Or pledge on Patreon"
      hint={patreonPlans
        .map((plan) => `${tierName(plan.tier)} ${formatUsd(plan.priceUsd)} includes ${formatUsd(plan.includedUsd)}`)
        .join(', ')
        .concat(' of AI usage a month. Pledge on patreon.com, then link your account here.')}
    >
      <PatreonLinkSection membership={membership} />
    </Section>
  );
}

function JoinIntro({ membership, title, text }: { membership: Membership; title: string; text: string }) {
  return (
    <Box>
      <Typography variant="h5">{title}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 0.5, maxWidth: 640 }}>
        {text}
      </Typography>
      {membership.isWorkerOnly() ? (
        <FormHelperText sx={{ marginTop: 1, marginBottom: 0 }}>{FOUNDER_ACCESS_TEXT}</FormHelperText>
      ) : null}
    </Box>
  );
}

function PatreonJoinView({ membership }: { membership: Membership }) {
  return (
    <Stack spacing={3}>
      <JoinIntro
        membership={membership}
        title="Choose your Sentient Sims AI tier"
        text="Every Patreon tier includes AI usage each month, worth what you pay. Tier 3 and Tier 4 add ElevenLabs voices. When your usage runs out, move up a tier or wait for the 1st."
      />
      <PlanPicker pricingLink={false} />
      <UsageGuide />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Without a plan, the app and the mod work like normal on your own API keys.
      </Typography>
      <Divider />
      <RefreshRow />
    </Stack>
  );
}

function NonMemberView({ membership }: { membership: Membership }) {
  if (!STRIPE_ENABLED) {
    return <PatreonJoinView membership={membership} />;
  }
  return (
    <Stack spacing={3}>
      <JoinIntro
        membership={membership}
        title="Join Sentient Sims AI"
        text="Pick a plan. Each one includes AI usage every month; when it runs out you can wait for the next month or turn on extra usage."
      />
      <PlanPicker pricingLink={false} />
      <PatreonOffer membership={membership} />
      <UsageGuide />
      <Divider />
      <RefreshRow />
    </Stack>
  );
}

export function MembershipPanel() {
  const { userAttributes } = useAuth();
  const { membership, info, me } = useMembership();

  if (!userAttributes) {
    return <FormHelperText>Sign in to see your plan.</FormHelperText>;
  }
  if (me.isLoading && !info) {
    return <FormHelperText>Loading plan…</FormHelperText>;
  }
  if (!membership.isMember()) {
    return <NonMemberView membership={membership} />;
  }

  const showUsage = info && !membership.isDev();
  return (
    <Stack spacing={3}>
      <PlanHeader membership={membership} info={info} />
      {showUsage ? <UsageMeter info={info} /> : null}
      {showUsage ? <LaneSwitch info={info} /> : null}
      {info && membership.isStripeMember() ? <ExtraUsageSettings key={info.extraLimitUsd} info={info} /> : null}
      {membership.isStripeMember() ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <ManageBillingButton />
          <FormHelperText sx={{ margin: 0 }}>Change plan, update your card, or cancel.</FormHelperText>
        </Box>
      ) : null}
      {membership.isPatreonMember() ? (
        <Section
          title="All tiers"
          hint="Move to another tier on Patreon any time. Upgrading raises your limit to the new tier's full amount right away."
        >
          <Box sx={{ marginTop: 1 }}>
            <PlanPicker pricingLink={false} />
          </Box>
        </Section>
      ) : null}
      {membership.isPatreonMember() && !membership.isPatreonLinked() ? (
        <Section
          title="Patreon"
          hint="Your plan follows your Patreon pledge. Keep the account linked so it stays current."
        >
          <Box sx={{ display: 'flex' }}>
            <PatreonLinkSection membership={membership} />
          </Box>
        </Section>
      ) : null}
      <UsageGuide />
      <Divider />
      <RefreshRow />
    </Stack>
  );
}
