/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
import * as fs from 'fs';
import path from 'path';
import log from 'electron-log';
import { SettingsEnum } from '../models/SettingsEnum';
import { SettingsService } from './SettingsService';

export class DirectoryService {
  private settingsService: SettingsService;

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

  getModSettingsFile(): string {
    return path.join(this.getSentientSimsFolder(), 'settings.json');
  }

  getModVersionFile(): string {
    return path.join(this.getSentientSimsFolder(), 'mod-version.json');
  }

  getLogsFile(): string {
    return path.join(this.getSentientSimsFolder(), 'logs.txt');
  }

  getLogsFileBuffer(): Buffer {
    return fs.readFileSync(this.getLogsFile());
  }

  getConfigFile(): Buffer {
    const configFile = path.join(this.getSims4Folder(), 'Config.log');
    return fs.readFileSync(configFile);
  }

  getZippedModFile(): string {
    return path.join(this.getModsFolder(), 'sentient-sims.zip');
  }

  getMemoriesFolder(): string {
    return path.join(this.getSentientSimsFolder(), 'memories');
  }

  filesToDelete(): string[] {
    return [
      path.join(
        this.getSentientSimsFolder(),
        'sentient-sims-descriptions.ts4script'
      ),
      this.getZippedModFile(),
    ];
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
        const hasKeywords = keywords.some((keyword) =>
          new RegExp(keyword, 'i').test(item)
        );
        if (hasKeywords) {
          files.push(fullPath);
        }
      }
    });

    return files;
  }

  getSentientSimsDb() {
    return path.join(this.getSentientSimsFolder(), 'sentient-sims.db');
  }

  getSentientSimsDbUnsaved() {
    return path.join(this.getSentientSimsFolder(), 'sentient-sims-unsaved.db');
  }

  static fileExistsSync(filePath: string): boolean {
    try {
      fs.accessSync(filePath, fs.constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }

  listDirectoriesSync(directoryPath: string): string[] {
    try {
      const contents = fs.readdirSync(directoryPath);
      const directories = contents.filter((item) => {
        const itemPath = path.join(directoryPath, item);
        return fs.statSync(itemPath).isDirectory();
      });
      return directories;
    } catch (error) {
      log.error('Error occurred while listing directories:', error);
      return [];
    }
  }
}
