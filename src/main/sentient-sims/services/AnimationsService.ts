import { Animation } from 'main/sentient-sims/models/Animation';
import log from 'electron-log';
import { SettingsService } from './SettingsService';
import { sentientSimsAIHost } from '../constants';
import { SettingsEnum } from '../models/SettingsEnum';
import { fetchWithRetries } from '../util/fetchWithRetries';

export class AnimationsService {
  private settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  async getAnimations() {
    const url = `${sentientSimsAIHost}/animations`;
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    log.debug(`url: ${url}, auth: ${authHeader}`);
    const response = await fetchWithRetries(url, {
      headers: {
        'Content-Type': 'application/json',
        Authentication: authHeader,
      },
    });

    return response.json();
  }

  async setAnimation(animation: Animation) {
    const url = `${sentientSimsAIHost}/animations`;
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    log.debug(`url: ${url}, auth: ${authHeader}`);
    const response = await fetchWithRetries(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authentication: authHeader,
      },
      body: JSON.stringify(animation),
    });

    return response.json();
  }

  async isNsfwEnabled() {
    if (this.settingsService.get(SettingsEnum.CUSTOM_LLM_ENABLED)) {
      return true;
    }

    return this.settingsService.get(SettingsEnum.NSFW_ENABLED);
  }
}
