import { Request, Response } from 'express';
import { InteractionDTO, BasicInteraction } from '../db/dto/InteractionDTO';
import { ApiContext } from '../services/ApiContext';
import log from 'electron-log';

export class InteractionDescriptionController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  updateInteraction = async (req: Request, res: Response) => {
    try {
      const interaction = req.body as InteractionDTO;
      await this.ctx.interactions.updateUnmappedInteraction(interaction);
      res.json({ done: 'done' });
    } catch (err) {
      log.error('[Controller] Error saving interaction online:', err);
      res.status(500).json({ error: 'Failed to save interaction online.' });
    }
  };

  deleteInteraction = async (req: Request, res: Response) => {
    try {
      const interaction = req.body as BasicInteraction;
      await this.ctx.interactionRepository.deleteInteraction(interaction);
      res.json({ text: 'done' });
    } catch (err) {
      log.error('[Controller] Error deleting interaction:', err);
      res.status(500).json({ error: 'Failed to delete interaction.' });
    }
  };

  getIgnoredInteractions = async (req: Request, res: Response) => {
    res.json(await this.ctx.interactions.getIgnoredInteractions());
  };

  saveInteractionLocally = (req: Request, res: Response) => {
    try {
      const interaction = req.body as BasicInteraction;
      this.ctx.interactionRepository.saveLocalInteraction(interaction);
      res.json({ status: 'success', message: 'Interaction saved locally.' });
    } catch (err) {
      log.error('[Controller] Error saving interaction locally:', err);
      res.status(500).json({ error: 'Failed to save interaction locally.' });
    }
  };

  deleteLocalInteraction = (req: Request, res: Response) => {
    try {
      const interaction = req.body as BasicInteraction;
      this.ctx.interactionRepository.deleteLocalInteraction(interaction.name);
      res.json({ status: 'success', message: 'Local interaction override deleted.' });
    } catch (err) {
      log.error('[Controller] Error deleting local interaction override:', err);
      res.status(500).json({ error: 'Failed to delete local interaction override.' });
    }
  };

  getAllInteractions = async (req: Request, res: Response) => {
    try {
      const interactions = await this.ctx.interactionRepository.getBrowsableInteractions();

      res.json(Object.fromEntries(interactions));
    } catch (err) {
      log.error('[Controller] Error getting all interactions:', err);
      res.status(500).json({ error: 'Failed to get interactions.' });
    }
  };
}
