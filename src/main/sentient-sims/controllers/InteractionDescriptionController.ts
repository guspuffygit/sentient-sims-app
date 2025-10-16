import { Request, Response } from 'express';
import { InteractionDTO } from '../db/dto/InteractionDTO';
import { ApiContext } from '../services/ApiContext';

export class InteractionDescriptionController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    this.updateInteraction = this.updateInteraction.bind(this);
    this.getIgnoredInteractions = this.getIgnoredInteractions.bind(this);
  }

  async updateInteraction(req: Request, res: Response) {
    const interaction: InteractionDTO = req.body;
    await this.ctx.interactionService.updateUnmappedInteraction(interaction);
    res.json({ done: 'done' });
  }

  async getIgnoredInteractions(req: Request, res: Response) {
    res.json(await this.ctx.interactionService.getIgnoredInteractions());
  }
}
