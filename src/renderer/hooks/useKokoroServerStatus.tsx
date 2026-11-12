import { useQuery } from '@tanstack/react-query';
import { kokoroVoicesUrl } from 'main/sentient-sims/clients/KokoroTTSRequest';

export type KokoroServerStatus = 'checking' | 'online' | 'offline';

const checkEveryMs = 5000;
const checkTimeoutMs = 3000;

async function serverAnswers(endpoint: string): Promise<boolean> {
  const url = kokoroVoicesUrl(endpoint);
  if (!/^https?:\/\//i.test(url)) {
    return false;
  }

  try {
    await fetch(url, { signal: AbortSignal.timeout(checkTimeoutMs) });
    return true;
  } catch {
    return false;
  }
}

/**
 * Whether anything answers at the player's Kokoro address. It keeps asking while mounted,
 * so the settings panel notices the moment the player starts their server.
 */
export function useKokoroServerStatus(endpoint: string): KokoroServerStatus {
  const { data } = useQuery({
    queryKey: ['kokoroServerStatus', endpoint],
    queryFn: () => serverAnswers(endpoint),
    refetchInterval: checkEveryMs,
    retry: false,
    gcTime: 0,
  });

  if (data === undefined) {
    return 'checking';
  }
  return data ? 'online' : 'offline';
}
