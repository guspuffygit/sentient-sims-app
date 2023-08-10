/* eslint-disable class-methods-use-this */
import * as fs from 'fs';
import log from 'electron-log';
import { app } from 'electron';
import { DirectoryService } from './DirectoryService';

export type Version = {
  version: string;
};

export class VersionService {
  private directoryService: DirectoryService;

  constructor(directoryService: DirectoryService) {
    this.directoryService = directoryService;
  }

  getVersion(path: string): Version {
    if (fs.existsSync(path)) {
      log.log(`Version file exists at path: ${path}`);
      const parsedVersion = JSON.parse(
        fs.readFileSync(path, { encoding: 'utf-8' })
      );
      log.log(parsedVersion);
      return parsedVersion;
    }

    log.log(`Version file does not exist at path: ${path}`);
    return { version: 'none' };
  }

  getModVersion(): Version {
    const modVersionFile = this.directoryService.getModVersionFile();
    return this.getVersion(modVersionFile);
  }

  getAppVerson(): Version {
    return { version: app.getVersion() };
  }
}
