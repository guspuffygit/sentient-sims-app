import { Request, Response } from 'express';
import log from 'electron-log';
import { sendPopUpNotification } from '../util/notifyRenderer';
import { isGameRunning } from '../util/gameProcess';
import { ApiContext } from '../services/ApiContext';
import { ModUpdate } from '../services/UpdateService';

export type UpdateModResponse = {
  done?: 'done';
  skipped?: 'game-running';
  error?: {
    stack?: string;
    message?: string;
  };
};

export class UpdateController {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  updateMod = async (req: Request, res: Response) => {
    const modUpdate = req.body as ModUpdate;
    try {
      log.info(`Starting ${modUpdate.auto ? 'auto ' : ''}update.`);

      // Installing over the game's locked .package files fails partway and
      // leaves the mod folder inconsistent, so refuse up front
      if (await isGameRunning()) {
        if (modUpdate.auto) {
          log.info('Skipping mod auto-update, The Sims 4 is running.');
          const response: UpdateModResponse = { skipped: 'game-running' };
          res.json(response);
          return;
        }
        throw new Error('Close The Sims 4 before updating the mod.');
      }

      // expiration needs to be a Date object and not a string
      const credentials = {
        ...modUpdate.credentials,
        expiration: new Date(modUpdate.credentials.expiration as string | number | Date),
      };
      await this.ctx.update.updateMod({ ...modUpdate, credentials });
      const response: UpdateModResponse = { done: 'done' };
      res.json(response);
    } catch (err) {
      const stack = err instanceof Error ? err.stack : undefined;
      const message = err instanceof Error ? err.message : String(err);
      const response: UpdateModResponse = {
        error: {
          stack,
          message,
        },
      };
      log.error(`Error updating:`, err);
      // The startup auto-update retries on the next launch; only bother the
      // user with a popup when they clicked the button themselves
      if (!modUpdate.auto) {
        sendPopUpNotification(message);
      }
      res.status(200).json(response);
    }
  };
}
