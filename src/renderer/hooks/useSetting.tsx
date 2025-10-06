import { useCallback, useEffect, useState } from 'react';
import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { appApiUrl } from 'main/sentient-sims/constants';

export type SettingsHook<T> = {
  value: T;
  isLoading: boolean;
  setSetting: (settingValue: T) => Promise<void>;
  resetSetting: () => Promise<void>;
};

export default function useSetting<T = any>(settingsEnum: SettingsEnum, defaultValue: any = ''): SettingsHook<T> {
  const settingName = settingsEnum.toString();
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState<T>(defaultValue);
  const [bounceTimeout, setBounceTimeout] = useState<ReturnType<typeof setTimeout> | null>();

  const handleGetSetting = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${appApiUrl}/settings/app/${settingName}`);
      const result = await response.json();
      setValue((prev: any) => (prev !== result.value ? result.value : prev));
    } catch (err: any) {
      log.error(`Unable to get setting ${settingName}`, err);
    } finally {
      setIsLoading(false);
    }
  }, [settingName]);

  async function setSetting(settingValue: any) {
    if (bounceTimeout) {
      clearTimeout(bounceTimeout);
    }

    setValue(settingValue);

    // debounce so that we dont send a bunch of requests back and forth
    const timeout = setTimeout(() => {
      log.debug(`Setting debounce running: ${settingsEnum.toString()}, value: ${settingValue}`);
      window.electron.setSetting(settingsEnum, settingValue);
    }, 600);

    setBounceTimeout(timeout);
  }

  async function resetSetting() {
    if (defaultValue) {
      await setSetting(defaultValue);
    } else {
      window.electron.resetSetting(settingsEnum);
    }
  }

  useEffect(() => {
    handleGetSetting();
  }, [handleGetSetting]);

  useEffect(() => {
    const unsubscribe = window.electron.onSettingChange((_event: any, setting: SettingsEnum, newValue: any) => {
      if (setting === settingsEnum) {
        log.debug(`New value: ${newValue}`);
        setValue(newValue);
      }
    });

    return () => {
      unsubscribe();
    };
  });

  return {
    isLoading,
    value,
    setSetting,
    resetSetting,
  };
}
