import { Request, Response } from 'express';
import electron from 'electron';
import log from 'electron-log';
import { NotLoggedInError, PatreonService } from '../services/PatreonService';
import { notifyRefreshUserAttributes } from '../util/notifyRenderer';
import { resolveHtmlPath } from '../../util';

export class PatreonController {
  private patreonService: PatreonService;

  private readonly getAssetPath: (...paths: string[]) => string;

  constructor(patreonService: PatreonService, getAssetPath: (...paths: string[]) => string) {
    this.patreonService = patreonService;
    this.getAssetPath = getAssetPath;

    this.handleRedirect = this.handleRedirect.bind(this);
  }

  async handleRedirect(req: Request, res: Response) {
    const { code } = req.query;

    res.sendFile(this.getAssetPath('redirect-complete.html'));

    try {
      log.debug('Handling patreon redirect');
      await this.patreonService.handlePatreonRedirect(code as string);

      notifyRefreshUserAttributes();
    } catch (exception: any) {
      if (exception instanceof NotLoggedInError) {
        electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
          if (wnd.webContents?.isDestroyed() === false) {
            wnd.webContents.loadURL(resolveHtmlPath('index.html#/login'));
          }
        });
      }
    }
  }
}
