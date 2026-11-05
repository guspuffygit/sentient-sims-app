import { STRIPE_ENABLED } from '../billing/billingFlags';

export type UsageLimitReason = 'usage' | 'limit';

export type UsageLimitRefusal = {
  error: string;
  reason: UsageLimitReason;
  resets_at?: string;
  state?: string;
};

// The server's 429 once the monthly usage (or the member's extra usage limit) is used up
export class UsageLimitError extends Error {
  readonly reason: UsageLimitReason;

  readonly resetsAt?: string;

  constructor(refusal: UsageLimitRefusal) {
    super(UsageLimitError.messageFor(refusal.reason));
    this.name = 'UsageLimitError';
    this.reason = refusal.reason;
    this.resetsAt = refusal.resets_at;
  }

  static messageFor(reason: UsageLimitReason): string {
    if (reason === 'limit') {
      return 'Extra usage limit reached. Raise the limit in the app or wait for the reset.';
    }
    if (STRIPE_ENABLED) {
      return 'Monthly usage used up. Open the app to turn on extra usage or switch to slow.';
    }
    return 'Monthly usage used up. Upgrade your Patreon tier or wait for the reset.';
  }
}

export function parseUsageLimitRefusal(body: unknown): UsageLimitRefusal | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  const { error, reason, resets_at: resetsAt, state } = body as Record<string, unknown>;
  if (typeof error !== 'string' || (reason !== 'usage' && reason !== 'limit')) {
    return undefined;
  }
  return {
    error,
    reason,
    ...(typeof resetsAt === 'string' ? { resets_at: resetsAt } : {}),
    ...(typeof state === 'string' ? { state } : {}),
  };
}
