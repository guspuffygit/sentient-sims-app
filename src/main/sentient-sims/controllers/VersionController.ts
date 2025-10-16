import { Request, Response } from 'express';
import log from 'electron-log';
import { sendPopUpNotification } from '../util/notifyRenderer';
import { ApiContext } from '../services/ApiContext';

export function modOutOfDate(req: Request, res: Response) {
  try {
    log.error(`Mod using out of date endpoint: ${req.method} ${req.path}`);
    const errorMessage = 'Mod out of date! Close the game and update the mod in the app.';

    sendPopUpNotification(errorMessage);
    return res.json({
      error: errorMessage,
    });
  } catch (err: any) {
    return res.json({ error: err.message });
  }
}

export class VersionController {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    this.getModVersion = this.getModVersion.bind(this);
    this.getAppVersion = this.getAppVersion.bind(this);
    this.getGameVersion = this.getGameVersion.bind(this);
  }

  getModVersion(req: Request, res: Response) {
    res.json(this.ctx.version.getModVersion());
  }

  getAppVersion(req: Request, res: Response) {
    res.json(this.ctx.version.getAppVerson());
  }

  getGameVersion(req: Request, res: Response) {
    res.json(this.ctx.version.getGameVersion());
  }
}
