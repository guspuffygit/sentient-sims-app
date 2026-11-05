import { MembershipInfo } from 'main/sentient-sims/models/UserInfo';
import { formatUsd, tierName } from './membershipView';

export const PLAN_REFRESH_COOLDOWN_MS = 15_000;

export function cooldownLeftMs(lastRefreshAt: number | undefined, now: number): number {
  if (lastRefreshAt === undefined) {
    return 0;
  }
  return Math.max(0, lastRefreshAt + PLAN_REFRESH_COOLDOWN_MS - now);
}

// The tier a player pays for; a lapsed plan or a developer account has none
export function planTier(info?: MembershipInfo): string | undefined {
  return info?.member && !info.dev && info.tier ? info.tier : undefined;
}

// Said once when a /me answer moves the player onto a paid tier they were not on
// before. The first answer after sign-in has nothing to compare against.
export function tierChangeMessage(before?: MembershipInfo, after?: MembershipInfo): string | undefined {
  const tier = planTier(after);
  if (!before || !after || !tier || tier === planTier(before)) {
    return undefined;
  }
  return `You're on the ${tierName(tier)} plan now, with ${formatUsd(after.includedUsd)} of AI usage included each month.`;
}
