import { Request, Response } from 'express';
import { Animation } from 'main/sentient-sims/models/Animation';
import { ApiContext } from '../services/ApiContext';

export class AnimationsController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    this.getAnimations = this.getAnimations.bind(this);
    this.setAnimation = this.setAnimation.bind(this);
    this.isNsfwEnabled = this.isNsfwEnabled.bind(this);
  }

  async getAnimations(req: Request, res: Response) {
    res.json(await this.ctx.animations.getAnimations());
  }

  async setAnimation(req: Request, res: Response) {
    const animation: Animation = req.body;
    await this.ctx.animations.setAnimation(animation);
    res.json({ text: 'done' });
  }

  async isNsfwEnabled(req: Request, res: Response) {
    res.json({ value: this.ctx.animations.isNsfwEnabled() });
  }
}
