import { Animation } from 'main/sentient-sims/models/Animation';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';
import { ApiType } from '../models/ApiType';
import { axiosClient } from '../clients/AxiosClient';

export function getAnimationKey(animationAuthor: string, animationIdentifier: string) {
  return `${animationAuthor}:${animationIdentifier}`;
}

export class AnimationsService {
  private settingsService: SettingsService;

  private animations?: Map<string, Animation>;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  async getAnimations() {
    const response = await axiosClient({
      url: '/animations',
      baseURL: `${this.settingsService.get(SettingsEnum.SENTIENTSIMSAI_ENDPOINT)}`,
      headers: {
        Authentication: `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`,
      },
    });

    return response.data;
  }

  async setAnimation(animation: Animation) {
    const response = await axiosClient({
      url: '/animations',
      method: 'POST',
      data: animation,
      baseURL: `${this.settingsService.get(SettingsEnum.SENTIENTSIMSAI_ENDPOINT)}`,
      headers: {
        Authentication: `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`,
      },
    });

    const result = response.data;

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
    return this.settingsService.get(SettingsEnum.MAPPING_NOTIFICATION_ENABLED) as boolean;
  }
}
