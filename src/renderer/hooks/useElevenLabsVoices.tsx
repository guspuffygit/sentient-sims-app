import { useQuery, useQueryClient } from '@tanstack/react-query';
import log from 'electron-log';
import { useCallback, useState } from 'react';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';
import { ElevenLabsVoicesCache, emptyElevenLabsVoicesCache } from 'main/sentient-sims/models/ElevenLabsVoice';

const client = new SentientSimsAppClient();

const queryKey = ['elevenLabsVoices'];

export type ElevenLabsVoicesHook = {
  cache: ElevenLabsVoicesCache;
  isLoading: boolean;
  isRefreshing: boolean;
  error?: string;
  refresh: () => Promise<void>;
};

/**
 * The user's cached ElevenLabs "My Voices" collection. The cache lives in app settings,
 * so it survives restarts and only changes when the user asks for a refresh.
 */
export function useElevenLabsVoices(): ElevenLabsVoicesHook {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => client.voice.getElevenLabsVoices(),
    staleTime: Infinity,
  });

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(undefined);
    try {
      const refreshed = await client.voice.refreshElevenLabsVoices();
      queryClient.setQueryData<ElevenLabsVoicesCache>(queryKey, refreshed);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error('Unable to refresh ElevenLabs voices', err);
      setError(message);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return {
    cache: data ?? emptyElevenLabsVoicesCache,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
