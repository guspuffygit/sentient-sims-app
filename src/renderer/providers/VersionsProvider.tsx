import { useQuery } from '@tanstack/react-query';
import { VersionClient } from 'main/sentient-sims/clients/VersionClient';
import { Version } from 'main/sentient-sims/services/VersionService';
import { createContext, ReactNode, useContext } from 'react';

interface VersionsContextType {
  app: Version;
  mod: Version;
  game: Version;
  loading: boolean;
  refresh: () => Promise<void>;
}

const VersionsContext = createContext<VersionsContextType | undefined>(undefined);

interface VersionsProviderProps {
  children: ReactNode;
}

export function useVersions() {
  const context = useContext(VersionsContext);
  if (!context) {
    throw new Error('useVersions must be used within a VersionsProvider');
  }
  return context;
}

const versionClient = new VersionClient();

export function VersionsProvider({ children }: VersionsProviderProps) {
  const app = useQuery<Version>({
    queryKey: ['appVersion'],
    queryFn: async () => versionClient.getAppVersion(),
    initialData: { version: 'none' },
  });
  const mod = useQuery<Version>({
    queryKey: ['modVersion'],
    queryFn: async () => versionClient.getModVersion(),
    initialData: { version: 'none' },
  });
  const game = useQuery<Version>({
    queryKey: ['gameVersion'],
    queryFn: async () => versionClient.getGameVersion(),
    initialData: { version: 'none' },
  });

  const refresh = async () => {
    await Promise.all([app.refetch(), mod.refetch(), game.refetch()]);
  };

  return (
    <VersionsContext.Provider
      value={{
        app: app.data,
        mod: mod.data,
        game: game.data,
        loading: app.isLoading || mod.isLoading || game.isLoading,
        refresh,
      }}
    >
      {children}
    </VersionsContext.Provider>
  );
}
