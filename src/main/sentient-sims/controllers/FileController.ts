import { Request, Response } from 'express';
import { LastExceptionService } from '../services/LastExceptionService';
import { ScreenshotService } from '../services/ScreenshotService';
import { ListScreenshotsResponse } from '../models/ListScreenshotsResponse';

export class FileController {
  private lastExceptionService: LastExceptionService;

  private screenshotService: ScreenshotService;

  constructor(
    lastExceptionService: LastExceptionService,
    screenshotService: ScreenshotService
  ) {
    this.lastExceptionService = lastExceptionService;
    this.screenshotService = screenshotService;

    // Bind the methods to the current instance in the constructor
    this.getLastExceptionFiles = this.getLastExceptionFiles.bind(this);
    this.deleteLastExceptionFiles = this.deleteLastExceptionFiles.bind(this);
    this.listRecentScreenshots = this.listRecentScreenshots.bind(this);
    this.getScreenshot = this.getScreenshot.bind(this);
  }

  async getLastExceptionFiles(req: Request, res: Response) {
    res.json(this.lastExceptionService.getParsedLastExceptionFiles());
  }

  async deleteLastExceptionFiles(req: Request, res: Response) {
    await this.lastExceptionService.deleteLastExceptionFiles();
    res.json({ done: 'done' });
  }

  async listRecentScreenshots(req: Request, res: Response) {
    const screenshots = await this.screenshotService.listRecentScreenshots();
    const response: ListScreenshotsResponse = {
      data: screenshots,
    };
    res.send(JSON.stringify(response));
  }

  async getScreenshot(req: Request, res: Response) {
    const { filename } = req.params;
    res.setHeader('Content-Type', 'image/png');
    res.send(await this.screenshotService.getScreenshot(filename));
  }
}
