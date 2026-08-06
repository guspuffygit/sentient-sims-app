export const ONLINE_MAPPING_SYNC_INTERVAL_MS = 5 * 60_000;

export function onlineMappingsEqual(a: Map<string, unknown>, b: Map<string, unknown>): boolean {
  if (a.size !== b.size) {
    return false;
  }

  return Array.from(a.entries()).every(
    ([key, value]) => b.has(key) && JSON.stringify(value) === JSON.stringify(b.get(key)),
  );
}
