import { Request, Response } from 'express';
import { BrowserWindow } from 'electron';
import { NotLoggedInError, PatreonService } from '../services/PatreonService';
import { resolveHtmlPath } from '../../util';

export class PatreonController {
  private patreonService: PatreonService;

  private mainWindow: BrowserWindow;

  constructor(patreonService: PatreonService, mainWindow: BrowserWindow) {
    this.patreonService = patreonService;
    this.mainWindow = mainWindow;

    this.handleRedirect = this.handleRedirect.bind(this);
  }

  async handleRedirect(req: Request, res: Response) {
    const { code } = req.query;

    try {
      await this.patreonService.handlePatreonRedirect(code as string);
      res.redirect('https://www.patreon.com/SentientSims');
      return this.mainWindow.webContents.loadURL(resolveHtmlPath('index.html'));
    } catch (exception: any) {
      if (exception instanceof NotLoggedInError) {
        return this.mainWindow.webContents.loadURL(
          resolveHtmlPath('index.html#/login')
        );
      }

      return res.send(exception.message);
    }
  }
}
