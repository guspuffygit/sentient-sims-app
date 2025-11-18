import { Request, Response } from 'express';
import { Animation } from 'main/sentient-sims/models/Animation';
import { ApiContext } from '../services/ApiContext';
import log from 'electron-log';

export class AnimationsController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    this.getAnimations = this.getAnimations.bind(this);
    this.setAnimation = this.setAnimation.bind(this);
    this.isNsfwEnabled = this.isNsfwEnabled.bind(this);
    this.saveAnimationLocally = this.saveAnimationLocally.bind(this);
    this.getOnlineAnimations = this.getOnlineAnimations.bind(this);
  }

  async getAnimations(req: Request, res: Response) {
    res.json(await this.ctx.animations.getAnimations());
  }

  async setAnimation(req: Request, res: Response) {
    const animation: Animation = req.body;
    await this.ctx.animations.setAnimation(animation);
    res.json({ text: 'done' });
  }

  async saveAnimationLocally(req: Request, res: Response) {
    try {
      const animation: Animation = req.body;
      await this.ctx.animations.saveLocalAnimation(animation);
      res.json({ status: 'success', message: 'Animation saved locally.' });
    } catch (err) {
      log.error('[Controller] Error saving animation locally:', err);
      res.status(500).json({ error: 'Failed to save animation locally.' });
    }
  }

  async getOnlineAnimations(req: Request, res: Response) {
    try {
      const animations = await this.ctx.animations.getAnimations();
      res.json(Object.fromEntries(animations));
    } catch (err) {
      log.error('[Controller] Error getting all animations:', err);
      res.status(500).json({ error: 'Failed to get animations.' });
    }
  }

  async isNsfwEnabled(req: Request, res: Response) {
    res.json({ value: this.ctx.animations.isNsfwEnabled() });
  }
}
