import { describe, expect, it } from 'vitest';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { AIActionType } from 'main/sentient-sims/models/AIActionType';
import { MembershipInfo, RateCard } from 'main/sentient-sims/models/UserInfo';
import { Membership } from 'main/sentient-sims/wrappers/Membership';
import {
  bonusText,
  chatCostLabel,
  clampExtraLimit,
  formatDate,
  formatLongDate,
  formatMultiplier,
  formatUsd,
  hasSlowLane,
  LAUNCH_BONUS,
  launchOfferOpen,
  nextPatreonPlan,
  offerEndsText,
  patreonPlans,
  planLabel,
  planPerks,
  planPerksFor,
  planSummary,
  sentientSimsModelsInUse,
  sortedChatCosts,
  statusLabel,
  statusView,
  tierCardsView,
  tierName,
  upgradeText,
  usageView,
} from 'renderer/billing/membershipView';

function stripe(overrides: Partial<MembershipInfo> = {}): MembershipInfo {
  return {
    member: true,
    source: 'stripe',
    tier: 'tier2',
    status: 'active',
    founder: false,
    dev: false,
    priceUsd: 20,
    includedUsd: 12,
    extraEnabled: false,
    extraLimitUsd: 0,
    lane: 'fast',
    periodEnd: '2026-11-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    usage: { percent: 12, state: 'normal', extraUsd: 0 },
    ...overrides,
  };
}

function patreon(overrides: Partial<MembershipInfo> = {}): MembershipInfo {
  return stripe({ source: 'patreon', tier: 'tier1', priceUsd: 5, includedUsd: 5, ...overrides });
}

describe('usageView', () => {
  it('shows the usage as a percent with no banner while usage is normal', () => {
    const view = usageView(stripe());
    expect(view.percent).toBe(12);
    expect(view.usageText).toBe('12% of $12 used');
    expect(view.resetText).toMatch(/^Resets /);
    expect(view.extraText).toBeUndefined();
    expect(view.banner).toBeUndefined();
  });

  it('warns near the cap and offers the slow lane only to fast lane members', () => {
    const fast = usageView(stripe({ usage: { percent: 85, state: 'near', extraUsd: 0 } }));
    expect(fast.banner).toMatchObject({ severity: 'warning', offerSlow: true });
    expect(fast.banner?.text).toContain('85%');

    const slow = usageView(stripe({ lane: 'slow', usage: { percent: 85, state: 'near', extraUsd: 0 } }));
    expect(slow.banner?.offerSlow).toBe(false);
  });

  it('offers no slow lane when the model in use has one cost', () => {
    const view = usageView(stripe({ usage: { percent: 85, state: 'near', extraUsd: 0 } }), false);
    expect(view.banner).toMatchObject({ severity: 'warning', offerSlow: false });
  });

  it('reports extra usage in dollars once the included usage is spent', () => {
    const view = usageView(
      stripe({ extraEnabled: true, extraLimitUsd: 20, usage: { percent: 100, state: 'extra', extraUsd: 1.5 } }),
    );
    expect(view.extraText).toBe('$1.50 of extra usage this period');
    expect(view.banner).toMatchObject({ severity: 'info', offerSlow: false });
    expect(view.banner?.text).toContain('$1.50 so far of the $20 limit');
  });

  it('tells a stopped member what unblocks them', () => {
    const usedUp = usageView(stripe({ usage: { percent: 100, state: 'stopped', extraUsd: 0 } }));
    expect(usedUp.banner?.severity).toBe('error');
    expect(usedUp.banner?.text).toContain('Turn on extra usage');

    const limit = usageView(
      stripe({ extraEnabled: true, extraLimitUsd: 5, usage: { percent: 100, state: 'stopped', extraUsd: 5 } }),
    );
    expect(limit.banner?.text).toContain('Extra usage limit reached');

    const patron = usageView(patreon({ usage: { percent: 100, state: 'stopped', extraUsd: 0 } }));
    expect(patron.banner?.text).toContain('AI requests resume');
    expect(patron.banner?.text).not.toContain('extra usage');
  });

  it('offers a patron the next Patreon tier when usage runs low or out', () => {
    const stopped = usageView(patreon({ usage: { percent: 100, state: 'stopped', extraUsd: 0 } }));
    expect(stopped.banner?.upgrade?.tier).toBe('tier2');
    expect(stopped.banner?.text).toContain('Upgrade your Patreon tier');

    const near = usageView(patreon({ tier: 'tier3', usage: { percent: 85, state: 'near', extraUsd: 0 } }));
    expect(near.banner?.upgrade).toMatchObject({ tier: 'tier4', priceUsd: 50, includedUsd: 50 });

    const top = usageView(patreon({ tier: 'tier4', usage: { percent: 100, state: 'stopped', extraUsd: 0 } }));
    expect(top.banner?.upgrade).toBeUndefined();
    expect(top.banner?.text).toBe(
      `Monthly usage used up. AI requests resume ${top.resetText?.replace('Resets ', '')}.`,
    );

    const claimsOnly = usageView(
      patreon({ source: 'cognito', usage: { percent: 100, state: 'stopped', extraUsd: 0 } }),
    );
    expect(claimsOnly.banner?.upgrade?.tier).toBe('tier2');

    const stripeMember = usageView(stripe({ tier: 'tier1', usage: { percent: 100, state: 'stopped', extraUsd: 0 } }));
    expect(stripeMember.banner?.upgrade).toBeUndefined();
  });

  it('steps through the Patreon tiers in order', () => {
    expect(nextPatreonPlan('tier1')?.tier).toBe('tier2');
    expect(nextPatreonPlan('tier2')?.tier).toBe('tier3');
    expect(nextPatreonPlan('tier3')?.tier).toBe('tier4');
    expect(nextPatreonPlan('tier4')).toBeUndefined();
    expect(nextPatreonPlan('dev')).toBeUndefined();
    expect(nextPatreonPlan(undefined)).toBeUndefined();
  });

  it('clamps the percent into the meter range', () => {
    expect(usageView(stripe({ usage: { percent: 140, state: 'extra', extraUsd: 2 } })).percent).toBe(100);
    expect(usageView(stripe({ usage: { percent: -3, state: 'normal', extraUsd: 0 } })).percent).toBe(0);
  });
});

describe('plan and status labels', () => {
  it('names the Stripe plan with its tier and price', () => {
    expect(planLabel(new Membership(undefined, stripe()))).toBe('Sentient Sims AI Tier 2, $20 a month');
    expect(planLabel(new Membership(undefined, stripe({ tier: 'tier1', priceUsd: 10, includedUsd: 5 })))).toBe(
      'Sentient Sims AI Tier 1, $10 a month',
    );
    expect(statusLabel(stripe())).toMatch(/^Renews /);
    expect(statusView(stripe())?.color).toBe('success');
    expect(statusLabel(stripe({ cancelAtPeriodEnd: true }))).toMatch(/^Cancels /);
    expect(statusView(stripe({ cancelAtPeriodEnd: true }))?.color).toBe('warning');
    expect(statusLabel(stripe({ status: 'past_due' }))).toBe('Payment past due');
    expect(statusView(stripe({ status: 'past_due' }))?.color).toBe('error');
  });

  it('names a Patreon row by tier and pledge', () => {
    expect(planLabel(new Membership(undefined, patreon()))).toBe('Patreon Tier 1, $5 a month');
    expect(planLabel(new Membership(undefined, patreon({ tier: 'tier2', priceUsd: 10, includedUsd: 6 })))).toBe(
      'Patreon Tier 2, $10 a month',
    );
    expect(statusLabel(patreon())).toBe('Active');
    expect(planLabel(new Membership(undefined, patreon({ tier: 'tier3', priceUsd: 20, includedUsd: 20 })))).toBe(
      'Patreon Tier 3, $20 a month',
    );
    expect(planLabel(new Membership(undefined, patreon({ tier: 'tier4', priceUsd: 50, includedUsd: 50 })))).toBe(
      'Patreon Tier 4, $50 a month',
    );
  });

  it('offers all four Patreon tiers, each including its whole fee as usage', () => {
    expect(patreonPlans.map((plan) => [plan.tier, plan.priceUsd, plan.includedUsd])).toEqual([
      ['tier1', 5, 5],
      ['tier2', 10, 10],
      ['tier3', 20, 20],
      ['tier4', 50, 50],
    ]);
  });

  it('describes a plan and its perks', () => {
    expect(planSummary({ tier: 'tier2', priceUsd: 20, includedUsd: 12 })).toBe('$20 a month, $12 of AI usage included');
    expect(tierName('tier1')).toBe('Tier 1');
    expect(planPerks).toEqual(['Uncensored Sentient Sims AI', 'WickedWhims supported', 'Voices included']);
    expect(planPerksFor('tier2')).toEqual(planPerks);
    expect(planPerksFor('tier3')).toEqual([...planPerks, 'ElevenLabs v4 Turbo voices included']);
    expect(planPerksFor('tier4')).toEqual([...planPerks, 'ElevenLabs v4 Turbo voices included']);
  });

  it('names ElevenLabs voices when the upgrade is Tier 3 or 4', () => {
    expect(upgradeText({ tier: 'tier2', priceUsd: 10, includedUsd: 10 })).toBe(
      'Tier 2 includes $10 of AI usage a month for $10.',
    );
    expect(upgradeText({ tier: 'tier3', priceUsd: 20, includedUsd: 20 })).toBe(
      'Tier 3 includes $20 of AI usage a month and ElevenLabs voices for $20.',
    );
  });

  it('labels devs, founders and non-members', () => {
    expect(planLabel(new Membership(undefined, stripe({ source: 'dev', dev: true })))).toBe('Developer');
    expect(planLabel(new Membership(undefined, stripe({ member: false, source: 'founder', founder: true })))).toBe(
      'Founder',
    );
    expect(planLabel(new Membership(undefined, stripe({ member: false, source: 'none' })))).toBe('None');
    expect(statusLabel(stripe({ member: false, source: 'none' }))).toBeUndefined();
  });
});

const haiku = 'anthropic/claude-haiku-5.5';
const llama = 'meta-llama/Llama-3.3-70B-Instruct';

const card: RateCard = {
  as_of: '2026-11-03',
  base_chat: haiku,
  chat: {
    [llama]: { fast: 5, slow: 1 },
    [haiku]: { fast: 1 },
    'deepseek-ai/DeepSeek-V4-Flash': { fast: 0.5 },
  },
  embeddings: { 'openai/text-embedding-3-small': 0.25 },
  voices: { kokoro: 1, eleven_v4_turbo: 50 },
};

describe('launch bonus', () => {
  it('says the usage is doubled until the bonus ends', () => {
    const until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(bonusText(patreon({ includedUsd: 10, bonusMultiplier: 2, bonusUntil: until }))).toBe(
      `2x usage until ${new Date(until).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`,
    );
  });

  it('says nothing without a bonus, after it ends, or at 1x', () => {
    expect(bonusText(patreon())).toBeUndefined();
    expect(bonusText(patreon({ bonusMultiplier: 2, bonusUntil: '2020-01-01T00:00:00Z' }))).toBeUndefined();
    expect(bonusText(patreon({ bonusMultiplier: 1, bonusUntil: '2099-01-01T00:00:00Z' }))).toBeUndefined();
    expect(bonusText(patreon({ bonusMultiplier: 2, bonusUntil: 'soon' }))).toBeUndefined();
    expect(bonusText(undefined)).toBeUndefined();
  });
});

describe('tier cards', () => {
  const beforeCutoff = Date.parse('2026-11-05T12:00:00Z');
  const afterCutoff = Date.parse('2026-11-07T00:00:00Z');
  const none = stripe({ member: false, source: 'none', tier: undefined });

  it('offers a non-member every tier to join, doubled while the launch offer is open', () => {
    const views = tierCardsView(patreonPlans, none, beforeCutoff);
    expect(views.map((view) => view.action)).toEqual(['join', 'join', 'join', 'join']);
    expect(views.map((view) => view.bonusUsd)).toEqual([10, 20, 40, 100]);
    expect(views[0].bonusUntil).toBe(LAUNCH_BONUS.until);
    expect(tierCardsView(patreonPlans, none, afterCutoff).map((view) => view.bonusUsd)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it("marks a patron's own tier and offers the rest as moves on Patreon", () => {
    const views = tierCardsView(patreonPlans, patreon({ tier: 'tier2' }), beforeCutoff);
    expect(views.map((view) => view.action)).toEqual(['switch', 'current', 'upgrade', 'upgrade']);
  });

  it("doubles a patron's tiers only while their own bonus lasts", () => {
    const bonus = patreon({ tier: 'tier1', bonusMultiplier: 2, bonusUntil: LAUNCH_BONUS.until });
    expect(tierCardsView(patreonPlans, bonus, afterCutoff)[3].bonusUsd).toBe(100);
    expect(tierCardsView(patreonPlans, bonus, Date.parse('2027-01-02T00:00:00Z'))[3].bonusUsd).toBeUndefined();
    expect(tierCardsView(patreonPlans, patreon({ tier: 'tier1' }), beforeCutoff)[3].bonusUsd).toBeUndefined();
  });

  it('badges the recommended tier and the new ElevenLabs tier', () => {
    const views = tierCardsView(patreonPlans, none, afterCutoff);
    expect(views.map((view) => view.badge)).toEqual([undefined, undefined, 'Recommended', 'New']);
    expect(views[3].perks).toEqual(planPerksFor('tier4'));
  });

  it('closes the launch offer at 5pm ET on November 6', () => {
    expect(launchOfferOpen(Date.parse('2026-11-06T21:59:00Z'))).toBe(true);
    expect(launchOfferOpen(Date.parse('2026-11-06T22:00:00Z'))).toBe(false);
    expect(offerEndsText(Date.parse('2026-11-03T22:00:00Z'))).toBe('Ends in 3 days');
    expect(offerEndsText(Date.parse('2026-11-06T02:30:00Z'))).toBe('Ends in 20 hours');
    expect(offerEndsText(Date.parse('2026-11-06T21:30:00Z'))).toBe('Ends within the hour');
    expect(offerEndsText(Date.parse('2026-11-06T22:00:00Z'))).toBeUndefined();
  });

  it('stops doubling the tier cards for a non-member at the cutoff', () => {
    expect(tierCardsView(patreonPlans, none, Date.parse('2026-11-06T21:59:59Z'))[0].bonusUsd).toBe(10);
    expect(tierCardsView(patreonPlans, none, Date.parse('2026-11-06T22:00:00Z'))[0].bonusUsd).toBeUndefined();
  });

  it('reads period and bonus dates in UTC, so midnight on the 1st stays the 1st', () => {
    expect(formatDate('2026-12-01T00:00:00Z')).toBe(
      new Date(Date.UTC(2026, 11, 1, 12)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    );
    expect(formatLongDate('2027-01-01T00:00:00Z')).toBe(
      new Date(Date.UTC(2027, 0, 1, 12)).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    );
  });
});

describe('rate card', () => {
  it('prints costs as multiples of the baseline', () => {
    expect(formatMultiplier(1)).toBe('1x');
    expect(formatMultiplier(1.5)).toBe('1.5x');
    expect(formatMultiplier(0.25)).toBe('0.25x');
    expect(chatCostLabel({ fast: 1 })).toBe('1x');
    expect(chatCostLabel({ fast: 5, slow: 1 })).toBe('5x fast, 1x slow');
  });

  it('lists the baseline first, then the cheapest models', () => {
    expect(sortedChatCosts(card).map(([model]) => model)).toEqual([haiku, 'deepseek-ai/DeepSeek-V4-Flash', llama]);
  });

  it('knows which model has a slow lane', () => {
    expect(hasSlowLane(card, llama)).toBe(true);
    expect(hasSlowLane(card, haiku)).toBe(false);
    expect(hasSlowLane(card, 'vendor/unlisted')).toBe(false);
    expect(hasSlowLane(undefined, llama)).toBe(false);
    expect(hasSlowLane(card, undefined)).toBe(false);
  });

  it('collects the Sentient Sims AI models the default and overrides point at', () => {
    const configs = [
      { id: 'ss', name: 'Sentient Sims AI', apiType: ApiType.SentientSimsAI, model: haiku },
      { id: 'ss-legacy', name: 'Sentient Sims AI', apiType: ApiType.SentientSimsAI },
      { id: 'oai', name: 'OpenAI', apiType: ApiType.OpenAI, model: 'gpt-4o-mini' },
      { id: 'unused', name: 'Unused', apiType: ApiType.SentientSimsAI, model: 'deepseek-ai/DeepSeek-V4-Flash' },
    ];
    expect(sentientSimsModelsInUse(configs, 'ss', { [AIActionType.WICKED_WHIMS]: 'ss-legacy' }, llama)).toEqual([
      haiku,
      llama,
    ]);
    expect(sentientSimsModelsInUse(configs, 'oai', {}, llama)).toEqual([]);
    expect(sentientSimsModelsInUse(configs, 'ss', { [AIActionType.WICKED_WHIMS]: 'ss' }, llama)).toEqual([haiku]);
  });
});

describe('formatting', () => {
  it('prints whole dollars without cents and fractions with two', () => {
    expect(formatUsd(10)).toBe('$10');
    expect(formatUsd(1.5)).toBe('$1.50');
  });

  it('keeps the extra limit between zero and the server cap', () => {
    expect(clampExtraLimit(-5)).toBe(0);
    expect(clampExtraLimit(Number.NaN)).toBe(0);
    expect(clampExtraLimit(42.6)).toBe(43);
    expect(clampExtraLimit(1000)).toBe(200);
  });
});
