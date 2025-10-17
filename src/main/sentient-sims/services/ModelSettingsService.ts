import { axiosClient } from '../clients/AxiosClient';
import { AllModelSettings, ModelSettings, ModelSettingsType } from '../modelSettings';
import { app } from 'electron';
import log from 'electron-log';
import { ApiContext } from './ApiContext';

export class ModelSettingsService {
  private ctx: ApiContext;

  private modelSettings: ModelSettingsType = AllModelSettings;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  async syncModelSettings(): Promise<ModelSettingsType> {
    const response = await axiosClient<ModelSettingsType>({
      url: '/modelsettings',
      baseURL: this.ctx.settings.sentientSimsAIEndpoint,
      headers: {
        'Authentication': this.ctx.settings.accessToken,
        'X-Sentient-Sims-App-Version': app.getVersion(),
      },
    });

    this.modelSettings = response.data;
    log.debug(`Model Settings: ${JSON.stringify(this.modelSettings, null, 2)}`);
    return this.modelSettings;
  }

  async getModelSettings(model: string): Promise<ModelSettings> {
    if (model in this.modelSettings) {
      return this.modelSettings[model];
    }

    return AllModelSettings.default;
  }
}
