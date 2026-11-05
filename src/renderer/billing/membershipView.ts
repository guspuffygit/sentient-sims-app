import { STRIPE_ENABLED } from 'main/sentient-sims/billing/billingFlags';
import { AIActionOverrides } from 'main/sentient-sims/models/AIActionType';
import { AIProviderConfig } from 'main/sentient-sims/models/AIProviderConfig';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { ChatCost, MembershipInfo, Plan, RateCard } from 'main/sentient-sims/models/UserInfo';
import { ELEVENLABS_TIERS, Membership } from 'main/sentient-sims/wrappers/Membership';

export { STRIPE_ENABLED };

export const EXTRA_LIMIT_MAX_USD = 200;

export const FOUNDER_ACCESS_TEXT =
  'As a founder you can use the chat, speech to text and Kokoro voice models that run on Sentient Sims servers. Models from outside providers, Orpheus voices, image generation and memory search need a plan.';

export const SUBSCRIPTION_REQUIRED_LABEL = 'Needs a subscription';

// Shown until GET /billing/plans answers, and when it cannot
export const defaultPlans: Plan[] = [
  { tier: 'tier1', priceUsd: 10, includedUsd: 10 },
  { tier: 'tier2', priceUsd: 20, includedUsd: 20 },
];

// The Patreon tiers, for the "or pledge on Patreon" note. The server includes the whole
// fee as usage at member prices (billing.IncludedRatio in the AI server).
export const patreonPlans: Plan[] = [
  { tier: 'tier1', priceUsd: 5, includedUsd: 5 },
  { tier: 'tier2', priceUsd: 10, includedUsd: 10 },
  { tier: 'tier3', priceUsd: 20, includedUsd: 20 },
  { tier: 'tier4', priceUsd: 50, includedUsd: 50 },
];

// The Patreon tier above this one, or nothing at the top tier
export function nextPatreonPlan(tier?: string): Plan | undefined {
  const index = patreonPlans.findIndex((plan) => plan.tier === tier);
  return index === -1 ? undefined : patreonPlans[index + 1];
}

// A Stripe member changes plan in the Stripe portal; everyone else moves up on Patreon
function upgradeFor(info: MembershipInfo): Plan | undefined {
  if (info.source !== 'patreon' && info.source !== 'cognito') {
    return undefined;
  }
  return nextPatreonPlan(info.tier);
}

export type BannerSeverity = 'info' | 'warning' | 'error';

export type UsageBannerView = {
  severity: BannerSeverity;
  text: string;
  // A fast lane member near the cap can stretch the included usage by switching lanes
  offerSlow: boolean;
  upgrade?: Plan;
};

export type UsageView = {
  percent: number;
  usageText: string;
  resetText?: string;
  extraText?: string;
  banner?: UsageBannerView;
};

export type StatusView = {
  text: string;
  color: 'success' | 'warning' | 'error' | 'default';
};

export function formatUsd(usd: number): string {
  if (Number.isInteger(usd)) {
    return `$${usd}`;
  }
  return `$${usd.toFixed(2)}`;
}

export function formatDate(iso?: string): string | undefined {
  if (!iso) {
    return undefined;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

// Usage periods and the bonus end at midnight UTC, so a local date would read a day early in the Americas
export function formatLongDate(iso?: string): string | undefined {
  if (!iso) {
    return undefined;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function clampExtraLimit(usd: number): number {
  if (!Number.isFinite(usd) || usd < 0) {
    return 0;
  }
  return Math.min(Math.round(usd), EXTRA_LIMIT_MAX_USD);
}

export function tierName(tier?: string): string {
  switch (tier) {
    case 'tier1':
      return 'Tier 1';
    case 'tier2':
      return 'Tier 2';
    case 'tier3':
      return 'Tier 3';
    case 'tier4':
      return 'Tier 4';
    case 'dev':
      return 'Developer';
    default:
      return tier ?? '';
  }
}

export const ELEVENLABS_PLAN_PERK = 'ElevenLabs v4 Turbo voices included';

export const planPerks = ['Uncensored Sentient Sims AI', 'WickedWhims supported', 'Voices included'];

// Tier 3 and Tier 4 add ElevenLabs voices on top of the Kokoro and Orpheus ones
export function planPerksFor(tier: string): string[] {
  return ELEVENLABS_TIERS.includes(tier) ? [...planPerks, ELEVENLABS_PLAN_PERK] : planPerks;
}

// Patrons on the books before the cutoff, and anyone who joins before it, get double usage until it ends
export const LAUNCH_BONUS = {
  multiplier: 2,
  joinBy: '2026-11-06T22:00:00Z',
  until: '2027-01-01T00:00:00Z',
};

export const LAUNCH_OFFER_DEADLINE = 'Friday, November 6 at 5pm ET';

export function launchOfferOpen(now: number = Date.now()): boolean {
  return now < Date.parse(LAUNCH_BONUS.joinBy);
}

// "Ends in 3 days", "Ends in 5 hours", or nothing once the offer has closed
export function offerEndsText(now: number = Date.now()): string | undefined {
  const left = Date.parse(LAUNCH_BONUS.joinBy) - now;
  if (left <= 0) {
    return undefined;
  }
  const hours = Math.ceil(left / (60 * 60 * 1000));
  if (hours <= 1) {
    return 'Ends within the hour';
  }
  if (hours < 48) {
    return `Ends in ${hours} hours`;
  }
  return `Ends in ${Math.floor(hours / 24)} days`;
}

export type TierAction = 'join' | 'current' | 'upgrade' | 'switch';

export type TierCardView = {
  plan: Plan;
  action: TierAction;
  badge?: string;
  perks: string[];
  // The monthly usage while a bonus applies, and when the bonus ends
  bonusUsd?: number;
  bonusUntil?: string;
};

type Bonus = { multiplier: number; until: string };

function bonusFor(info: MembershipInfo | undefined, now: number): Bonus | undefined {
  if (info?.member) {
    const until = info.bonusUntil ? Date.parse(info.bonusUntil) : Number.NaN;
    if (!info.bonusMultiplier || info.bonusMultiplier <= 1 || !(until > now)) {
      return undefined;
    }
    return { multiplier: info.bonusMultiplier, until: info.bonusUntil as string };
  }
  return launchOfferOpen(now) ? { multiplier: LAUNCH_BONUS.multiplier, until: LAUNCH_BONUS.until } : undefined;
}

export const RECOMMENDED_TIER = 'tier3';

function badgeFor(tier: string): string | undefined {
  if (tier === RECOMMENDED_TIER) {
    return 'Recommended';
  }
  return ELEVENLABS_TIERS.includes(tier) ? 'New' : undefined;
}

// One card per plan. A Patreon member sees their own tier marked and the others as moves on Patreon.
export function tierCardsView(plans: Plan[], info?: MembershipInfo, now: number = Date.now()): TierCardView[] {
  const bonus = bonusFor(info, now);
  const patron = info?.member && (info.source === 'patreon' || info.source === 'cognito');
  const currentIndex = patron ? plans.findIndex((plan) => plan.tier === info.tier) : -1;
  return plans.map((plan, index) => {
    let action: TierAction = 'join';
    if (currentIndex !== -1) {
      if (index === currentIndex) {
        action = 'current';
      } else {
        action = index > currentIndex ? 'upgrade' : 'switch';
      }
    }
    return {
      plan,
      action,
      badge: badgeFor(plan.tier),
      perks: planPerksFor(plan.tier),
      bonusUsd: bonus ? plan.includedUsd * bonus.multiplier : undefined,
      bonusUntil: bonus?.until,
    };
  });
}

export function planSummary(plan: Plan): string {
  return `${formatUsd(plan.priceUsd)} a month, ${formatUsd(plan.includedUsd)} of AI usage included`;
}

export function sourceName(source: string): string {
  switch (source) {
    case 'stripe':
      return 'Sentient Sims AI';
    case 'patreon':
      return 'Patreon';
    default:
      return '';
  }
}

export function planLabel(membership: Membership): string {
  const info = membership.getInfo();
  switch (membership.getSource()) {
    case 'stripe':
    case 'patreon': {
      const price = info?.priceUsd ? `, ${formatUsd(info.priceUsd)} a month` : '';
      return `${sourceName(membership.getSource())} ${tierName(membership.getTier())}${price}`;
    }
    case 'dev':
      return 'Developer';
    case 'api_key':
      return 'API key';
    case 'founder':
      return 'Founder';
    case 'cognito':
      return membership.isMember() ? `${tierName(membership.getTier())} member` : 'None';
    default:
      return 'None';
  }
}

export function bonusText(info?: MembershipInfo): string | undefined {
  if (!info?.bonusMultiplier || info.bonusMultiplier <= 1 || !info.bonusUntil) {
    return undefined;
  }
  const until = new Date(info.bonusUntil);
  if (Number.isNaN(until.getTime()) || until.getTime() <= Date.now()) {
    return undefined;
  }
  return `${formatMultiplier(info.bonusMultiplier)} usage until ${formatLongDate(info.bonusUntil)}`;
}

export function statusView(info?: MembershipInfo): StatusView | undefined {
  if (!info || !info.member) {
    return undefined;
  }
  const periodEnd = formatDate(info.periodEnd);
  if (info.cancelAtPeriodEnd) {
    return { text: periodEnd ? `Cancels ${periodEnd}` : 'Cancels at the end of the period', color: 'warning' };
  }
  if (info.status === 'past_due') {
    return { text: 'Payment past due', color: 'error' };
  }
  if (info.status && info.status !== 'active') {
    return { text: info.status, color: 'default' };
  }
  if (info.source === 'patreon') {
    return { text: 'Active', color: 'success' };
  }
  return { text: periodEnd ? `Renews ${periodEnd}` : 'Active', color: 'success' };
}

export function statusLabel(info?: MembershipInfo): string | undefined {
  return statusView(info)?.text;
}

function stoppedText(info: MembershipInfo, until: string, upgrade?: Plan): string {
  if (info.extraEnabled && info.usage.extraUsd >= info.extraLimitUsd) {
    return `Extra usage limit reached. Raise the limit below or wait until ${until}.`;
  }
  if (info.source === 'stripe') {
    return `Monthly usage used up. Turn on extra usage below or wait until ${until}.`;
  }
  if (upgrade) {
    return `Monthly usage used up. Upgrade your Patreon tier to keep playing now, or AI requests resume ${until}.`;
  }
  return `Monthly usage used up. AI requests resume ${until}.`;
}

export function upgradeText(plan: Plan): string {
  const voices = ELEVENLABS_TIERS.includes(plan.tier) ? ' and ElevenLabs voices' : '';
  return `${tierName(plan.tier)} includes ${formatUsd(plan.includedUsd)} of AI usage a month${voices} for ${formatUsd(plan.priceUsd)}.`;
}

// slowLane: whether a model in use has a cheaper slow route; a model with one cost has no lane to switch to
export function usageView(info: MembershipInfo, slowLane: boolean = true): UsageView {
  const percent = Math.max(0, Math.min(100, Math.round(info.usage.percent)));
  const reset = formatDate(info.periodEnd);
  const until = reset ?? 'the next period';
  const view: UsageView = {
    percent,
    usageText: `${percent}% of ${formatUsd(info.includedUsd)} used`,
    resetText: reset ? `Resets ${reset}` : undefined,
  };
  if (info.extraEnabled || info.usage.extraUsd > 0) {
    view.extraText = `${formatUsd(info.usage.extraUsd)} of extra usage this period`;
  }
  const upgrade = upgradeFor(info);
  switch (info.usage.state) {
    case 'near':
      view.banner = {
        severity: 'warning',
        text: `${percent}% of your monthly usage is used.`,
        offerSlow: slowLane && info.lane === 'fast',
        upgrade,
      };
      break;
    case 'extra':
      view.banner = {
        severity: 'info',
        text: `Monthly usage used up. Extra usage is on, ${formatUsd(info.usage.extraUsd)} so far of the ${formatUsd(info.extraLimitUsd)} limit.`,
        offerSlow: false,
      };
      break;
    case 'stopped':
      view.banner = { severity: 'error', text: stoppedText(info, until, upgrade), offerSlow: false, upgrade };
      break;
    default:
      break;
  }
  return view;
}

// 1 -> "1x", 1.5 -> "1.5x", 0.25 -> "0.25x"
export function formatMultiplier(cost: number): string {
  return `${Number(cost.toFixed(2))}x`;
}

export function chatCostLabel(cost: ChatCost): string {
  if (cost.slow === undefined) {
    return formatMultiplier(cost.fast);
  }
  return `${formatMultiplier(cost.fast)} fast, ${formatMultiplier(cost.slow)} slow`;
}

export function hasSlowLane(card: RateCard | undefined, model: string | undefined): boolean {
  return model !== undefined && card?.chat[model]?.slow !== undefined;
}

// The Sentient Sims AI models the text configs in use point at: the default and every action override
export function sentientSimsModelsInUse(
  configs: AIProviderConfig[],
  defaultId: string,
  overrides: AIActionOverrides,
  legacyModel: string,
): string[] {
  const ids = new Set([defaultId, ...Object.values(overrides)]);
  const models = configs
    .filter((config) => ids.has(config.id) && config.apiType === ApiType.SentientSimsAI)
    .map((config) => config.model ?? legacyModel);
  return [...new Set(models)];
}

// Base model first, then by fast cost, then by name
export function sortedChatCosts(card: RateCard): [string, ChatCost][] {
  return Object.entries(card.chat).sort(([aName, a], [bName, b]) => {
    if (aName === card.base_chat) return -1;
    if (bName === card.base_chat) return 1;
    return a.fast - b.fast || aName.localeCompare(bName);
  });
}
