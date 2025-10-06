import { Request, Response } from 'express';
import log from 'electron-log';
import { notifyGoogleAuthComplete } from '../util/notifyRenderer';

export class LoginController {
  private readonly getAssetPath: (...paths: string[]) => string;

  constructor(getAssetPath: (...paths: string[]) => string) {
    this.getAssetPath = getAssetPath;

    this.handleRedirect = this.handleRedirect.bind(this);
  }

  async handleRedirect(req: Request, res: Response) {
    const { code, state } = req.query;

    log.debug(`/login/callback initiated for url: ${req.url}`);

    res.sendFile(this.getAssetPath('redirect-complete.html'));

    if (typeof code === 'string' && typeof state === 'string') {
      notifyGoogleAuthComplete(code, state);
    } else {
      log.error(`Invalid auth callback code: ${code} state: ${state}`);
    }
  }
}
