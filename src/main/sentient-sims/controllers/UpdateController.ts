import { Request, Response } from 'express';
import log from 'electron-log';
import { sendPopUpNotification } from '../util/notifyRenderer';
import { ApiContext } from '../services/ApiContext';
import { ModUpdate } from '../services/UpdateService';

export type UpdateModResponse = {
  done?: 'done';
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
    try {
      log.info('Starting update.');
      const modUpdate = req.body as ModUpdate;
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
      sendPopUpNotification(message);
      res.status(200).json(response);
    }
  };
}
