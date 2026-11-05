import { UsageHeader } from 'main/sentient-sims/billing/usageHeader';
import { UserInfo } from 'main/sentient-sims/models/UserInfo';

// Prefix shared by every /me entry, so an invalidate or a sign-out reaches all of them
export const meQueryKey = ['me'];

// One entry per signed-in account and endpoint, so a sign-out or a switch never shows the last account's plan
export function meQueryKeyFor(endpoint: string, sub?: string) {
  return [...meQueryKey, endpoint, sub];
}

// The usage header carries what moves during play, so the cache takes it without another /me call
export function patchMeUsage(me: UserInfo | undefined, header: UsageHeader): UserInfo | undefined {
  if (!me?.membership) {
    return me;
  }
  const { membership } = me;
  return {
    ...me,
    membership: {
      ...membership,
      lane: header.lane ?? membership.lane,
      usage: { percent: header.percent, state: header.state, extraUsd: header.extraUsd },
    },
  };
}
