import { Animation } from 'main/sentient-sims/models/Animation';
import { ApiType } from '../models/ApiType';
import { axiosClient } from '../clients/AxiosClient';
import { ApiContext } from './ApiContext';

export function getAnimationKey(animationAuthor: string, animationIdentifier: string) {
  return `${animationAuthor}:${animationIdentifier}`;
}

export class AnimationsService {
  private ctx: ApiContext;

  private animations?: Map<string, Animation>;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  async getAnimations() {
    const response = await axiosClient({
      url: '/animations',
      baseURL: this.ctx.settings.sentientSimsAIEndpoint,
      headers: {
        Authentication: this.ctx.settings.accessToken,
      },
    });

    return response.data;
  }

  async setAnimation(animation: Animation) {
    const response = await axiosClient({
      url: '/animations',
      method: 'POST',
      data: animation,
      baseURL: this.ctx.settings.sentientSimsAIEndpoint,
      headers: {
        Authentication: this.ctx.settings.accessToken,
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
    if (this.ctx.settings.aiApiType !== ApiType.OpenAI) {
      return true;
    }

    return this.ctx.settings.nsfwEnabled;
  }

  isAnimationMappingEnabled(): boolean {
    return this.ctx.settings.mappingNotificationEnabled;
  }
}
