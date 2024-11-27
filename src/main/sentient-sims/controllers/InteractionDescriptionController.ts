import { Request, Response } from 'express';
import { InteractionService } from '../services/InteractionService';
import { InteractionDTO } from '../db/dto/InteractionDTO';

export class InteractionDescriptionController {
  private readonly interactionService: InteractionService;

  constructor(interactionService: InteractionService) {
    this.interactionService = interactionService;

    this.updateInteraction = this.updateInteraction.bind(this);
    this.getIgnoredInteractions = this.getIgnoredInteractions.bind(this);
  }

  async updateInteraction(req: Request, res: Response) {
    const interaction: InteractionDTO = req.body;
    await this.interactionService.updateUnmappedInteraction(interaction);
    res.json({ done: 'done' });
  }

  async getIgnoredInteractions(req: Request, res: Response) {
    res.json(await this.interactionService.getIgnoredInteractions());
  }
}
