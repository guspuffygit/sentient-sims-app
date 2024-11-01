/* eslint-disable class-methods-use-this */
import * as fs from 'fs';
import log from 'electron-log';
import { app } from 'electron';
import { DirectoryService } from './DirectoryService';
import { removeNonPrintableCharacters } from '../util/filter';

export type Version = {
  version: string;
  error?: string;
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
    return { version: 'none', error: 'NOT INSTALLED' };
  }

  getModVersion(): Version {
    const modVersionFile = this.directoryService.getModVersionFile();
    return this.getVersion(modVersionFile);
  }

  getAppVerson(): Version {
    return { version: app.getVersion() };
  }

  getGameVersion(): Version {
    try {
      const versionText = fs.readFileSync(
        this.directoryService.getGameVersion(),
        'utf-8'
      );

      return { version: removeNonPrintableCharacters(versionText).trim() };
    } catch (e: any) {
      return {
        version: 'none',
        error: `Unable to get GameVersion.txt, do you have the correct Mods directory selected?\n${e?.message}`,
      };
    }
  }
}
