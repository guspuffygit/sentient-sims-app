import { Animation } from 'main/sentient-sims/models/Animation';
import { AIActionType } from '../models/AIActionType';
import { ApiType } from '../models/ApiType';
import { axiosClient } from '../clients/AxiosClient';
import { ApiContext } from './ApiContext';
import fs from 'fs';
import path from 'path';
import log from 'electron-log';

export function getAnimationKey(animationAuthor: string, animationIdentifier: string) {
  return `${animationAuthor}:${animationIdentifier}`;
}

export class AnimationsService {
  private ctx: ApiContext;
  private localAnimations?: Map<string, Animation>;
  private animations?: Map<string, Animation>;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
    this.loadLocalAnimations();
  }

  async getAnimations(): Promise<Map<string, Animation>> {
    if (this.animations) {
      return this.animations;
    }

    try {
      const response = await axiosClient<Record<string, Animation>>({
        url: '/animations',
        baseURL: this.ctx.settings.sentientSimsAIEndpoint,
        headers: {
          Authentication: this.ctx.settings.accessToken,
          ...this.ctx.version.getVersionHeaders(),
        },
      });

      this.animations = new Map(Object.entries(response.data));
    } catch (err) {
      log.error(`[AnimationService] Unable to fetch animations from API`, err);
      this.animations = new Map<string, Animation>();
    }

    return this.animations;
  }

  private loadLocalAnimations() {
    try {
      const sentientSimsFolder = this.ctx.directory.getSentientSimsFolder();
      const localMapPath = path.join(sentientSimsFolder, 'user_animation_overrides.json');

      if (fs.existsSync(localMapPath)) {
        const fileContent = fs.readFileSync(localMapPath, 'utf-8');
        const parsed = JSON.parse(fileContent) as Record<string, Animation>;
        this.localAnimations = new Map(Object.entries(parsed));
        log.info(`[Override] Local Animations-Overrides loaded Successfully.`);
      }
    } catch (err) {
      log.error('[Override] could not load local Animations-Overrides', err);
    }
  }

  saveLocalAnimation(animation: Animation) {
    if (!animation.author || !animation.id) {
      log.error(`[Override] Local Animation could not be saved: Author or ID be missing.`);
      return;
    }

    const animationKey = getAnimationKey(animation.author, animation.id);

    try {
      const sentientSimsFolder = this.ctx.directory.getSentientSimsFolder();
      const localMapPath = path.join(sentientSimsFolder, 'user_animation_overrides.json');

      let localOverrides: Record<string, Animation> = {};
      if (fs.existsSync(localMapPath)) {
        const fileContent = fs.readFileSync(localMapPath, 'utf-8');
        localOverrides = JSON.parse(fileContent) as Record<string, Animation>;
      }

      localOverrides[animationKey] = animation;

      this.localAnimations = new Map(Object.entries(localOverrides));

      fs.writeFileSync(localMapPath, JSON.stringify(localOverrides, null, 2));
      log.info(`[Override] Local animation '${animationKey}' saved.`);
    } catch (err) {
      log.error(`[Override] local animation could not be saved`, err);
    }
  }

  async setAnimation(animation: Animation): Promise<Record<string, Animation>> {
    const response = await axiosClient<Record<string, Animation>>({
      url: '/animations',
      method: 'POST',
      data: animation,
      baseURL: this.ctx.settings.sentientSimsAIEndpoint,
      headers: {
        Authentication: this.ctx.settings.accessToken,
        ...this.ctx.version.getVersionHeaders(),
      },
    });

    const result = response.data;

    this.animations = new Map(Object.entries(result));

    return result;
  }

  async deleteAnimation(animation: Animation): Promise<void> {
    await axiosClient({
      url: '/animations',
      method: 'DELETE',
      data: animation,
      baseURL: this.ctx.settings.sentientSimsAIEndpoint,
      headers: {
        Authentication: this.ctx.settings.accessToken,
        ...this.ctx.version.getVersionHeaders(),
      },
    });

    if (animation.author && animation.id) {
      this.animations?.delete(getAnimationKey(animation.author, animation.id));
    }
  }

  async getAnimation(animationAuthor: string, animationIdentifier: string) {
    const animationKey = getAnimationKey(animationAuthor, animationIdentifier);

    const localAnimation = this.localAnimations?.get(animationKey);
    if (localAnimation) {
      log.debug(`[Override] Load '${animationKey}' from user_animation_overrides.json`);
      return localAnimation;
    }

    const animationsMap = await this.getAnimations();

    log.debug(`[Online] Load '${animationKey}' from Sentient Sims API`);
    return animationsMap.get(animationKey);
  }

  isNsfwEnabled(): boolean {
    // OpenAI censors nsfw content, gate only applies to the provider that
    // actually handles Wicked Whims generations
    const wickedWhimsApiType = this.ctx.providerConfigs.getConfigForAction(AIActionType.WICKED_WHIMS).apiType;
    if (wickedWhimsApiType !== ApiType.OpenAI) {
      return true;
    }

    return this.ctx.settings.nsfwEnabled;
  }

  isAnimationMappingEnabled(): boolean {
    return this.ctx.settings.mappingNotificationEnabled;
  }
}
