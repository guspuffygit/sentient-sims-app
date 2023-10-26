import { Request, Response } from 'express';
import { Animation } from 'main/sentient-sims/models/Animation';
import { AnimationsService } from '../services/AnimationsService';

export class AnimationsController {
  private readonly animationsService: AnimationsService;

  constructor(animationsService: AnimationsService) {
    this.animationsService = animationsService;

    this.getAnimations = this.getAnimations.bind(this);
    this.setAnimation = this.setAnimation.bind(this);
  }

  async getAnimations(req: Request, res: Response) {
    res.json(await this.animationsService.getAnimations());
  }

  async setAnimation(req: Request, res: Response) {
    const animation: Animation = req.body;
    await this.animationsService.setAnimation(animation);
    res.json({ text: 'done' });
  }
}
