import log from 'electron-log';
import Store from 'electron-store';
import path from 'path';

export enum SettingsEnum {
  MOD_RELEASE = 'modRelease',
  OPENAI_MODEL = 'openaiModel',
  MODS_DIRECTORY = 'modsDirectory',
  CUSTOM_LLM_ENABLED = 'customLLMEnabled',
  CUSTOM_LLM_HOSTNAME = 'customLLMHostname',
  ACCESS_TOKEN = 'accessToken',
}

export class SettingsService {
  private store = new Store({
    schema: {
      [SettingsEnum.MOD_RELEASE]: {
        type: 'string',
        default: 'main',
      },
      [SettingsEnum.OPENAI_MODEL]: {
        type: 'string',
        default: 'gpt-3.5-turbo',
      },
      [SettingsEnum.CUSTOM_LLM_ENABLED]: {
        type: 'boolean',
        default: false,
      },
      [SettingsEnum.CUSTOM_LLM_HOSTNAME]: {
        type: 'string',
        default: 'https://ai.sentientsimulations.com:25150',
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
      [SettingsEnum.ACCESS_TOKEN]: {
        type: 'string',
      },
    },
  });

  getSetting(key: string) {
    return this.store.get(key);
  }

  setSetting(key: string, value: any) {
    this.store.set(key, value);
    log.info(`Setting app setting: ${key} to value: ${value}`);
    return value;
  }

  get(setting: SettingsEnum) {
    return this.getSetting(setting);
  }

  set(setting: SettingsEnum, value: any) {
    return this.setSetting(setting, value);
  }
}
