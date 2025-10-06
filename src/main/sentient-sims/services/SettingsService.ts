import log from 'electron-log';
import Store from 'electron-store';
import path from 'path';
import { DeprecatedSettingsEnum, SettingsEnum } from '../models/SettingsEnum';
import { defaultOpenAITTSSettings } from '../models/OpenAITTSSettings';
import { ApiType } from '../models/ApiType';
import {
  defaultElevenLabsEndpoint,
  defaultGeminiModel,
  defaultKokoroEndpoint,
  defaultTTSEnabled,
  defaultTTSVolume,
  defaultVLLMEndpoint,
  geminiDefaultEndpoint,
  koboldaiDefaultEndpoint,
  novelaiDefaultEndpoint,
  openaiDefaultEndpoint,
  openaiDefaultModel,
  sentientSimsAIDefaultModel,
  sentientSimsAIHost,
} from '../constants';
import { disableDebugLogging, enableDebugLogging } from '../util/debugLog';
import { defaultSentientSimsAITTSSettings } from '../models/SentientSimsAITTSSettings';
import { defaultKokoroAITTSSettings } from '../models/KokoroAITTSSettings';
import { defaultElevenLabsTTSSettings } from '../models/ElevenLabsTTSSettings';
import { WizardPage } from '../models/WizardPage';

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
          'Mods',
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
      [SettingsEnum.NOVELAI_ENDPOINT.toString()]: {
        type: 'string',
        default: novelaiDefaultEndpoint,
      },
      [SettingsEnum.GEMINI_KEYS.toString()]: {
        type: 'string',
        default: '', // Comma-separated list of Gemini API keys (e.g., "key1,key2,key3")
      },
      [SettingsEnum.GEMINI_ENDPOINT.toString()]: {
        type: 'string',
        default: geminiDefaultEndpoint,
      },
      [SettingsEnum.GEMINI_MODEL.toString()]: {
        type: 'string',
        default: defaultGeminiModel,
      },
      [SettingsEnum.TTS_ENABLED.toString()]: {
        type: 'boolean',
        default: defaultTTSEnabled,
      },
      [SettingsEnum.TTS_API_TYPE.toString()]: {
        type: 'string',
        default: ApiType.SentientSimsAI.toString(),
      },
      [SettingsEnum.TTS_VOLUME.toString()]: {
        type: 'number',
        default: defaultTTSVolume,
      },
      [SettingsEnum.OPENAI_TTS_SETTINGS.toString()]: {
        type: 'object',
        default: defaultOpenAITTSSettings,
      },
      [SettingsEnum.SENTIENTSIMSAI_TTS_SETTINGS.toString()]: {
        type: 'object',
        default: defaultSentientSimsAITTSSettings,
      },
      [SettingsEnum.KOKOROAI_ENDPOINT.toString()]: {
        type: 'string',
        default: defaultKokoroEndpoint,
      },
      [SettingsEnum.KOKOROAI_TTS_SETTINGS.toString()]: {
        type: 'object',
        default: defaultKokoroAITTSSettings,
      },
      [SettingsEnum.ELEVENLABS_KEY.toString()]: {
        type: 'string',
        default: '',
      },
      [SettingsEnum.ELEVENLABS_ENDPOINT.toString()]: {
        type: 'string',
        default: defaultElevenLabsEndpoint,
      },
      [SettingsEnum.ELEVENLABS_TTS_SETTINGS.toString()]: {
        type: 'object',
        default: defaultElevenLabsTTSSettings,
      },
      [SettingsEnum.VLLM_ENDPOINT.toString()]: {
        type: 'string',
        default: defaultVLLMEndpoint,
      },
      [SettingsEnum.SETUP_WIZARD_PAGE.toString()]: {
        type: 'string',
        default: WizardPage.INIT,
      },
      [SettingsEnum.PATREON_LINKING.toString()]: {
        type: 'boolean',
        default: false,
      },
    },
    migrations: {
      '3.1.0': (store) => {
        if (store.get(DeprecatedSettingsEnum.CUSTOM_LLM_ENABLED)) {
          if (store.get(DeprecatedSettingsEnum.CUSTOM_LLM_ENABLED) === sentientSimsAIHost) {
            store.set(SettingsEnum.AI_API_TYPE, ApiType.SentientSimsAI.toString());
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

  constructor(store?: Store) {
    this.store = store ?? defaultStore();
  }

  getSetting(key: string) {
    return this.store.get(key);
  }

  setSetting(key: string, value: any) {
    if (value === undefined) {
      return value;
    }
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
