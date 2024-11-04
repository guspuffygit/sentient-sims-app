import log from 'electron-log';
import { VersionClient } from 'main/sentient-sims/clients/VersionClient';
import { Version } from 'main/sentient-sims/services/VersionService';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface VersionsContextType {
  app: Version;
  mod: Version;
  game: Version;
  loading: boolean;
  refresh: () => Promise<void>;
}

const VersionsContext = createContext<VersionsContextType | undefined>(
  undefined
);

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
  const [loading, setLoading] = useState(false);
  const [app, setApp] = useState<Version>({ version: 'none' });
  const [mod, setMod] = useState<Version>({ version: 'none' });
  const [game, setGame] = useState<Version>({ version: 'none' });

  const refresh = async () => {
    setLoading(true);

    await Promise.all([
      versionClient
        .getAppVersion()
        .then((result) => setApp(result))
        .catch((err: any) => log.error('Error getting app version', err)),
      versionClient
        .getModVersion()
        .then((result) => setMod(result))
        .catch((err: any) => log.error('Error getting mod version', err)),
      versionClient
        .getGameVersion()
        .then((result) => setGame(result))
        .catch((err: any) => log.error('Error getting game version', err)),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const contextValue = useMemo(() => {
    return {
      app,
      mod,
      game,
      loading,
      refresh,
    };
  }, [app, game, loading, mod]);

  return (
    <VersionsContext.Provider value={contextValue}>
      {children}
    </VersionsContext.Provider>
  );
}
