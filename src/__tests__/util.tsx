import { DirectoryService } from 'main/sentient-sims/services/DirectoryService';
import {
  SettingsService,
  defaultStore,
} from 'main/sentient-sims/services/SettingsService';
import path from 'path';
import os from 'os';

export function randomString() {
  return Math.random().toString(36).substring(2, 12);
}

export function mockDirectoryService(
  mockPath?: string,
  settingsService?: SettingsService,
): DirectoryService {
  const directoryService = new DirectoryService(
    settingsService ?? new SettingsService(),
  );
  const fakePath =
    mockPath ??
    path.join(os.tmpdir(), 'sentient-sims-app-test', randomString());
  jest
    .spyOn(directoryService, 'getModsFolder')
    .mockImplementation(() => fakePath);
  return directoryService;
}

export function mockEnvironment() {
  const mockConfigPath = path.join(
    os.tmpdir(),
    'sentient-sims-app-test',
    randomString(),
    'electronConfig',
  );

  const mockModsPath = path.join(
    os.tmpdir(),
    'sentient-sims-app-test',
    randomString(),
    'Mods',
  );

  const store = defaultStore(mockConfigPath);
  const settingsService = new SettingsService(store);
  const directoryService = mockDirectoryService(mockModsPath, settingsService);
  return {
    settingsService,
    directoryService,
  };
}
