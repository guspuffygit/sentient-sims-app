import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import log from 'electron-log';
import useSetting from './useSetting';

export function useModsDirectory() {
  const modsDirectory = useSetting(SettingsEnum.MODS_DIRECTORY);

  const handleDirectoryPicker = async () => {
    try {
      const filePath = await window.electron.selectDirectory();
      if (filePath) {
        log.info(`Changed Mods directory to: ${filePath}`);
        modsDirectory.setSetting(filePath);
      }
    } catch (error) {
      log.error('Error selecting directory:', error);
    }
  };

  return {
    openDirectoryPicker: handleDirectoryPicker,
    value: modsDirectory.value,
    resetValue: modsDirectory.resetSetting,
  };
}
