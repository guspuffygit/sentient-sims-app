import { Lane, UsageState } from '../models/UserInfo';

export const USAGE_HEADER = 'x-sentient-usage';
export const LANE_HEADER = 'sentient-sims-lane';

// The server stamps this on every metered answer, so the app learns the usage
// as a side effect of normal play instead of polling /me
export type UsageHeader = {
  percent: number;
  state: UsageState;
  extraUsd: number;
  limitUsd: number;
  lane?: Lane;
  periodEnd?: string;
};

const states: UsageState[] = ['normal', 'near', 'extra', 'stopped'];

function fields(value: string): Map<string, string> {
  const map = new Map<string, string>();
  value.split(';').forEach((part) => {
    const index = part.indexOf('=');
    if (index > 0) {
      map.set(part.slice(0, index).trim().toLowerCase(), part.slice(index + 1).trim());
    }
  });
  return map;
}

function number(value: string | undefined): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseUsageHeader(value: unknown): UsageHeader | undefined {
  const text: unknown = Array.isArray(value) ? (value as unknown[])[0] : value;
  if (typeof text !== 'string' || text.trim() === '') {
    return undefined;
  }
  const map = fields(text);
  const percent = number(map.get('percent'));
  const state = map.get('state');
  if (percent === undefined || !states.includes(state as UsageState)) {
    return undefined;
  }
  const periodEnd = map.get('period_end');
  const lane = map.get('lane');
  return {
    percent,
    state: state as UsageState,
    extraUsd: number(map.get('extra')) ?? 0,
    limitUsd: number(map.get('limit')) ?? 0,
    ...(lane === 'fast' || lane === 'slow' ? { lane } : {}),
    ...(periodEnd ? { periodEnd } : {}),
  };
}

// Reads the header out of an axios or fetch headers object, or a raw value
export function usageHeaderFrom(headers: unknown): UsageHeader | undefined {
  if (!headers) {
    return undefined;
  }
  if (typeof headers === 'string') {
    return parseUsageHeader(headers);
  }
  if (typeof (headers as { get?: unknown }).get === 'function') {
    return parseUsageHeader((headers as { get: (name: string) => unknown }).get(USAGE_HEADER));
  }
  return parseUsageHeader((headers as Record<string, unknown>)[USAGE_HEADER]);
}
