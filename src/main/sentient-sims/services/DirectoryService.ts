import * as fs from 'fs';
import path from 'path';
import log from 'electron-log';
import { SettingsEnum } from '../models/SettingsEnum';
import { SettingsService } from './SettingsService';
import { DatabaseSession } from '../models/DatabaseSession';
import { SaveGame, SaveGameType } from '../models/SaveGame';

export class DirectoryService {
  readonly settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  getModsFolder(): string {
    return this.settingsService.get(SettingsEnum.MODS_DIRECTORY) as string;
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
    return path.join(this.getModsFolder(), 'sentient-sims.zip');
  }

  getSentientSimsScriptsFolder(): string {
    return path.join(this.getSentientSimsFolder(), 'Scripts');
  }

  filesToDelete(): string[] {
    return [path.join(this.getSentientSimsFolder(), 'sentient-sims-descriptions.ts4script'), this.getZippedModFile()];
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
      const fullPath = `${folderPath}/${item}`;

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

    if (saveGame.type === SaveGameType.UNSAVED) {
      return path.join(this.getSentientSimsFolder(), `${saveGame.name}-sentient-sims-unsaved.db`);
    }

    throw Error(`Unknown SaveGameType: ${saveGame.type}`);
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

  getScreenshotsFolder() {
    return path.join(this.getSims4Folder(), 'Screenshots');
  }
}
