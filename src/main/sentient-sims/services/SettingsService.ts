import log from 'electron-log';
import Store from 'electron-store';
import path from 'path';
import { DeprecatedSettingsEnum, SettingsEnum } from '../models/SettingsEnum';
import { ApiType } from '../models/ApiType';
import {
  koboldaiDefaultEndpoint,
  openaiDefaultEndpoint,
  openaiDefaultModel,
  sentientSimsAIDefaultModel,
  sentientSimsAIHost,
} from '../constants';
import { disableDebugLogging, enableDebugLogging } from '../util/debugLog';

export function defaultStore(cwd?: string) {
  return new Store({
    cwd,
    schema: {
      [SettingsEnum.MOD_RELEASE.toString()]: {
        type: 'string',
        default: 'main',
      },
      [SettingsEnum.OPENAI_MODEL.toString()]: {
        type: 'string',
        default: openaiDefaultModel,
      },
      [SettingsEnum.SENTIENTSIMSAI_MODEL.toString()]: {
        type: 'string',
        default: sentientSimsAIDefaultModel,
      },
      [SettingsEnum.NOVELAI_MODEL.toString()]: {
        type: 'string',
        default: 'kayra-v1',
      },
      [DeprecatedSettingsEnum.CUSTOM_LLM_ENABLED.toString()]: {
        type: 'boolean',
        default: false,
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
      [SettingsEnum.NOVELAI_KEY.toString()]: {
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
      [SettingsEnum.MAPPING_NOTIFICATION_ENABLED.toString()]: {
        type: 'boolean',
        default: true,
      },
      [SettingsEnum.OPENAI_ENDPOINT.toString()]: {
        type: 'string',
        default: openaiDefaultEndpoint,
      },
      [SettingsEnum.SENTIENTSIMSAI_ENDPOINT.toString()]: {
        type: 'string',
        default: sentientSimsAIHost,
      },
      [SettingsEnum.KOBOLDAI_ENDPOINT.toString()]: {
        type: 'string',
        default: koboldaiDefaultEndpoint,
      },
    },
    migrations: {
      '3.1.0': (store) => {
        if (store.get(DeprecatedSettingsEnum.CUSTOM_LLM_ENABLED)) {
          if (
            store.get(DeprecatedSettingsEnum.CUSTOM_LLM_ENABLED) ===
            sentientSimsAIHost
          ) {
            store.set(
              SettingsEnum.AI_API_TYPE,
              ApiType.SentientSimsAI.toString()
            );
          } else {
            store.set(SettingsEnum.AI_API_TYPE, ApiType.CustomAI.toString());
          }
        } else {
          store.set(SettingsEnum.AI_API_TYPE, ApiType.OpenAI.toString());
        }
      },
    },
  });
}

export class SettingsService {
  private readonly store;

  // eslint-disable-next-line @typescript-eslint/no-shadow
  constructor(store?: Store) {
    this.store = store ?? defaultStore();
  }

  getSetting(key: string) {
    return this.store.get(key);
  }

  setSetting(key: string, value: any) {
    this.store.set(key, value);

    if (key !== SettingsEnum.ACCESS_TOKEN) {
      log.info(`Setting app setting: ${key} to value: ${value}`);
    }
    if (key === SettingsEnum.DEBUG_LOGS) {
      if (value) {
        enableDebugLogging();
      } else {
        disableDebugLogging();
      }
    }

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
