import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http from 'http';
import { AddressInfo } from 'net';
import { axiosClient } from 'main/sentient-sims/clients/AxiosClient';
import { UsageLimitError } from 'main/sentient-sims/exceptions/UsageLimitError';
import { SubscriptionRequiredError } from 'main/sentient-sims/exceptions/SubscriptionRequiredError';

type Route = { status: number; body: unknown };

const routes: { [path: string]: Route } = {
  '/usage': {
    status: 429,
    body: { error: 'monthly usage used up', reason: 'usage', resets_at: '2026-11-27T00:00:00Z', state: 'stopped' },
  },
  '/limit': { status: 429, body: { error: 'monthly usage used up', reason: 'limit', state: 'stopped' } },
  '/upstream': { status: 429, body: { error: 'rate limited by the provider' } },
  '/founder': {
    status: 452,
    body: {
      code: 452,
      message:
        'The model moonshotai/Kimi-K2-Instruct-0905 needs a Sentient Sims subscription. Founders can use the models that run on Sentient Sims servers.',
      reason: 'subscription_required',
    },
  },
  '/nonmember': { status: 452, body: { code: 452, message: 'not a member' } },
};

const hits: { [path: string]: number } = {};
let server: http.Server;
let baseURL: string;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    const path = req.url ?? '';
    hits[path] = (hits[path] ?? 0) + 1;
    const route = routes[path];
    res.writeHead(route.status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(route.body));
  });
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

describe('AxiosClient 429 handling', () => {
  it('turns a usage refusal into a UsageLimitError without retrying', async () => {
    const error = await axiosClient.post(`${baseURL}/usage`, {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(UsageLimitError);
    expect((error as UsageLimitError).reason).toBe('usage');
    expect((error as UsageLimitError).resetsAt).toBe('2026-11-27T00:00:00Z');
    expect((error as UsageLimitError).message).toBe(
      'Monthly usage used up. Upgrade your Patreon tier or wait for the reset.',
    );
    expect(hits['/usage']).toBe(1);
  });

  it('names the extra usage limit when that is what ran out', async () => {
    const error = await axiosClient.post(`${baseURL}/limit`, {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(UsageLimitError);
    expect((error as UsageLimitError).message).toContain('Extra usage limit reached');
    expect(hits['/limit']).toBe(1);
  });

  it('still retries a provider rate limit', async () => {
    const error = await axiosClient.post(`${baseURL}/upstream`, {}).catch((e: unknown) => e);
    expect(error).not.toBeInstanceOf(UsageLimitError);
    expect(hits['/upstream']).toBe(4);
  });
});

describe('AxiosClient 452 handling', () => {
  it("passes on the server's reason when a founder needs a subscription", async () => {
    const error = await axiosClient.post(`${baseURL}/founder`, {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(SubscriptionRequiredError);
    expect((error as Error).message).toBe(
      'The model moonshotai/Kimi-K2-Instruct-0905 needs a Sentient Sims subscription. Founders can use the models that run on Sentient Sims servers. Subscribe from the Plan tab in Settings.',
    );
    expect(hits['/founder']).toBe(1);
  });

  it('keeps the membership message for anyone else', async () => {
    const error = await axiosClient.post(`${baseURL}/nonmember`, {}).catch((e: unknown) => e);
    expect(error).not.toBeInstanceOf(SubscriptionRequiredError);
    expect((error as Error).message).toContain('A Sentient Sims membership is needed');
    expect(hits['/nonmember']).toBe(1);
  });
});
