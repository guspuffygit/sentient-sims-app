import * as fs from 'fs';
import path from 'path';

export function getSims4Folder(): string {
  return path.join(
    process.env.HOME || process.env.USERPROFILE || '',
    'Documents',
    'Electronic Arts',
    'The Sims 4'
  );
}

export function getModsFolder(): string {
  const sims4Folder = getSims4Folder();
  return path.join(sims4Folder, 'Mods');
}

export function getSentientSimsFolder(): string {
  const modsFolder = getModsFolder();
  return path.join(modsFolder, 'sentient-sims');
}

export function filesToDelete(): string[] {
  return [
    path.join(getSentientSimsFolder(), 'sentient-sims-descriptions.ts4script'),
  ];
}

export function getSettingsFile(): string {
  return path.join(getSentientSimsFolder(), 'app-settings.json');
}

export function getModVersionFile(): string {
  return path.join(getSentientSimsFolder(), 'mod-version.json');
}

export function getLogsFile(): Buffer {
  const logFilePath = path.join(getSentientSimsFolder(), 'logs.txt');
  return fs.readFileSync(logFilePath);
}

export function getAppVersionFile(): string {
  return path.join(getSentientSimsFolder(), 'app-version.json');
}

export function getZippedModFile(): string {
  return path.join(getModsFolder(), 'sentient-sims.zip');
}

export function getSettings() {
  const settingsFile = getSettingsFile();
  if (fs.existsSync(settingsFile)) {
    return JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
  }

  return {};
}

export function writeSettings(data: any) {
  const sentientSimsFolder = getSentientSimsFolder();
  if (!fs.existsSync(sentientSimsFolder)) {
    fs.mkdirSync(sentientSimsFolder, { recursive: true });
  }

  fs.writeFileSync(getSettingsFile(), JSON.stringify(data, null, 2), 'utf-8');
}

export function listFilesRecursively(directoryPath: string): string[] {
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

export function findFilesWithKeywords(
  folderPath: string,
  keywords: string[]
): string[] {
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

export function getLastExceptionFiles() {
  return findFilesWithKeywords(getSims4Folder(), [
    'lastException',
    'lastCleanException',
    'lastUIException',
  ]);
}
