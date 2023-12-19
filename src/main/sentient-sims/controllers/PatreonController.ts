import { Request, Response } from 'express';
import electron from 'electron';
import { NotLoggedInError, PatreonService } from '../services/PatreonService';
import { resolveHtmlPath } from '../../util';

export class PatreonController {
  private patreonService: PatreonService;

  constructor(patreonService: PatreonService) {
    this.patreonService = patreonService;

    this.handleRedirect = this.handleRedirect.bind(this);
  }

  async handleRedirect(req: Request, res: Response) {
    const { code } = req.query;

    try {
      await this.patreonService.handlePatreonRedirect(code as string);
      res.redirect('https://www.patreon.com/SentientSims');
      electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
        if (wnd.webContents?.isDestroyed() === false) {
          wnd.webContents.loadURL(resolveHtmlPath('index.html'));
        }
      });
    } catch (exception: any) {
      if (exception instanceof NotLoggedInError) {
        electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
          if (wnd.webContents?.isDestroyed() === false) {
            wnd.webContents.loadURL(resolveHtmlPath('index.html#/login'));
          }
        });
        return;
      }

      res.send(exception.message);
    }
  }
}
