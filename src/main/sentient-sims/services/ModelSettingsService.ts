import { axiosClient } from '../clients/AxiosClient';
import { AllModelSettings, ModelSettings, ModelSettingsType } from '../modelSettings';
import { app } from 'electron';
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
    if (this.ctx.settings.aiApiType !== ApiType.SentientSimsAI) {
      return this.modelSettings;
    }

    try {
      const response = await axiosClient<ModelSettingsType>({
        url: '/modelsettings',
        baseURL: this.ctx.settings.sentientSimsAIEndpoint,
        headers: {
          'X-Sentient-Sims-App-Version': app.getVersion(),
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

  async getModelSettings(): Promise<ModelSettings> {
    const isCacheStale = !this.lastSyncTimestamp || Date.now() - this.lastSyncTimestamp > CACHE_DURATION_MS;

    if (isCacheStale) {
      log.info('Model settings cache is stale or empty. Syncing now...');
      await this.syncModelSettings();
    }

    const model = this.ctx.aiModel;

    if (model && model in this.modelSettings) {
      return this.modelSettings[model];
    }

    return AllModelSettings.default;
  }
}
