import * as fs from 'fs';
import path from 'path';

function getSims4Folder(): string {
  return path.join(
    process.env.HOME || process.env.USERPROFILE || '',
    'Documents',
    'Electronic Arts',
    'The Sims 4'
  );
}

function getModsFolder(): string {
  const sims4Folder = getSims4Folder();
  return path.join(sims4Folder, 'Mods');
}

function getSentientSimsFolder(): string {
  const modsFolder = getModsFolder();
  return path.join(modsFolder, 'sentient-sims');
}

function listFilesRecursively(directoryPath: string): string[] {
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

export {
  getSims4Folder,
  getModsFolder,
  getSentientSimsFolder,
  listFilesRecursively,
};
