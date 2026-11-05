import { UsageHeader } from './usageHeader';

let latest: UsageHeader | undefined;

// The last usage the server reported, read by the app status sent to the mod
export function latestUsage(): UsageHeader | undefined {
  return latest;
}

export function setLatestUsage(header: UsageHeader | undefined) {
  latest = header;
}
