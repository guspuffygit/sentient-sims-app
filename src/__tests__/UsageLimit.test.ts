import { AxiosError, AxiosHeaders } from 'axios';
import { Request, Response } from 'express';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UsageHeader, parseUsageHeader, usageHeaderFrom } from 'main/sentient-sims/billing/usageHeader';
import { setLatestUsage } from 'main/sentient-sims/billing/usageStatus';
import { UsageLimitError } from 'main/sentient-sims/exceptions/UsageLimitError';
import { UsageLimitService } from 'main/sentient-sims/services/UsageLimitService';
import { respondUsageRejection } from 'main/sentient-sims/controllers/usageRejection';
import { CatchErrors } from 'main/sentient-sims/controllers/decorators/CatchError';
import { sendAppStatusToMod } from 'main/sentient-sims/util/notifyRenderer';
import { getMembershipDebugText } from 'main/sentient-sims/util/membershipDebug';
import { patchMeUsage } from 'renderer/billing/meQuery';
import { mockApiContext } from './util';

const { sendModNotification, notifyAllWindows } = vi.hoisted(() => ({
  sendModNotification: vi.fn(),
  notifyAllWindows: vi.fn(),
}));
vi.mock('main/sentient-sims/websocketServer', () => ({ sendModNotification }));
vi.mock('main/sentient-sims/util/browserWindows', () => ({
  getAllBrowserWindows: () => [{ webContents: { send: notifyAllWindows, isDestroyed: () => false } }],
}));

const header = 'percent=62; state=normal; extra=0.00; limit=0; lane=fast; period_end=2026-11-01T00:00:00Z';

function fakeResponse() {
  const res = { statusCode: 0, body: undefined as unknown };
  const typed = {
    status(code: number) {
      res.statusCode = code;
      return typed;
    },
    json(body: unknown) {
      res.body = body;
      return typed;
    },
  } as unknown as Response;
  return { res, typed };
}

describe('parseUsageHeader', () => {
  it('reads every field the server stamps', () => {
    expect(parseUsageHeader(header)).toEqual({
      percent: 62,
      state: 'normal',
      extraUsd: 0,
      limitUsd: 0,
      lane: 'fast',
      periodEnd: '2026-11-01T00:00:00Z',
    });
  });

  it('defaults the optional fields and rejects a header without percent and state', () => {
    expect(parseUsageHeader('percent=100; state=extra; extra=1.25; limit=20; lane=slow')).toEqual({
      percent: 100,
      state: 'extra',
      extraUsd: 1.25,
      limitUsd: 20,
      lane: 'slow',
    });
    expect(parseUsageHeader('percent=3; state=normal; lane=warp')).toEqual({
      percent: 3,
      state: 'normal',
      extraUsd: 0,
      limitUsd: 0,
    });
    expect(parseUsageHeader('percent=abc; state=normal')).toBeUndefined();
    expect(parseUsageHeader('percent=5; state=weird')).toBeUndefined();
    expect(parseUsageHeader(undefined)).toBeUndefined();
    expect(parseUsageHeader('')).toBeUndefined();
  });

  it('reads axios headers, fetch headers and raw values alike', () => {
    expect(usageHeaderFrom(new AxiosHeaders({ 'x-sentient-usage': header }))?.percent).toBe(62);
    expect(usageHeaderFrom(new Headers({ 'x-sentient-usage': header }))?.percent).toBe(62);
    expect(usageHeaderFrom({ 'x-sentient-usage': [header] })?.percent).toBe(62);
    expect(usageHeaderFrom(header)?.percent).toBe(62);
    expect(usageHeaderFrom({})).toBeUndefined();
  });
});

describe('UsageLimitService', () => {
  const ctx = mockApiContext();
  const service = new UsageLimitService(ctx);

  beforeEach(() => {
    setLatestUsage(undefined);
    sendModNotification.mockClear();
    notifyAllWindows.mockClear();
  });

  it('tells the renderer and the mod when the usage changes, and only then', () => {
    service.record(header);
    expect(notifyAllWindows).toHaveBeenCalledWith('usage', expect.objectContaining({ percent: 62 }));
    expect(sendModNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'app_status',
        usage_percent: 62,
        usage_state: 'normal',
        chat_lane: 'fast',
      }),
    );

    service.record(header);
    expect(notifyAllWindows).toHaveBeenCalledTimes(1);
    expect(sendModNotification).toHaveBeenCalledTimes(1);

    service.record(header.replace('percent=62', 'percent=63'));
    expect(sendModNotification).toHaveBeenCalledTimes(2);
  });

  it('sends the lane back on chat once it is known', () => {
    expect(service.laneHeader()).toEqual({});
    service.record(header.replace(' lane=fast;', ''));
    expect(service.laneHeader()).toEqual({});
    service.record(header.replace('lane=fast', 'lane=slow'));
    expect(service.laneHeader()).toEqual({ 'sentient-sims-lane': 'slow' });
  });

  it('marks the usage stopped on a refusal', () => {
    service.record(header.replace('percent=62', 'percent=99').replace('state=normal', 'state=near'));
    service.recordError(new UsageLimitError({ error: 'monthly usage used up', reason: 'usage' }));
    expect(service.current()?.state).toBe('stopped');
    expect(sendModNotification).toHaveBeenLastCalledWith(expect.objectContaining({ usage_state: 'stopped' }));
  });

  it('reads the header off a failed axios call', () => {
    const err = new AxiosError('rate limited', '429', undefined, undefined, {
      status: 429,
      statusText: 'Too Many Requests',
      data: {},
      config: { headers: new AxiosHeaders() },
      headers: new AxiosHeaders({ 'x-sentient-usage': header.replace('state=normal', 'state=stopped') }),
    });
    service.recordError(err);
    expect(service.current()?.state).toBe('stopped');
  });

  it('leaves the app status alone until a header arrives', () => {
    sendAppStatusToMod(ctx.settings);
    const sent = sendModNotification.mock.calls.at(-1)?.[0] as Record<string, unknown> | undefined;
    expect(sent?.type).toBe('app_status');
    expect(sent).not.toHaveProperty('usage_percent');
  });

  it('forgets the meter when the signed-in account changes, and tells the mod', () => {
    service.record(header);
    service.onAccessTokenChanged(fakeJwt('alice'));
    expect(service.current()).toBeUndefined();
    const sent = sendModNotification.mock.calls.at(-1)?.[0] as Record<string, unknown> | undefined;
    expect(sent?.type).toBe('app_status');
    expect(sent).not.toHaveProperty('usage_percent');

    service.record(header);
    service.onAccessTokenChanged(fakeJwt('alice'));
    expect(service.current()?.percent).toBe(62);

    service.onAccessTokenChanged('');
    expect(service.current()).toBeUndefined();
    expect(service.laneHeader()).toEqual({});
  });
});

function fakeJwt(sub: string): string {
  const part = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${part({ alg: 'none' })}.${part({ sub, exp: 4102444800 })}.sig`;
}

describe('membership debug text', () => {
  const claims = { sub: 'abc', emailVerified: true, email: 'a@b.c' };
  const parsed = usageHeaderFrom(header) as UsageHeader;

  it('prefers the /me block, then the last header, then says so', () => {
    const info = {
      member: true,
      source: 'patreon' as const,
      tier: 'tier1',
      founder: false,
      dev: false,
      priceUsd: 5,
      includedUsd: 5,
      extraEnabled: false,
      extraLimitUsd: 0,
      lane: 'slow' as const,
      cancelAtPeriodEnd: false,
      usage: { percent: 40, state: 'normal' as const, extraUsd: 0 },
    };
    expect(getMembershipDebugText(claims, info, parsed)).toContain('Usage: 40% normal, slow lane');
    expect(getMembershipDebugText(claims, undefined, parsed)).toContain('Usage: 62% normal, fast lane (last header)');
    expect(getMembershipDebugText(claims)).toContain('Usage: Not loaded');
  });
});

describe('patchMeUsage', () => {
  const parsed = usageHeaderFrom(
    header.replace('percent=62', 'percent=70').replace('lane=fast', 'lane=slow'),
  ) as UsageHeader;

  it('moves the header into the cached /me without touching the plan', () => {
    const me = {
      membership: {
        member: true,
        source: 'stripe' as const,
        tier: 'tier2',
        founder: false,
        dev: false,
        priceUsd: 20,
        includedUsd: 20,
        extraEnabled: true,
        extraLimitUsd: 10,
        lane: 'fast' as const,
        cancelAtPeriodEnd: false,
        usage: { percent: 62, state: 'normal' as const, extraUsd: 0 },
      },
    };
    const patched = patchMeUsage(me, parsed);
    expect(patched?.membership?.usage.percent).toBe(70);
    expect(patched?.membership?.lane).toBe('slow');
    expect(patched?.membership?.extraLimitUsd).toBe(10);
    expect(me.membership.usage.percent).toBe(62);
  });

  it('leaves an empty cache alone', () => {
    expect(patchMeUsage(undefined, parsed)).toBeUndefined();
    expect(patchMeUsage({}, parsed)).toEqual({});
  });
});

describe('usage rejection', () => {
  it('answers a 200 with rejected set instead of an error', () => {
    const { res, typed } = fakeResponse();
    const handled = respondUsageRejection(
      typed,
      new UsageLimitError({ error: 'monthly usage used up', reason: 'limit' }),
    );
    expect(handled).toBe(true);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ rejected: true, reason: UsageLimitError.messageFor('limit') });
  });

  it('leaves other errors to the caller', () => {
    const { typed } = fakeResponse();
    expect(respondUsageRejection(typed, new Error('boom'))).toBe(false);
  });

  it('reaches the decorated controller routes without a popup', async () => {
    class Controller {
      @CatchErrors()
      handler = async (req: Request, res: Response) => {
        await Promise.resolve();
        throw new UsageLimitError({ error: `${req.method} ${res.statusCode}`, reason: 'usage' });
      };
    }
    const { res, typed } = fakeResponse();
    notifyAllWindows.mockClear();
    await new Controller().handler({ body: {}, url: '/ai/v2/generate', method: 'POST' } as never, typed);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ rejected: true, reason: UsageLimitError.messageFor('usage') });
    expect(notifyAllWindows).not.toHaveBeenCalledWith('caught-error-popup-notification', expect.anything());
  });
});
