import express from 'express';
import log from 'electron-log';

import { FileController } from './controllers/FileController';
import { LastExceptionService } from './services/LastExceptionService';
import { SettingsService } from './services/SettingsService';
import { DirectoryService } from './services/DirectoryService';
import { InteractionService } from './services/InteractionService';
import { VersionService } from './services/VersionService';
import { UpdateService } from './services/UpdateService';
import { UpdateController } from './controllers/UpdateController';
import { SettingsController } from './controllers/SettingsController';
import { VersionController } from './controllers/VersionController';
import { DebugController } from './controllers/DebugController';
import { LogSendService } from './services/LogSendService';
import { AIController } from './controllers/AIController';
import { AssetsController } from './controllers/AssetsController';
import { PatreonController } from './controllers/PatreonController';
import { PatreonService } from './services/PatreonService';
import { LogsService } from './services/LogsService';
import { startWebSocketServer } from './websocketServer';
import { AnimationsController } from './controllers/AnimationsController';
import { AnimationsService } from './services/AnimationsService';
import { DbService } from './services/DbService';
import { DbController } from './controllers/DbController';
import { ParticipantRepository } from './db/ParticipantRepository';
import { ParticipantsController } from './controllers/ParticipantsController';
import { LocationRepository } from './db/LocationRepository';
import { LocationsController } from './controllers/LocationsController';
import { MemoryRepository } from './db/MemoryRepository';
import { MemoriesController } from './controllers/MemoriesController';
import { AIService } from './services/AIService';
import { RepositoryService } from './services/RepositoryService';
import { PromptRequestBuilderService } from './services/PromptRequestBuilderService';
import { InteractionDescriptionController } from './controllers/InteractionDescriptionController';
import { InteractionRepository } from './db/InteractionRepository';

export type ApiOptions = {
  port: number;
  getAssetPath: (...paths: string[]) => string;
  settingsService: SettingsService;
  directoryService: DirectoryService;
};

export function runApi({
  getAssetPath,
  port,
  settingsService,
  directoryService,
}: ApiOptions) {
  const lastExceptionService = new LastExceptionService(directoryService);
  const versionService = new VersionService(directoryService);
  const versionController = new VersionController(versionService);
  const updateService = new UpdateService(directoryService);
  const fileController = new FileController(lastExceptionService);
  const dbService = new DbService(directoryService);
  const dbController = new DbController(dbService);
  const locationRepository = new LocationRepository(dbService);
  const memoryRepository = new MemoryRepository(dbService);
  const participantRepository = new ParticipantRepository(dbService);
  const repositoryService = new RepositoryService(
    locationRepository,
    memoryRepository,
    participantRepository
  );
  const promptBuilderService = new PromptRequestBuilderService(
    repositoryService
  );
  const memoriesController = new MemoriesController(memoryRepository);
  const participantsController = new ParticipantsController(
    participantRepository
  );
  const locationsController = new LocationsController(locationRepository);
  const updateController = new UpdateController(updateService);
  const settingsController = new SettingsController(settingsService);
  const logSendService = new LogSendService(
    settingsService,
    directoryService,
    lastExceptionService,
    versionService
  );
  const patreonService = new PatreonService(settingsService);
  const patreonController = new PatreonController(patreonService);
  const animationsService = new AnimationsService(settingsService);
  const interactionRepository = new InteractionRepository();
  const interactionDescriptionService = new InteractionService(
    interactionRepository
  );
  const debugController = new DebugController(settingsService, logSendService);
  const aiService = new AIService(
    settingsService,
    promptBuilderService,
    animationsService,
    interactionDescriptionService
  );
  const interactionDescriptionController = new InteractionDescriptionController(
    interactionDescriptionService
  );
  const aiController = new AIController(aiService);
  const animationsController = new AnimationsController(animationsService);
  const assetsController = new AssetsController(getAssetPath);
  const expressApp = express();
  expressApp.use(express.json({ limit: 52428800 }));

  expressApp.get('/debug/health', DebugController.appHealthCheck);
  expressApp.get(
    '/debug/test-ai',
    debugController.healthCheckGenerationService
  );
  expressApp.get('/debug/send-logs', debugController.sendDebugLogs);
  expressApp.post('/debug/interaction', debugController.sendBugReport);

  expressApp.post('/ai/v2/generate', aiController.sentientSimsGenerate);
  expressApp.post('/ai/v2/event/interaction', aiController.interactionEvent);

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

  expressApp.get('/participants', participantsController.getAllParticipants);
  expressApp.get(
    '/participants/:participantId',
    participantsController.getParticipant
  );
  expressApp.post(
    '/participants/:participantId',
    participantsController.updateParticipant
  );
  expressApp.delete(
    '/participants/:participantId',
    participantsController.deleteParticipant
  );

  expressApp.get('/locations', locationsController.getAllLocations);
  expressApp.get('/locations/default', locationsController.getDefaultLocations);
  expressApp.get(
    '/locations/modified',
    locationsController.getModifiedLocations
  );
  expressApp.get('/locations/:locationId', locationsController.getLocation);
  expressApp.post('/locations', locationsController.updateLocation);
  expressApp.delete(
    '/locations/:locationId',
    locationsController.deleteLocation
  );

  expressApp.get('/memories/:memoryId', memoriesController.getMemory);
  expressApp.get('/memories', memoriesController.getMemories);
  expressApp.post('/memories/:memoryId', memoriesController.updateMemory);
  expressApp.post('/memories', memoriesController.createMemory);
  expressApp.delete('/memories/:memoryId', memoriesController.deleteMemory);
  expressApp.delete('/memories', memoriesController.deleteAllMemories);

  expressApp.get('/patreon-redirect', patreonController.handleRedirect);

  expressApp.get('/db/load/:sessionId', dbController.loadDatabase);
  expressApp.get('/db/save/:sessionId', dbController.saveDatabase);
  expressApp.get('/db/unload', dbController.unloadDatabase);

  expressApp.get('/animations', animationsController.getAnimations);
  expressApp.get(
    '/animations/nsfw-enabled',
    animationsController.isNsfwEnabled
  );
  expressApp.post('/animations', animationsController.setAnimation);

  expressApp.get(
    '/interactions',
    interactionDescriptionController.getInteractionDescriptions
  );
  expressApp.get(
    '/interactions/modified',
    interactionDescriptionController.getModifiedInteractions
  );
  expressApp.get(
    '/interactions/ignored',
    interactionDescriptionController.getIgnoredInteractions
  );
  expressApp.post(
    '/interactions',
    interactionDescriptionController.updateInteraction
  );
  expressApp.delete(
    '/interactions/:name',
    interactionDescriptionController.deleteInteraction
  );

  return expressApp.listen(port, () => {
    log.debug(`Server is running on port ${port}`);
  });
}

export function runWebSocketServer(
  settingsService: SettingsService,
  directoryService: DirectoryService
) {
  const logsService = new LogsService(directoryService);
  return startWebSocketServer(logsService, settingsService);
}
