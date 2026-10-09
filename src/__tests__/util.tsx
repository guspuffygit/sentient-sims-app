import { vi } from 'vitest';
import { DirectoryService } from 'main/sentient-sims/services/DirectoryService';
import { SettingsService, defaultStore } from 'main/sentient-sims/services/SettingsService';
import path from 'path';
import os from 'os';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import type { TierRegistration } from 'main/sentient-sims/tiers/types';

export function randomString() {
  return Math.random().toString(36).substring(2, 12);
}

export function mockDirectoryService(mockPath?: string, settingsService?: SettingsService): DirectoryService {
  const directoryService = new DirectoryService(settingsService ?? new SettingsService());
  const fakePath = mockPath ?? path.join(os.tmpdir(), 'sentient-sims-app-test', randomString());
  vi.spyOn(directoryService, 'getModsFolder').mockImplementation(() => fakePath);
  return directoryService;
}

export function mockEnvironment() {
  const mockConfigPath = path.join(os.tmpdir(), 'sentient-sims-app-test', randomString(), 'electronConfig');

  const mockModsPath = path.join(os.tmpdir(), 'sentient-sims-app-test', randomString(), 'Mods');

  const store = defaultStore(mockConfigPath);
  const settingsService = new SettingsService(store);
  const directoryService = mockDirectoryService(mockModsPath, settingsService);
  return {
    settingsService,
    directoryService,
  };
}

export interface MockApiContextParams {
  port?: number;
  getAssetPath?: (...paths: string[]) => string;
  settingsService?: SettingsService;
  directoryService?: DirectoryService;
  // The build tiers to run; [] is the core build. Default: the generated list (dev).
  tiers?: TierRegistration[];
  devBuild?: boolean;
}

export function mockApiContext(params?: MockApiContextParams): ApiContext {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getAssetPath = (...paths: string[]) => {
    return '';
  };
  const { directoryService, settingsService } = mockEnvironment();
  return new ApiContext({
    getAssetPath: params?.getAssetPath ?? getAssetPath,
    port: params?.port ?? 25198,
    settingsService: params?.settingsService ?? settingsService,
    directoryService: params?.directoryService ?? directoryService,
    appVersion: '1.0.0',
    tiers: params?.tiers,
    devBuild: params?.devBuild,
  });
}
