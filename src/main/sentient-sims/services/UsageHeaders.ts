import { ApiContext } from './ApiContext';

export const PURPOSE_HEADER = 'X-Sentient-Sims-Purpose';
export const SESSION_HEADER = 'X-Sentient-Sims-Session';

// The Sentient Sims AI server records these per request so usage can be split by what
// the request was for and grouped by play session. Only that server receives them.
export function usageHeaders(ctx: ApiContext, purpose: string): Record<string, string> {
  const sessionId = ctx.db.sessionId;
  return {
    [PURPOSE_HEADER]: purpose,
    ...(sessionId ? { [SESSION_HEADER]: sessionId } : {}),
  };
}
