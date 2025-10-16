import * as fs from 'fs';
import log from 'electron-log';
import { app } from 'electron';
import { filterNullAndUndefined, removeNonPrintableCharacters } from '../util/filter';
import { ApiContext } from './ApiContext';

export type Version = {
  version: string;
  error?: string;
};

export class VersionService {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  getVersion(path: string): Version {
    if (fs.existsSync(path)) {
      log.log(`Version file exists at path: ${path}`);
      const parsedVersion = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
      log.log(parsedVersion);
      return parsedVersion;
    }

    log.log(`Version file does not exist at path: ${path}`);
    return { version: 'none', error: 'NOT INSTALLED' };
  }

  getModVersion(): Version {
    const modVersionFile = this.ctx.directory.getModVersionFile();
    return this.getVersion(modVersionFile);
  }

  getAppVerson(): Version {
    return { version: app.getVersion() };
  }

  getGameVersion(): Version {
    try {
      const versionText = fs.readFileSync(this.ctx.directory.getGameVersion(), 'utf-8');

      return { version: removeNonPrintableCharacters(versionText).trim() };
    } catch (e: any) {
      return {
        version: 'none',
        error: filterNullAndUndefined([
          `Unable to get GameVersion.txt, do you have the correct Mods directory selected?`,
          'The directory chosen should be named "Mods"',
          'If you have OneDrive installed, it may have moved your Mods folder into OneDrive.',
          e?.message,
        ]).join('\n'),
      };
    }
  }
}
