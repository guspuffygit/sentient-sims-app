import { AxiosError } from 'axios';
import log from 'electron-log';
import { latestUsage, setLatestUsage } from '../billing/usageStatus';
import { LANE_HEADER, UsageHeader, usageHeaderFrom } from '../billing/usageHeader';
import { UsageLimitError } from '../exceptions/UsageLimitError';
import { notifyUsage, sendAppStatusToMod } from '../util/notifyRenderer';
import { ApiContext } from './ApiContext';
import { DecodeToken } from '../auth/tokenVerifier';

function tokenSub(token: string): string | undefined {
  try {
    return DecodeToken(token).sub;
  } catch {
    return undefined;
  }
}

function sameHeader(a: UsageHeader | undefined, b: UsageHeader): boolean {
  return (
    !!a &&
    a.percent === b.percent &&
    a.state === b.state &&
    a.extraUsd === b.extraUsd &&
    a.limitUsd === b.limitUsd &&
    a.lane === b.lane &&
    a.periodEnd === b.periodEnd
  );
}

// Tracks the usage the Sentient Sims AI server reports on each metered answer
// and passes a change on to the renderer and the mod
export class UsageLimitService {
  private readonly ctx: ApiContext;

  private sub?: string;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
    this.sub = tokenSub(ctx.settings.accessToken);
  }

  // The meter belongs to one account: a sign-out or a different sub empties it
  onAccessTokenChanged(token: string) {
    const sub = token ? tokenSub(token) : undefined;
    if (sub === this.sub) {
      return;
    }
    this.sub = sub;
    this.clear();
  }

  current(): UsageHeader | undefined {
    return latestUsage();
  }

  // Axios headers, fetch Headers, or the raw header value
  record(headers: unknown): UsageHeader | undefined {
    const header = usageHeaderFrom(headers);
    if (!header) {
      return undefined;
    }
    this.apply(header);
    return header;
  }

  private apply(header: UsageHeader) {
    if (sameHeader(latestUsage(), header)) {
      return;
    }
    setLatestUsage(header);
    log.info(`Usage ${header.percent}% ${header.state} lane=${header.lane}`);
    notifyUsage(header);
    sendAppStatusToMod(this.ctx.settings);
  }

  // A refused request still carries the header, and the refusal itself means stopped
  recordError(err: unknown) {
    if (err instanceof AxiosError) {
      this.record(err.response?.headers);
    }
    if (err instanceof UsageLimitError) {
      const current = latestUsage();
      if (current && current.state !== 'stopped') {
        this.apply({ ...current, state: 'stopped' });
      }
    }
  }

  // The lane the member picked, sent back on chat so the server and app agree
  laneHeader(): Record<string, string> {
    const lane = latestUsage()?.lane;
    return lane ? { [LANE_HEADER]: lane } : {};
  }

  clear() {
    if (!latestUsage()) {
      return;
    }
    setLatestUsage(undefined);
    log.info('Usage cleared');
    sendAppStatusToMod(this.ctx.settings);
  }
}
