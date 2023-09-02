/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import log from 'electron-log';
import { UpdateService } from '../services/UpdateService';
import { sendPopUpNotification } from '../util/popupNotification';

export class UpdateController {
  private updateService: UpdateService;

  constructor(updateService: UpdateService) {
    this.updateService = updateService;

    // Bind the method to the current instance in the constructor
    this.updateMod = this.updateMod.bind(this);
  }

  async updateMod(req: Request, res: Response) {
    try {
      log.info('Starting update.');
      await this.updateService.updateMod(req.body);
      res.json({ done: 'done' });
    } catch (err: any) {
      const response = {
        error: {
          stack: err?.stack,
          message: err?.message,
        },
      };
      log.error(`Error updating: ${response}`);
      sendPopUpNotification(err?.message);
      res.status(500).json(response);
    }
  }
}
