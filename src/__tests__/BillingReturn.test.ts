import { Server } from 'http';
import path from 'path';
import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { runApi } from 'main/sentient-sims/api';
import { billingReturnKind } from 'main/sentient-sims/billing/billingReturn';
import { MembershipInfo } from 'main/sentient-sims/models/UserInfo';
import { waitForStripeMembership } from 'renderer/billing/waitForStripeMembership';
import { mockApiContext } from './util';

vi.mock('main/sentient-sims/util/notifyRenderer', async (importOriginal) => {
  const original = await importOriginal<typeof import('main/sentient-sims/util/notifyRenderer')>();
  return { ...original, notifyBillingReturn: vi.fn() };
});

const { notifyBillingReturn } = await import('main/sentient-sims/util/notifyRenderer');

function info(overrides: Partial<MembershipInfo>): MembershipInfo {
  return {
    member: false,
    source: 'none',
    founder: false,
    dev: false,
    priceUsd: 0,
    includedUsd: 0,
    extraEnabled: false,
    extraLimitUsd: 0,
    lane: 'fast',
    cancelAtPeriodEnd: false,
    usage: { percent: 0, state: 'normal', extraUsd: 0 },
    ...overrides,
  };
}

describe('billingReturnKind', () => {
  it('reads the query the server sends the browser back with', () => {
    expect(billingReturnKind({ session_id: 'cs_123' })).toBe('success');
    expect(billingReturnKind({ canceled: '1' })).toBe('canceled');
    expect(billingReturnKind({ portal: '1' })).toBe('portal');
    expect(billingReturnKind({})).toBe('success');
  });
});

describe('GET /billing/return', () => {
  const ctx = mockApiContext({
    getAssetPath: (...paths: string[]) => path.join(process.cwd(), 'assets', ...paths),
  });
  let server: Server;

  beforeAll(() => {
    server = runApi(ctx);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  it('tells the browser to close and the renderer what happened', async () => {
    const res = await fetch(`http://localhost:${ctx.port}/billing/return?session_id=cs_123`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('close this tab');
    expect(notifyBillingReturn).toHaveBeenLastCalledWith('success');

    await fetch(`http://localhost:${ctx.port}/billing/return?canceled=1`);
    expect(notifyBillingReturn).toHaveBeenLastCalledWith('canceled');

    await fetch(`http://localhost:${ctx.port}/billing/return?portal=1`);
    expect(notifyBillingReturn).toHaveBeenLastCalledWith('portal');
  });
});

describe('waitForStripeMembership', () => {
  const sleep = vi.fn(() => Promise.resolve());

  it('polls until /me names a stripe membership', async () => {
    const answers = [info({}), info({}), info({ member: true, source: 'stripe' })];
    const fetchInfo = vi.fn(() => Promise.resolve(answers.shift()));

    const result = await waitForStripeMembership(fetchInfo, { intervalMs: 3000, maxMs: 60000, sleep });

    expect(result?.source).toBe('stripe');
    expect(fetchInfo).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it('gives up after a minute and returns the last answer', async () => {
    sleep.mockClear();
    const fetchInfo = vi.fn(() => Promise.resolve(info({ source: 'patreon', member: true })));

    const result = await waitForStripeMembership(fetchInfo, { intervalMs: 3000, maxMs: 60000, sleep });

    expect(result?.source).toBe('patreon');
    expect(fetchInfo).toHaveBeenCalledTimes(20);
  });
});
