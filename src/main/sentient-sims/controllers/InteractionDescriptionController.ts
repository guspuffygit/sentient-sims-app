import { Request, Response } from 'express';
import { InteractionService } from '../services/InteractionService';
import { InteractionDTO } from '../db/dto/InteractionDTO';

export class InteractionDescriptionController {
  private readonly interactionService: InteractionService;

  constructor(interactionService: InteractionService) {
    this.interactionService = interactionService;

    this.getInteractionDescriptions =
      this.getInteractionDescriptions.bind(this);
    this.updateInteraction = this.updateInteraction.bind(this);
    this.getModifiedInteractions = this.getModifiedInteractions.bind(this);
    this.deleteInteraction = this.deleteInteraction.bind(this);
    this.getIgnoredInteractions = this.getIgnoredInteractions.bind(this);
  }

  async getInteractionDescriptions(req: Request, res: Response) {
    res.json(this.interactionService.getUnmappedDescriptions());
  }

  async getModifiedInteractions(req: Request, res: Response) {
    res.send(this.interactionService.getJsonBlock());
  }

  async updateInteraction(req: Request, res: Response) {
    const interaction: InteractionDTO = req.body;
    this.interactionService.updateUnmappedInteraction(interaction);
    res.json({ done: 'done' });
  }

  async deleteInteraction(req: Request, res: Response) {
    const { name } = req.params;
    this.interactionService.deleteInteraction(name);
    res.json({ done: 'done' });
  }

  async getIgnoredInteractions(req: Request, res: Response) {
    res.json(this.interactionService.getIgnoredInteractions());
  }
}
