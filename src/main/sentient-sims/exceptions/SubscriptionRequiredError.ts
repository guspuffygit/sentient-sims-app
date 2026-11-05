// Where the Settings page sells a plan; every subscribe hint points here
export const PLAN_TAB = 'the Plan tab in Settings';
export const SUBSCRIBE_HINT = `Subscribe from ${PLAN_TAB}.`;

// The server's 452 for a founder who asked for something hosted by an outside provider
export class SubscriptionRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionRequiredError';
  }
}

export function parseSubscriptionRequired(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  const { message, reason } = body as Record<string, unknown>;
  if (reason !== 'subscription_required') {
    return undefined;
  }
  return typeof message === 'string' && message !== '' ? message : 'This needs a Sentient Sims subscription.';
}
