import log from 'electron-log';
import Store from 'electron-store';
import path from 'path';
import { SettingsEnum } from '../models/SettingsEnum';

export const defaultStore = new Store({
  schema: {
    [SettingsEnum.MOD_RELEASE.toString()]: {
      type: 'string',
      default: 'main',
    },
    [SettingsEnum.OPENAI_MODEL.toString()]: {
      type: 'string',
      default: 'gpt-3.5-turbo',
    },
    [SettingsEnum.CUSTOM_LLM_ENABLED.toString()]: {
      type: 'boolean',
      default: false,
    },
    [SettingsEnum.CUSTOM_LLM_HOSTNAME.toString()]: {
      type: 'string',
      default: 'https://ai.sentientsimulations.com',
    },
    [SettingsEnum.MODS_DIRECTORY.toString()]: {
      type: 'string',
      default: path.join(
        process.env.HOME || process.env.USERPROFILE || '',
        'Documents',
        'Electronic Arts',
        'The Sims 4',
        'Mods'
      ),
    },
    [SettingsEnum.ACCESS_TOKEN.toString()]: {
      type: 'string',
      default: '',
    },
    [SettingsEnum.OPENAI_KEY.toString()]: {
      type: 'string',
      default: '',
    },
    [SettingsEnum.LOCALIZATION_ENABLED.toString()]: {
      type: 'boolean',
      default: false,
    },
    [SettingsEnum.LOCALIZATION_LANGUAGE.toString()]: {
      type: 'string',
      default: '',
    },
    [SettingsEnum.DEBUG_LOGS.toString()]: {
      type: 'boolean',
      default: false,
    },
    [SettingsEnum.NSFW_ENABLED.toString()]: {
      type: 'boolean',
      default: false,
    },
  },
});

export class SettingsService {
  private readonly store;

  // eslint-disable-next-line @typescript-eslint/no-shadow
  constructor(store?: Store) {
    if (store) {
      this.store = store;
    } else {
      this.store = defaultStore;
    }
  }

  getSetting(key: string) {
    return this.store.get(key);
  }

  setSetting(key: string, value: any) {
    this.store.set(key, value);
    log.info(`Setting app setting: ${key} to value: ${value}`);
    return value;
  }

  resetSetting(key: string) {
    this.store.reset(key);
    const defaultValue = this.getSetting(key);
    log.info(`Reset app setting: ${key} to value: ${defaultValue}`);
    return defaultValue;
  }

  get(setting: SettingsEnum) {
    return this.getSetting(setting);
  }

  set(setting: SettingsEnum, value: any) {
    return this.setSetting(setting, value);
  }
}
