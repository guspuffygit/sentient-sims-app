import { describe, expect, it } from 'vitest';
import { MembershipInfo } from 'main/sentient-sims/models/UserInfo';
import { cooldownLeftMs, PLAN_REFRESH_COOLDOWN_MS, planTier, tierChangeMessage } from 'renderer/billing/planRefresh';

function patreon(overrides: Partial<MembershipInfo> = {}): MembershipInfo {
  return {
    member: true,
    source: 'patreon',
    tier: 'tier1',
    status: 'active',
    founder: false,
    dev: false,
    priceUsd: 5,
    includedUsd: 2.5,
    extraEnabled: false,
    extraLimitUsd: 0,
    lane: 'fast',
    cancelAtPeriodEnd: false,
    usage: { percent: 100, state: 'stopped', extraUsd: 0 },
    ...overrides,
  };
}

describe('cooldownLeftMs', () => {
  it('lets the first press through', () => {
    expect(cooldownLeftMs(undefined, 1000)).toBe(0);
  });

  it('counts down from 15 seconds after a press', () => {
    expect(PLAN_REFRESH_COOLDOWN_MS).toBe(15_000);
    expect(cooldownLeftMs(1000, 1000)).toBe(15_000);
    expect(cooldownLeftMs(1000, 11_000)).toBe(5000);
    expect(cooldownLeftMs(1000, 16_000)).toBe(0);
    expect(cooldownLeftMs(1000, 60_000)).toBe(0);
  });
});

describe('planTier', () => {
  it('names the tier of a paying member only', () => {
    expect(planTier(patreon())).toBe('tier1');
    expect(planTier(patreon({ member: false }))).toBeUndefined();
    expect(planTier(patreon({ dev: true, tier: 'dev' }))).toBeUndefined();
    expect(planTier(patreon({ tier: undefined }))).toBeUndefined();
    expect(planTier(undefined)).toBeUndefined();
  });
});

describe('tierChangeMessage', () => {
  it('announces an upgrade from tier 1 to tier 2 with the new included usage', () => {
    const after = patreon({
      tier: 'tier2',
      priceUsd: 10,
      includedUsd: 6,
      usage: { percent: 42, state: 'normal', extraUsd: 0 },
    });
    expect(tierChangeMessage(patreon(), after)).toBe(
      "You're on the Tier 2 plan now, with $6 of AI usage included each month.",
    );
  });

  it('announces a first plan after a pledge or checkout', () => {
    expect(tierChangeMessage(patreon({ member: false, source: 'none', tier: undefined }), patreon())).toContain(
      'Tier 1 plan',
    );
  });

  it('stays quiet on the first answer after sign-in', () => {
    expect(tierChangeMessage(undefined, patreon({ tier: 'tier2' }))).toBeUndefined();
  });

  it('stays quiet when only the usage moved', () => {
    const after = patreon({ usage: { percent: 12, state: 'normal', extraUsd: 0 } });
    expect(tierChangeMessage(patreon(), after)).toBeUndefined();
  });

  it('stays quiet when the plan lapses', () => {
    expect(tierChangeMessage(patreon(), patreon({ member: false, status: 'canceled' }))).toBeUndefined();
  });
});
