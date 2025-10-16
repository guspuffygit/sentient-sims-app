import { Request, Response } from 'express';
import log from 'electron-log';
import { sendPopUpNotification } from '../util/notifyRenderer';
import { ApiContext } from '../services/ApiContext';

export class UpdateController {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    // Bind the method to the current instance in the constructor
    this.updateMod = this.updateMod.bind(this);
  }

  async updateMod(req: Request, res: Response) {
    try {
      log.info('Starting update.');
      // expiration needs to be a Date object and not a string
      req.body.credentials.expiration = new Date(req.body.credentials.expiration);
      await this.ctx.updateService.updateMod(req.body);
      res.json({ done: 'done' });
    } catch (err: any) {
      const response = {
        error: {
          stack: err?.stack,
          message: err?.message,
        },
      };
      log.error(`Error updating:`, err);
      sendPopUpNotification(err?.message);
      res.status(500).json(response);
    }
  }
}
