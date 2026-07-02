import { axiosClient } from '../clients/AxiosClient';
import { AllModelSettings, ModelSettings, ModelSettingsType } from '../modelSettings';
import log from 'electron-log';
import { ApiContext } from './ApiContext';
import { ApiType } from '../models/ApiType';

const CACHE_DURATION_MS = 15 * 60 * 1000;

export class ModelSettingsService {
  private readonly ctx: ApiContext;

  private modelSettings: ModelSettingsType = AllModelSettings;

  private lastSyncTimestamp: number | undefined;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  async syncModelSettings(): Promise<ModelSettingsType> {
    try {
      const response = await axiosClient<ModelSettingsType>({
        url: '/modelsettings',
        baseURL: this.ctx.settings.sentientSimsAIEndpoint,
        headers: {
          ...this.ctx.version.getVersionHeaders(),
        },
      });

      this.modelSettings = response.data;

      this.lastSyncTimestamp = Date.now();

      log.debug(`Model Settings synced`);
      return this.modelSettings;
    } catch (error) {
      log.error('Failed to sync model settings:', error);
      throw error;
    }
  }

  async getModelSettings(model?: string, apiType?: ApiType): Promise<ModelSettings> {
    const effectiveApiType = apiType ?? this.ctx.providerConfigs.getDefaultConfig().apiType;

    // Only the Sentient Sims AI endpoint serves remote model settings
    if (effectiveApiType === ApiType.SentientSimsAI) {
      const isCacheStale = !this.lastSyncTimestamp || Date.now() - this.lastSyncTimestamp > CACHE_DURATION_MS;

      if (isCacheStale) {
        log.info('Model settings cache is stale or empty. Syncing now...');
        await this.syncModelSettings();
      }
    }

    const effectiveModel = model ?? this.ctx.aiModel;

    if (effectiveModel && effectiveModel in this.modelSettings) {
      return this.modelSettings[effectiveModel];
    }

    return AllModelSettings.default;
  }
}
