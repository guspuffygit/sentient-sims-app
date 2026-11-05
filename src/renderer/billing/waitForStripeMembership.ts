import { MembershipInfo } from 'main/sentient-sims/models/UserInfo';

type Options = {
  intervalMs?: number;
  maxMs?: number;
  sleep?: (ms: number) => Promise<void>;
};

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

// Stripe's webhook writes the billing row a moment after the browser lands back on the
// app, so /me is asked again every few seconds until it names a Stripe membership
export async function waitForStripeMembership(
  fetchInfo: () => Promise<MembershipInfo | undefined>,
  { intervalMs = 3000, maxMs = 60000, sleep = defaultSleep }: Options = {},
): Promise<MembershipInfo | undefined> {
  const attempts = Math.max(1, Math.floor(maxMs / intervalMs));
  let info: MembershipInfo | undefined;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    info = await fetchInfo();
    if (info?.member && info.source === 'stripe') {
      return info;
    }
    await sleep(intervalMs);
  }
  return info;
}
