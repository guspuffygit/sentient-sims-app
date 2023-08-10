import { DirectoryService } from 'main/sentient-sims/services/DirectoryService';
import { SettingsService } from 'main/sentient-sims/services/SettingsService';
import path from 'path';
import os from 'os';

export function randomString() {
  return Math.random().toString(36).substring(2, 12);
}

export function mockDirectoryService(): DirectoryService {
  const directoryService = new DirectoryService(new SettingsService());
  const fakePath = path.join(
    os.tmpdir(),
    'sentient-sims-app-test',
    randomString()
  );
  jest
    .spyOn(directoryService, 'getModsFolder')
    .mockImplementation(() => fakePath);
  return directoryService;
}
