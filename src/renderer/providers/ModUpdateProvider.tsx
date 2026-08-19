import { createContext, ReactNode, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import log from 'electron-log';
import { fetchAuthSession } from 'aws-amplify/auth';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';
import { VersionClient } from 'main/sentient-sims/clients/VersionClient';
import { ModUpdate } from 'main/sentient-sims/services/UpdateService';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting, { SettingsHook } from 'renderer/hooks/useSetting';
import { useAuth } from './AuthProvider';
import { useVersions } from './VersionsProvider';
import { isNewVersionAvailable } from '../versions';

interface ModUpdateContextType {
  newVersionAvailable: boolean;
  lastChecked: string;
  busy: boolean;
  checkForUpdates: () => Promise<boolean>;
  installUpdate: () => Promise<void>;
}

const ModUpdateContext = createContext<ModUpdateContextType | undefined>(undefined);

export function useModUpdate() {
  const context = use(ModUpdateContext);
  if (!context) {
    throw new Error('useModUpdate must be used within a ModUpdateProvider');
  }
  return context;
}

const getCurrentTime = (): string => {
  const currentDate = new Date();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  const meridiem = hours >= 12 ? 'pm' : 'am';

  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${meridiem}`;
};

const client = new SentientSimsAppClient();
const versionClient = new VersionClient();

interface ModUpdateProviderProps {
  children: ReactNode;
}

// Single owner of the mod update flow. UpdateComponent renders in more than one
// place (HomePage and the setup wizard); when each instance ran its own check-
// and-install, the concurrent installs raced and corrupted the download.
export function ModUpdateProvider({ children }: ModUpdateProviderProps) {
  const { authStatus } = useAuth();
  const versions = useVersions();
  const releaseType: SettingsHook<string> = useSetting<string>(SettingsEnum.MOD_RELEASE, 'main');

  const [updateState, setUpdateState] = useState({
    newVersionAvailable: false,
    lastChecked: 'N/A',
  });
  const [pendingOps, setPendingOps] = useState(0);

  // versions.refresh is recreated every render; a ref keeps it out of callback deps
  const refreshVersionsRef = useRef(versions.refresh);
  useEffect(() => {
    refreshVersionsRef.current = versions.refresh;
  });

  const installPromiseRef = useRef<Promise<void> | undefined>(undefined);

  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    setPendingOps((count) => count + 1);
    try {
      const modVersion = await versionClient.getModVersion();
      log.debug(`modVersion: ${modVersion.version}`);
      const newVersionAvailable = await isNewVersionAvailable(modVersion.version, releaseType.value);
      setUpdateState({
        newVersionAvailable,
        lastChecked: getCurrentTime(),
      });
      return newVersionAvailable;
    } catch (err) {
      log.error('Error checking for updates:', err);
      return false;
    } finally {
      setPendingOps((count) => count - 1);
    }
  }, [releaseType.value]);

  const installUpdate = useCallback(
    async (options?: { auto?: boolean }): Promise<void> => {
      // A second caller (e.g. the wizard's button while the startup install is
      // still running) joins the in-flight install instead of starting another
      if (installPromiseRef.current) {
        return installPromiseRef.current;
      }

      const run = (async () => {
        setPendingOps((count) => count + 1);
        try {
          const authSession = await fetchAuthSession();
          if (!authSession.credentials) {
            log.info('Skipping mod update, not signed in');
            return;
          }
          const modUpdate: ModUpdate = {
            type: releaseType.value,
            credentials: authSession.credentials,
            auto: options?.auto,
          };
          const response = await client.update.updateMod(modUpdate);
          if (response.error) {
            // The main process already showed a popup for manual updates
            log.error(`Mod update failed: ${response.error.message}`);
            return;
          }
          if (response.skipped) {
            log.info(`Mod update skipped: ${response.skipped}`);
            return;
          }
          await checkForUpdates();
          await refreshVersionsRef.current();
        } catch (err) {
          log.error('Unable to request update to mod', err);
        } finally {
          setPendingOps((count) => count - 1);
        }
      })();

      installPromiseRef.current = run;
      const clear = () => {
        installPromiseRef.current = undefined;
      };
      run.then(clear).catch(clear);
      return run;
    },
    [releaseType.value, checkForUpdates],
  );

  // On startup: once auth and the release-channel setting have settled, check and
  // auto-install. Waiting for the setting matters — checking with the 'main'
  // default while the stored value is 'develop' used to install the wrong channel.
  // Later channel switches re-check only; installing stays a button click.
  const autoRanRef = useRef(false);
  const lastCheckedTypeRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (authStatus !== 'authenticated' || releaseType.isLoading) {
      return;
    }
    if (lastCheckedTypeRef.current === releaseType.value) {
      return;
    }
    lastCheckedTypeRef.current = releaseType.value;

    const firstRun = !autoRanRef.current;
    autoRanRef.current = true;
    void (async () => {
      try {
        const available = await checkForUpdates();
        if (firstRun && available) {
          log.info('New mod version available at startup, installing');
          await installUpdate({ auto: true });
        }
      } catch (err) {
        log.error('Startup mod update failed', err);
      }
    })();
  }, [authStatus, releaseType.isLoading, releaseType.value, checkForUpdates, installUpdate]);

  const contextValue = useMemo<ModUpdateContextType>(() => {
    return {
      newVersionAvailable: updateState.newVersionAvailable,
      lastChecked: updateState.lastChecked,
      busy: pendingOps > 0,
      checkForUpdates,
      installUpdate: () => installUpdate(),
    };
  }, [updateState, pendingOps, checkForUpdates, installUpdate]);

  return <ModUpdateContext value={contextValue}>{children}</ModUpdateContext>;
}
