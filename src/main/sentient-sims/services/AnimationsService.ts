/* eslint-disable class-methods-use-this */
import { Animation } from 'main/sentient-sims/models/Animation';
import log from 'electron-log';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';
import { fetchWithRetries } from '../util/fetchWithRetries';
import { ApiType } from '../models/ApiType';

export function getAnimationKey(
  animationAuthor: string,
  animationIdentifier: string
) {
  return `${animationAuthor}:${animationIdentifier}`;
}

export class AnimationsService {
  private settingsService: SettingsService;

  private animations?: Map<string, Animation>;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  async getAnimations() {
    const url = `${this.settingsService.get(
      SettingsEnum.SENTIENTSIMSAI_ENDPOINT
    )}/animations`;
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
    const url = `${this.settingsService.get(
      SettingsEnum.SENTIENTSIMSAI_ENDPOINT
    )}/animations`;
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

    const result = await response.json();

    this.animations = new Map(Object.entries(result));

    return result;
  }

  async getAnimation(animationAuthor: string, animationIdentifier: string) {
    const animationKey = getAnimationKey(animationAuthor, animationIdentifier);

    if (!this.animations) {
      this.animations = new Map(Object.entries(await this.getAnimations()));
    }

    return this.animations.get(animationKey);
  }

  isNsfwEnabled(): boolean {
    if (this.settingsService.get(SettingsEnum.AI_API_TYPE) !== ApiType.OpenAI) {
      return true;
    }

    return this.settingsService.get(SettingsEnum.NSFW_ENABLED) as boolean;
  }

  isAnimationMappingEnabled(): boolean {
    return this.settingsService.get(
      SettingsEnum.MAPPING_NOTIFICATION_ENABLED
    ) as boolean;
  }
}
