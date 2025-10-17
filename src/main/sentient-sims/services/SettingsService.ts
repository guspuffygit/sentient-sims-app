import log from 'electron-log';
import Store from 'electron-store';
import path from 'path';
import { DeprecatedSettingsEnum, SettingsEnum } from '../models/SettingsEnum';
import { defaultOpenAITTSSettings, OpenAITTSSettings } from '../models/OpenAITTSSettings';
import { ApiType, ApiTypeFromValue } from '../models/ApiType';
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
  novelaiGenerationDefaultEndpoint,
  openaiDefaultEndpoint,
  openaiDefaultModel,
  sentientSimsAIDefaultModel,
  sentientSimsAIHost,
} from '../constants';
import { disableDebugLogging, enableDebugLogging } from '../util/debugLog';
import { defaultSentientSimsAITTSSettings, SentientSimsAITTSSettings } from '../models/SentientSimsAITTSSettings';
import { defaultKokoroAITTSSettings, KokoroAITTSSettings } from '../models/KokoroAITTSSettings';
import { defaultElevenLabsTTSSettings, ElevenLabsTTSSettings } from '../models/ElevenLabsTTSSettings';
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
      [SettingsEnum.NOVELAI_GENERATION_ENDPOINT.toString()]: {
        type: 'string',
        default: novelaiGenerationDefaultEndpoint,
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

  get modRelease(): string {
    return this.get(SettingsEnum.MOD_RELEASE) as string;
  }

  set modRelease(value: string) {
    this.set(SettingsEnum.MOD_RELEASE, value);
  }

  get openaiModel(): string {
    return this.get(SettingsEnum.OPENAI_MODEL) as string;
  }

  set openaiModel(value: string) {
    this.set(SettingsEnum.OPENAI_MODEL, value);
  }

  get sentientSimsAIModel(): string {
    return this.get(SettingsEnum.SENTIENTSIMSAI_MODEL) as string;
  }

  set sentientSimsAIModel(value: string) {
    this.set(SettingsEnum.SENTIENTSIMSAI_MODEL, value);
  }

  get novelAIModel(): string {
    return this.get(SettingsEnum.NOVELAI_MODEL) as string;
  }

  set novelAIModel(value: string) {
    this.set(SettingsEnum.NOVELAI_MODEL, value);
  }

  get modsDirectory(): string {
    return this.get(SettingsEnum.MODS_DIRECTORY) as string;
  }

  set modsDirectory(value: string) {
    this.set(SettingsEnum.MODS_DIRECTORY, value);
  }

  get accessToken(): string {
    return this.get(SettingsEnum.ACCESS_TOKEN) as string;
  }

  set accessToken(value: string) {
    this.set(SettingsEnum.ACCESS_TOKEN, value);
  }

  get openaiKey(): string {
    return this.get(SettingsEnum.OPENAI_KEY) as string;
  }

  set openaiKey(value: string) {
    this.set(SettingsEnum.OPENAI_KEY, value);
  }

  get novelAIKey(): string {
    return this.get(SettingsEnum.NOVELAI_KEY) as string;
  }

  set novelAIKey(value: string) {
    this.set(SettingsEnum.NOVELAI_KEY, value);
  }

  get localizationEnabled(): boolean {
    return this.get(SettingsEnum.LOCALIZATION_ENABLED) as boolean;
  }

  set localizationEnabled(value: boolean) {
    this.set(SettingsEnum.LOCALIZATION_ENABLED, value);
  }

  get localizationLanguage(): string {
    return this.get(SettingsEnum.LOCALIZATION_LANGUAGE) as string;
  }

  set localizationLanguage(value: string) {
    this.set(SettingsEnum.LOCALIZATION_LANGUAGE, value);
  }

  get debugLogs(): boolean {
    return this.get(SettingsEnum.DEBUG_LOGS) as boolean;
  }

  set debugLogs(value: boolean) {
    this.set(SettingsEnum.DEBUG_LOGS, value);
  }

  get nsfwEnabled(): boolean {
    return this.get(SettingsEnum.NSFW_ENABLED) as boolean;
  }

  set nsfwEnabled(value: boolean) {
    this.set(SettingsEnum.NSFW_ENABLED, value);
  }

  get mappingNotificationEnabled(): boolean {
    return this.get(SettingsEnum.MAPPING_NOTIFICATION_ENABLED) as boolean;
  }

  set mappingNotificationEnabled(value: boolean) {
    this.set(SettingsEnum.MAPPING_NOTIFICATION_ENABLED, value);
  }

  get openaiEndpoint(): string {
    return this.get(SettingsEnum.OPENAI_ENDPOINT) as string;
  }

  set openaiEndpoint(value: string) {
    this.set(SettingsEnum.OPENAI_ENDPOINT, value);
  }

  get sentientSimsAIEndpoint(): string {
    return this.get(SettingsEnum.SENTIENTSIMSAI_ENDPOINT) as string;
  }

  set sentientSimsAIEndpoint(value: string) {
    this.set(SettingsEnum.SENTIENTSIMSAI_ENDPOINT, value);
  }

  get koboldaiEndpoint(): string {
    return this.get(SettingsEnum.KOBOLDAI_ENDPOINT) as string;
  }

  set koboldaiEndpoint(value: string) {
    this.set(SettingsEnum.KOBOLDAI_ENDPOINT, value);
  }

  get novelAIEndpoint(): string {
    return this.get(SettingsEnum.NOVELAI_ENDPOINT) as string;
  }

  set novelAIEndpoint(value: string) {
    this.set(SettingsEnum.NOVELAI_ENDPOINT, value);
  }

  get novelAIGenerationEndpoint(): string {
    return this.get(SettingsEnum.NOVELAI_GENERATION_ENDPOINT) as string;
  }

  set novelAIGenerationEndpoint(value: string) {
    this.set(SettingsEnum.NOVELAI_GENERATION_ENDPOINT, value);
  }

  get geminiKeys(): string {
    return this.get(SettingsEnum.GEMINI_KEYS) as string;
  }

  set geminiKeys(value: string) {
    this.set(SettingsEnum.GEMINI_KEYS, value);
  }

  get geminiEndpoint(): string {
    return this.get(SettingsEnum.GEMINI_ENDPOINT) as string;
  }

  set geminiEndpoint(value: string) {
    this.set(SettingsEnum.GEMINI_ENDPOINT, value);
  }

  get geminiModel(): string {
    return this.get(SettingsEnum.GEMINI_MODEL) as string;
  }

  set geminiModel(value: string) {
    this.set(SettingsEnum.GEMINI_MODEL, value);
  }

  get ttsEnabled(): boolean {
    return this.get(SettingsEnum.TTS_ENABLED) as boolean;
  }

  set ttsEnabled(value: boolean) {
    this.set(SettingsEnum.TTS_ENABLED, value);
  }

  get ttsApiType(): ApiType {
    return this.get(SettingsEnum.TTS_API_TYPE) as ApiType;
  }

  set ttsApiType(value: ApiType) {
    this.set(SettingsEnum.TTS_API_TYPE, value);
  }

  get ttsVolume(): number {
    return this.get(SettingsEnum.TTS_VOLUME) as number;
  }

  set ttsVolume(value: number) {
    this.set(SettingsEnum.TTS_VOLUME, value);
  }

  get openaiTtsSettings(): OpenAITTSSettings {
    return this.get(SettingsEnum.OPENAI_TTS_SETTINGS) as OpenAITTSSettings;
  }

  set openaiTtsSettings(value: OpenAITTSSettings) {
    this.set(SettingsEnum.OPENAI_TTS_SETTINGS, value);
  }

  get sentientSimsAITtsSettings(): SentientSimsAITTSSettings {
    return this.get(SettingsEnum.SENTIENTSIMSAI_TTS_SETTINGS) as SentientSimsAITTSSettings;
  }

  set sentientSimsAITtsSettings(value: SentientSimsAITTSSettings) {
    this.set(SettingsEnum.SENTIENTSIMSAI_TTS_SETTINGS, value);
  }

  get kokoroaiEndpoint(): string {
    return this.get(SettingsEnum.KOKOROAI_ENDPOINT) as string;
  }

  set kokoroaiEndpoint(value: string) {
    this.set(SettingsEnum.KOKOROAI_ENDPOINT, value);
  }

  get kokoroaiTtsSettings(): KokoroAITTSSettings {
    return this.get(SettingsEnum.KOKOROAI_TTS_SETTINGS) as KokoroAITTSSettings;
  }

  set kokoroaiTtsSettings(value: KokoroAITTSSettings) {
    this.set(SettingsEnum.KOKOROAI_TTS_SETTINGS, value);
  }

  get elevenLabsKey(): string {
    return this.get(SettingsEnum.ELEVENLABS_KEY) as string;
  }

  set elevenLabsKey(value: string) {
    this.set(SettingsEnum.ELEVENLABS_KEY, value);
  }

  get elevenLabsEndpoint(): string {
    return this.get(SettingsEnum.ELEVENLABS_ENDPOINT) as string;
  }

  set elevenLabsEndpoint(value: string) {
    this.set(SettingsEnum.ELEVENLABS_ENDPOINT, value);
  }

  get elevenLabsTtsSettings(): ElevenLabsTTSSettings {
    return this.get(SettingsEnum.ELEVENLABS_TTS_SETTINGS) as ElevenLabsTTSSettings;
  }

  set elevenLabsTtsSettings(value: ElevenLabsTTSSettings) {
    this.set(SettingsEnum.ELEVENLABS_TTS_SETTINGS, value);
  }

  get vllmEndpoint(): string {
    return this.get(SettingsEnum.VLLM_ENDPOINT) as string;
  }

  set vllmEndpoint(value: string) {
    this.set(SettingsEnum.VLLM_ENDPOINT, value);
  }

  get setupWizardPage(): WizardPage {
    return this.get(SettingsEnum.SETUP_WIZARD_PAGE) as WizardPage;
  }

  set setupWizardPage(value: WizardPage) {
    this.set(SettingsEnum.SETUP_WIZARD_PAGE, value);
  }

  get patreonLinking(): boolean {
    return this.get(SettingsEnum.PATREON_LINKING) as boolean;
  }

  set patreonLinking(value: boolean) {
    this.set(SettingsEnum.PATREON_LINKING, value);
  }

  get vllmApiKey(): string | undefined {
    return stringOrUndefined(this.get(SettingsEnum.VLLM_APIKEY));
  }

  set vllmApiKey(value: string) {
    this.set(SettingsEnum.VLLM_APIKEY, value);
  }

  get aiApiType(): ApiType {
    const apiType = this.get(SettingsEnum.AI_API_TYPE);
    return ApiTypeFromValue(apiType);
  }

  set aiApiType(value: ApiType) {
    this.set(SettingsEnum.AI_API_TYPE, value.toString());
  }

  get vllmModel(): string | undefined {
    return stringOrUndefined(this.get(SettingsEnum.VLLM_MODEL));
  }

  set vllmModel(value: string) {
    this.set(SettingsEnum.VLLM_MODEL, value);
  }
}

function stringOrUndefined(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  return undefined;
}
