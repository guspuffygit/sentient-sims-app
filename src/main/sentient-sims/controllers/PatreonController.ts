import { Request, Response } from 'express';
import log from 'electron-log';
import { NotLoggedInError } from '../services/PatreonService';
import { notifyRefreshUserAttributes } from '../util/notifyRenderer';
import { getAllBrowserWindows } from '../util/browserWindows';
import { resolveHtmlPath } from '../../util';
import { ApiContext } from '../services/ApiContext';

export class PatreonController {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  handleRedirect = async (req: Request, res: Response) => {
    const { code } = req.query;

    res.sendFile(this.ctx.getAssetPath('redirect-complete.html'));

    try {
      log.debug('Handling patreon redirect');
      await this.ctx.patreon.handlePatreonRedirect(code as string);

      notifyRefreshUserAttributes();
    } catch (exception: any) {
      if (exception instanceof NotLoggedInError) {
        getAllBrowserWindows().forEach((wnd) => {
          if (!wnd.webContents.isDestroyed()) {
            void wnd.webContents.loadURL(resolveHtmlPath('index.html#/login'));
          }
        });
      }
    }
  };
}
