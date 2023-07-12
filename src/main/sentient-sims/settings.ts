import log from 'electron-log';
import Store from 'electron-store';
import path from 'path';

export enum SettingsEnum {
  MOD_RELEASE = 'modRelease',
  OPENAI_MODEL = 'openaiModel',
  MODS_DIRECTORY = 'modsDirectory',
}

const store = new Store({
  schema: {
    [SettingsEnum.MOD_RELEASE]: {
      type: 'string',
      default: 'main',
    },
    [SettingsEnum.OPENAI_MODEL]: {
      type: 'string',
      default: 'gpt-3.5-turbo',
    },
    [SettingsEnum.MODS_DIRECTORY]: {
      type: 'string',
      default: path.join(
        process.env.HOME || process.env.USERPROFILE || '',
        'Documents',
        'Electronic Arts',
        'The Sims 4',
        'Mods'
      ),
    },
  },
});

export function getSetting(key: string) {
  return store.get(key);
}

export function setSetting(key: string, value: any) {
  store.set(key, value);
  log.info(`Setting app setting: ${key} to value: ${value}`);
  return value;
}

export function get(setting: SettingsEnum) {
  return getSetting(setting);
}

export function set(setting: SettingsEnum, value: any) {
  return setSetting(setting, value);
}
