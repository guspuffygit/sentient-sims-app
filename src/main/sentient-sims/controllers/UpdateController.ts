import * as fs from 'fs';
import { Request, Response } from 'express';
import log from 'electron-log';
import { sendPopUpNotification } from '../util/notifyRenderer';
import { isGameRunning } from '../util/gameProcess';
import { ApiContext } from '../services/ApiContext';
import { ModUpdate } from '../services/UpdateService';

export type UpdateModResponse = {
  done?: 'done';
  skipped?: 'game-running' | 'dev-mod';
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

      // A mod built from the repo (the app running from source, or a Scripts folder in the
      // mod folder) must not be replaced by a release behind the developer's back; the
      // Update and Reinstall buttons still install one on request
      if (modUpdate.auto) {
        const devModReason = this.devModReason();
        if (devModReason) {
          log.info(`Skipping mod auto-update, ${devModReason}.`);
          const response: UpdateModResponse = { skipped: 'dev-mod' };
          res.json(response);
          return;
        }
      }

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

  private devModReason(): string | undefined {
    if (this.ctx.devBuild) {
      return 'the app is running from source';
    }
    const scriptsFolder = this.ctx.directory.getSentientSimsScriptsFolder();
    if (fs.existsSync(scriptsFolder)) {
      return `${scriptsFolder} exists`;
    }
    return undefined;
  }
}
