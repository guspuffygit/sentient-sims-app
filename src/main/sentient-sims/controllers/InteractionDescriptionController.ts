import { Request, Response } from 'express';
import { InteractionDTO, BasicInteraction } from '../db/dto/InteractionDTO';
import { ApiContext } from '../services/ApiContext';
import { InteractionService } from '../services/InteractionService';
import log from 'electron-log';

export class InteractionDescriptionController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  updateInteraction = async (req: Request, res: Response) => {
    const interaction = req.body as InteractionDTO & { force?: boolean };
    try {
      await this.ctx.interactions.updateUnmappedInteraction(interaction, interaction.force === true);
      res.json({ done: 'done' });
    } catch (err) {
      // Not an error the caller should retry: it is text from this save on its way to
      // everyone. 422 carries the words back so the browser can name them and offer to
      // publish anyway.
      if (err instanceof Error && err.message === InteractionService.NAMES_FROM_SAVE) {
        res.status(422).json({
          error: InteractionService.NAMES_FROM_SAVE,
          names: this.ctx.interactions.namesFromSaveIn(interaction.action),
        });
        return;
      }
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

  semanticSearchInteractions = async (req: Request, res: Response) => {
    try {
      const query = typeof req.query.q === 'string' ? req.query.q : '';
      res.json(await this.ctx.interactionSemanticSearch.search(query));
    } catch (err) {
      log.error('[Controller] Error semantically searching interactions:', err);
      res.status(500).json({ error: 'Failed to search interactions.' });
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
