import { appApiPort } from 'main/sentient-sims/constants';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { DirectoryService } from 'main/sentient-sims/services/DirectoryService';
import { SettingsService } from 'main/sentient-sims/services/SettingsService';

async function test() {
  const settingsService = new SettingsService();
  const directoryService = new DirectoryService(settingsService);
  const ctx = new ApiContext({
    getAssetPath: (...paths: string[]) => {
      return paths[0];
    },
    port: appApiPort,
    settingsService,
    directoryService,
    appVersion: '1.0.0',
  });
  await ctx.db.loadDatabase({
    saveId: '2_2611478528',
    sessionId: '1767634504678',
  });
  console.log(ctx.memoryRepository.getMemories());
}

test();
