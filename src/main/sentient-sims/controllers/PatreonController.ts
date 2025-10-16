import { Request, Response } from 'express';
import electron from 'electron';
import log from 'electron-log';
import { NotLoggedInError } from '../services/PatreonService';
import { notifyRefreshUserAttributes } from '../util/notifyRenderer';
import { resolveHtmlPath } from '../../util';
import { ApiContext } from '../services/ApiContext';

export class PatreonController {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    this.handleRedirect = this.handleRedirect.bind(this);
  }

  async handleRedirect(req: Request, res: Response) {
    const { code } = req.query;

    res.sendFile(this.ctx.getAssetPath('redirect-complete.html'));

    try {
      log.debug('Handling patreon redirect');
      await this.ctx.patreonService.handlePatreonRedirect(code as string);

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
