import express from 'express';
import log from 'electron-log';
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
const debugController = new DebugController(openAIService, logSendService);
const aiController = new AIController(openAIService, customLLMService);

export default function runApi() {
  const expressApp = express();
  expressApp.use(express.json());
  const port = 25148;

  // TODO: Deprecated
  expressApp.get('/health', DebugController.healthCheck);
  expressApp.post('/api/v1/count', AIController.countTokens);
  expressApp.post('/api/v1/generate', aiController.generate);

  expressApp.get('/debug/health', DebugController.healthCheck);
  expressApp.get('/debug/test-open-ai', debugController.testOpenAI);
  expressApp.get('/debug/send-logs', debugController.sendDebugLogs);

  expressApp.post('/ai/v2/generate', aiController.sentientSimsGenerate);
  expressApp.post('/ai/translate', aiController.translate);
  expressApp.post('/ai/generate', aiController.generateChatCompletion);

  expressApp.get('/files/last-exception', fileController.getLastExceptionFiles);
  expressApp.delete(
    '/files/last-exception',
    fileController.deleteLastExceptionFiles
  );

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

  expressApp.listen(port, () => {
    log.debug(`Server is running on port ${port}`);
  });
}
