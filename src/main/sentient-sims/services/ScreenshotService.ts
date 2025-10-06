import * as fs from 'fs';
import path from 'path';
import { Stats } from 'fs';
import log from 'electron-log';
import { DirectoryService } from './DirectoryService';
import { Screenshot } from '../models/ListScreenshotsResponse';

export class ScreenshotService {
  private directoryService: DirectoryService;

  private cachedScreenshots: Map<string, Stats> = new Map();

  constructor(directoryService: DirectoryService) {
    this.directoryService = directoryService;
  }

  async listRecentScreenshots(): Promise<Screenshot[]> {
    const screenshotsFolder = this.directoryService.getScreenshotsFolder();
    const files = await fs.promises.readdir(this.directoryService.getScreenshotsFolder(), { withFileTypes: true });

    files.forEach((file) => {
      log.info(file);
    });

    const newCachedScreenshots = await Promise.all(
      files
        .filter((file) => !file.isDirectory() && file.name.endsWith('.png'))
        .map(async (file) => {
          const filePath = path.join(screenshotsFolder, file.name);
          if (this.cachedScreenshots.has(filePath)) {
            return {
              key: filePath,
              data: this.cachedScreenshots.get(filePath) as Stats,
            };
          }
          const stats = await fs.promises.stat(filePath);
          return { key: filePath, data: stats };
        }),
    );

    this.cachedScreenshots = new Map();
    newCachedScreenshots.forEach((screenshot) => {
      this.cachedScreenshots.set(screenshot.key, screenshot.data);
    });

    return Array.from(this.cachedScreenshots.entries())
      .sort((a, b) => b[1].mtimeMs - a[1].mtimeMs)
      .slice(0, 100)
      .map(([key, data]) => {
        return { name: path.basename(key), stats: data };
      });
  }

  async getScreenshot(filename: string) {
    return fs.promises.readFile(path.join(this.directoryService.getScreenshotsFolder(), filename));
  }
}
