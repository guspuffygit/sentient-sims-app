import { Request, Response } from 'express';
import { InteractionDTO } from '../db/dto/InteractionDTO';
import { ApiContext } from '../services/ApiContext';
import log from 'electron-log';

export class InteractionDescriptionController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    this.updateInteraction = this.updateInteraction.bind(this);
    this.getIgnoredInteractions = this.getIgnoredInteractions.bind(this);
    this.saveInteractionLocally = this.saveInteractionLocally.bind(this);
    this.getOnlineInteractions = this.getOnlineInteractions.bind(this);
  }

  async updateInteraction(req: Request, res: Response) {
    const interaction: InteractionDTO = req.body;
    await this.ctx.interactions.updateUnmappedInteraction(interaction);
    res.json({ done: 'done' });
  }

  async getIgnoredInteractions(req: Request, res: Response) {
    res.json(await this.ctx.interactions.getIgnoredInteractions());
  }

  async saveInteractionLocally(req: Request, res: Response) {
    try {
      const interaction: InteractionDTO = req.body;
      await this.ctx.interactionRepository.saveLocalInteraction(interaction);
      res.json({ status: 'success', message: 'Interaction saved locally.' });
    } catch (err) {
      log.error('[Controller] Error saving interaction locally:', err);
      res.status(500).json({ error: 'Failed to save interaction locally.' });
    }
  }

  async getOnlineInteractions(req: Request, res: Response) {
    try {
      const interactions = await this.ctx.interactionRepository.getInteractions();

      res.json(Object.fromEntries(interactions));
    } catch (err) {
      log.error('[Controller] Error getting all interactions:', err);
      res.status(500).json({ error: 'Failed to get interactions.' });
    }
  }
}
