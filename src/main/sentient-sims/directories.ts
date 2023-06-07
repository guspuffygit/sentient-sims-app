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

// function createSentientSimsFolder() {
//   const sentientSimsFolder = getSentientSimsFolder();
//   if (fs.existsSync(sentientSimsFolder)) {

//   }
//   fs.mkdirSync(getModsFolder(), { recursive: true });
//   fs.mkdirSync()
// }

export function getSettingsFile(): string {
  return path.join(getSentientSimsFolder(), 'app-settings.json');
}

export function getModVersionFile(): string {
  return path.join(getSentientSimsFolder(), 'mod-version.json');
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
