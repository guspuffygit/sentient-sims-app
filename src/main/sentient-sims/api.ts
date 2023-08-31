import express from 'express';
import log from 'electron-log';
import { BrowserWindow } from 'electron';
import { FileController } from './controllers/FileController';
import { LastExceptionService } from './services/LastExceptionService';
import { SettingsService } from './services/SettingsService';
import { OpenAIService } from './services/OpenAIService';
import { DirectoryService } from './services/DirectoryService';
import { VersionService } from './services/VersionService';
import { UpdateService } from './services/UpdateService';
import { UpdateController } from './controllers/UpdateController';
import { SettingsController } from './controllers/SettingsController';
import { VersionController } from './controllers/VersionController';
import { DebugController } from './controllers/DebugController';
import { LogSendService } from './services/LogSendService';
import { AIController } from './controllers/AIController';
import { CustomLLMService } from './services/CustomLLMService';
import { AssetsController } from './controllers/AssetsController';
import { PatreonController } from './controllers/PatreonController';
import { PatreonService } from './services/PatreonService';

const settingsService = new SettingsService();
const directoryService = new DirectoryService(settingsService);
const lastExceptionService = new LastExceptionService(directoryService);
const versionService = new VersionService(directoryService);
const versionController = new VersionController(versionService);
const updateService = new UpdateService(directoryService);
const openAIService = new OpenAIService(directoryService, settingsService);
const customLLMService = new CustomLLMService(settingsService);
const fileController = new FileController(lastExceptionService);
const updateController = new UpdateController(updateService);
const settingsController = new SettingsController(
  directoryService,
  settingsService
);
const logSendService = new LogSendService(
  settingsService,
  directoryService,
  lastExceptionService,
  versionService,
  openAIService
);
const patreonService = new PatreonService(settingsService);
const debugController = new DebugController(
  openAIService,
  logSendService,
  customLLMService
);
const aiController = new AIController(openAIService, customLLMService);

export default function runApi(
  mainWindow: BrowserWindow,
  getAssetPath: (...paths: string[]) => string
) {
  const assetsController = new AssetsController(getAssetPath);
  const patreonController = new PatreonController(patreonService, mainWindow);
  const expressApp = express();
  expressApp.use(express.json());
  const port = 25148;

  expressApp.get('/debug/health', DebugController.healthCheck);
  expressApp.get('/debug/test-open-ai', debugController.testOpenAI);
  expressApp.get('/debug/test-custom-llm', debugController.testCustomLLM);
  expressApp.get(
    '/debug/custom-llm-workers',
    debugController.getCustomLLMWorkers
  );
  expressApp.get('/debug/send-logs', debugController.sendDebugLogs);

  expressApp.post('/ai/v2/generate', aiController.sentientSimsGenerate);
  expressApp.post('/ai/translate', aiController.translate);
  expressApp.post('/ai/generate', aiController.generateChatCompletion);

  expressApp.get('/files/last-exception', fileController.getLastExceptionFiles);
  expressApp.delete(
    '/files/last-exception',
    fileController.deleteLastExceptionFiles
  );
  expressApp.get('/files/:filename', assetsController.getAssetsFile);

  expressApp.get('/settings/app/:appSetting', settingsController.getSetting);
  expressApp.post(
    '/settings/app/:appSetting',
    settingsController.updateSetting
  );
  expressApp.get(
    '/settings/app/:appSetting/reset',
    settingsController.resetSetting
  );

  expressApp.get('/versions/mod', versionController.getModVersion);
  expressApp.get('/versions/app', versionController.getAppVersion);

  expressApp.post('/update/mod', updateController.updateMod);

  expressApp.get('/patreon-redirect', patreonController.handleRedirect);

  expressApp.listen(port, () => {
    log.debug(`Server is running on port ${port}`);
  });
}
