import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';

export type SettingsHook<T> = {
  value: T;
  isLoading: boolean;
  setSetting: (settingValue: T) => Promise<void>;
  resetSetting: () => Promise<void>;
};

const client = new SentientSimsAppClient();

export default function useSetting<T>(settingsEnum: SettingsEnum, defaultValue: T): SettingsHook<T> {
  const settingName = settingsEnum.toString();
  const queryClient = useQueryClient();
  const bounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['setting', settingName],
    queryFn: async () => {
      try {
        const result = await client.settings.getSetting(settingName);
        return result.value as T;
      } catch (err) {
        log.error(`Unable to get setting ${settingName}`, err);
        throw err;
      }
    },
    staleTime: Infinity,
  });

  const value = data ?? defaultValue;

  const setSetting = useCallback(
    (settingValue: T): Promise<void> => {
      if (bounceTimeoutRef.current) {
        clearTimeout(bounceTimeoutRef.current);
      }
      queryClient.setQueryData<T>(['setting', settingName], settingValue);
      bounceTimeoutRef.current = setTimeout(() => {
        log.debug(`Setting debounce running: ${settingsEnum.toString()}, value: ${String(settingValue)}`);
        window.electron.setSetting(settingsEnum, settingValue);
      }, 600);
      return Promise.resolve();
    },
    [queryClient, settingName, settingsEnum],
  );

  const resetSetting = useCallback(async (): Promise<void> => {
    if (defaultValue) {
      await setSetting(defaultValue);
    } else {
      window.electron.resetSetting(settingsEnum);
    }
  }, [defaultValue, setSetting, settingsEnum]);

  useEffect(() => {
    const unsubscribe = window.electron.onSettingChange((_event: unknown, setting: SettingsEnum, newValue: unknown) => {
      if (setting === settingsEnum) {
        log.debug(`New value: ${String(newValue)}`);
        queryClient.setQueryData<T>(['setting', settingName], newValue as T);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [queryClient, settingName, settingsEnum]);

  return { value, isLoading, setSetting, resetSetting };
}
