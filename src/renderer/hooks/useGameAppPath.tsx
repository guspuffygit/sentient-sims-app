import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import log from 'electron-log';
import useSetting from './useSetting';

export function useGameAppPath() {
  const gameAppPath = useSetting(SettingsEnum.GAME_APP_PATH, '');

  const handleGameAppPicker = async () => {
    try {
      const filePath = await window.electron.selectGameApp();
      if (filePath) {
        log.info(`Changed game app path to: ${filePath}`);
        await gameAppPath.setSetting(filePath);
      }
    } catch (error) {
      log.error('Error selecting game app:', error);
    }
  };

  return {
    openGameAppPicker: handleGameAppPicker,
    value: gameAppPath.value,
    resetValue: gameAppPath.resetSetting,
  };
}
