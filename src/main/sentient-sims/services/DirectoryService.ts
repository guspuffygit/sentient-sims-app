import * as fs from 'fs';
import os from 'os';
import path from 'path';
import log from 'electron-log';
import { SettingsService } from './SettingsService';
import { DatabaseSession } from '../models/DatabaseSession';
import { SaveGame, SaveGameType } from '../models/SaveGame';

// Everything the release zip ships into Mods/sentient-sims (plus the zip
// itself and a retired script). A copy of any of these anywhere else under
// Mods is a manual or leftover install: the game loads a stray
// sentient-sims.ts4script instead of the real one, which then cannot find
// ss_overlay.dll next to itself and reports the overlay unavailable.
export const SHIPPED_MOD_FILES = [
  'sentient-sims.ts4script',
  'sentient-sims.package',
  'ss_overlay.dll',
  'ss_overlay.dylib',
  '_ctypes.dylib',
  'sentient-sims.zip',
  'sentient-sims-descriptions.ts4script',
];

export type StrayModFileCleanup = {
  removed: string[];
  failed: string[];
};

export class DirectoryService {
  readonly settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  getModsFolder(): string {
    return this.settingsService.modsDirectory;
  }

  getSims4Folder(): string {
    return path.resolve(this.getModsFolder(), '..');
  }

  getSentientSimsFolder(): string {
    const modsFolder = this.getModsFolder();
    return path.join(modsFolder, 'sentient-sims');
  }

  getModVersionFile(): string {
    return path.join(this.getSentientSimsFolder(), 'mod-version.json');
  }

  getLogsFile(): string {
    return path.join(this.getSentientSimsFolder(), 'logs.txt');
  }

  getConfigFile(): string {
    return path.join(this.getSims4Folder(), 'Config.log');
  }

  getZippedModFile(): string {
    // Legacy download location; UpdateService now downloads to a unique temp
    // file per install. Kept in filesToDelete() to clean up old leftovers.
    return path.join(os.tmpdir(), 'sentient-sims.zip');
  }

  getSentientSimsScriptsFolder(): string {
    return path.join(this.getSentientSimsFolder(), 'Scripts');
  }

  filesToDelete(): string[] {
    return [path.join(this.getSentientSimsFolder(), 'sentient-sims-descriptions.ts4script'), this.getZippedModFile()];
  }

  findStrayModFiles(): string[] {
    const modsFolder = this.getModsFolder();
    const sentientSimsFolder = path.resolve(this.getSentientSimsFolder());
    const shipped = new Set(SHIPPED_MOD_FILES.map((name) => name.toLowerCase()));
    const stray: string[] = [];

    const walk = (folder: string) => {
      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(folder, { withFileTypes: true });
      } catch (err) {
        log.warn(`Unable to scan ${folder} for stray mod files`, err);
        return;
      }
      entries.forEach((entry) => {
        const entryPath = path.join(folder, entry.name);
        if (entry.isDirectory()) {
          walk(entryPath);
        } else if (
          entry.isFile() &&
          shipped.has(entry.name.toLowerCase()) &&
          path.resolve(folder) !== sentientSimsFolder
        ) {
          stray.push(entryPath);
        }
      });
    };

    if (fs.existsSync(modsFolder)) {
      walk(modsFolder);
    }
    return stray;
  }

  removeStrayModFiles(): StrayModFileCleanup {
    const result: StrayModFileCleanup = { removed: [], failed: [] };
    this.findStrayModFiles().forEach((file) => {
      try {
        fs.rmSync(file);
        log.info(`Removed stray mod file outside ${this.getSentientSimsFolder()}: ${file}`);
        result.removed.push(file);
      } catch (err) {
        log.error(`Unable to remove stray mod file ${file}`, err);
        result.failed.push(file);
      }
    });
    return result;
  }

  createDirectoryIfNotExist(directoryPath: string) {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
  }

  listFilesRecursively(directoryPath: string): string[] {
    const files: string[] = [];

    function traverseDirectory(currentPath: string) {
      const entries = fs.readdirSync(currentPath);

      entries.forEach((entry) => {
        const entryPath = path.join(currentPath, entry);
        const stats = fs.statSync(entryPath);

        if (stats.isFile()) {
          files.push(entryPath);
        } else if (stats.isDirectory()) {
          traverseDirectory(entryPath);
        }
      });
    }

    traverseDirectory(directoryPath);

    return files;
  }

  findFilesWithKeywords(folderPath: string, keywords: string[]): string[] {
    const files: string[] = [];

    // Read the contents of the folder
    const items = fs.readdirSync(folderPath);

    // Iterate over each item in the folder
    items.forEach((item) => {
      const fullPath = path.join(folderPath, item);

      // Check if the item is a file
      if (fs.statSync(fullPath).isFile()) {
        // Check if the filename contains any of the specified keywords
        const hasKeywords = keywords.some((keyword) => new RegExp(keyword, 'i').test(item));
        if (hasKeywords) {
          files.push(fullPath);
        }
      }
    });

    return files;
  }

  getSentientSimsDb(databaseSession: DatabaseSession) {
    return path.join(this.getSentientSimsFolder(), `${databaseSession.saveId}-sentient-sims.db`);
  }

  getSentientSimsErrorDb(databaseSession: DatabaseSession) {
    return path.join(this.getSentientSimsFolder(), `${databaseSession.saveId}-sentient-sims-error.db`);
  }

  getSingleSlotSentientSimsDB() {
    return path.join(this.getSentientSimsFolder(), 'sentient-sims.db');
  }

  getSentientSimsDbUnsaved(databaseSession: DatabaseSession) {
    return path.join(this.getSentientSimsFolder(), `${databaseSession.sessionId}-sentient-sims-unsaved.db`);
  }

  getSentientSimsSaveGame(saveGame: SaveGame): string {
    if (saveGame.type === SaveGameType.SAVED) {
      return path.join(this.getSentientSimsFolder(), `${saveGame.name}-sentient-sims.db`);
    }

    return path.join(this.getSentientSimsFolder(), `${saveGame.name}-sentient-sims-unsaved.db`);
  }

  listSentientSimsDbUnsaved() {
    try {
      const folderPath = this.getSentientSimsFolder();
      const files = fs.readdirSync(folderPath);
      return files
        .filter((file) => file.includes('-sentient-sims-unsaved.db'))
        .map((file) => path.join(folderPath, file));
    } catch (error) {
      log.error('Error reading directory:', error);
      return [];
    }
  }

  listSentientSimsDbSaved() {
    try {
      const folderPath = this.getSentientSimsFolder();
      const files = fs.readdirSync(folderPath);
      return files.filter((file) => file.includes('-sentient-sims.db')).map((file) => path.join(folderPath, file));
    } catch (error) {
      log.error('Error reading directory:', error);
      return [];
    }
  }

  static fileExistsSync(filePath: string): boolean {
    try {
      fs.accessSync(filePath, fs.constants.F_OK);
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return false;
    }
  }

  getGameVersion() {
    return path.join(this.getSims4Folder(), 'GameVersion.txt');
  }
}
