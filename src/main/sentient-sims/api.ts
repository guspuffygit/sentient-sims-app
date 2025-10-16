import express from 'express';
import log from 'electron-log';
import { modOutOfDate } from './controllers/VersionController';
import { DebugController } from './controllers/DebugController';
import { startWebSocketServer } from './websocketServer';
import { WebsocketController } from './controllers/WebsocketController';
import { ApiContext } from './services/ApiContext';

export function runApi(ctx: ApiContext) {
  const expressApp = express();
  expressApp.use(express.json({ limit: 52428800 }));

  expressApp.get('/debug/health', DebugController.appHealthCheck);
  expressApp.get('/debug/test-ai', ctx.debugController.healthCheckGenerationService);
  expressApp.post('/debug/send-logs', ctx.debugController.sendDebugLogs);
  expressApp.post('/debug/interaction', ctx.debugController.sendBugReport);

  expressApp.post('/ai/v2/generate', ctx.aiController.sentientSimsGenerate);
  expressApp.post('/ai/v2/event/interaction', ctx.aiController.interactionEvent);
  expressApp.post('/ai/v2/event/classification', ctx.aiController.classificationEvent);
  expressApp.post('/ai/v2/event/classification', ctx.aiController.classificationEvent);
  expressApp.post('/ai/v2/event/buff', ctx.aiController.buffDescription);
  expressApp.post('/ai/v3/event/buff', ctx.aiController.buffEvent);
  expressApp.get('/ai/v2/models', ctx.aiController.getModels);
  expressApp.get('/ai/v2/tts', ctx.aiController.tts);

  expressApp.get('/files/last-exception', ctx.fileController.getLastExceptionFiles);
  expressApp.delete('/files/last-exception', ctx.fileController.deleteLastExceptionFiles);
  expressApp.get('/files/:filename', ctx.assetsController.getAssetsFile);

  expressApp.get('/settings/app/:appSetting', ctx.settingsController.getSetting);
  expressApp.post('/settings/app/:appSetting', ctx.settingsController.updateSetting);
  expressApp.get('/settings/app/:appSetting/reset', ctx.settingsController.resetSetting);

  expressApp.get('/versions/mod', ctx.versionController.getModVersion);
  expressApp.get('/versions/app', ctx.versionController.getAppVersion);
  expressApp.get('/versions/game', ctx.versionController.getGameVersion);

  expressApp.post('/update/mod', ctx.updateController.updateMod);

  expressApp.get('/participants', ctx.participantsController.getAllParticipants);
  expressApp.get('/participants/:participantId', ctx.participantsController.getParticipant);
  expressApp.post('/participants/:participantId', ctx.participantsController.updateParticipant);
  expressApp.delete('/participants/:participantId', ctx.participantsController.deleteParticipant);

  expressApp.get('/locations', ctx.locationsController.getAllLocations);
  expressApp.get('/locations/default', ctx.locationsController.getDefaultLocations);
  expressApp.get('/locations/modified', ctx.locationsController.getModifiedLocations);
  expressApp.get('/locations/:locationId', ctx.locationsController.getLocation);
  expressApp.post('/locations', ctx.locationsController.updateLocation);
  expressApp.delete('/locations/:locationId', ctx.locationsController.deleteLocation);

  expressApp.get('/memories/:memoryId', ctx.memoriesController.getMemory);
  expressApp.get('/memories', ctx.memoriesController.getMemories);
  expressApp.post('/memories/:memoryId', ctx.memoriesController.updateMemory);
  expressApp.post('/memories', ctx.memoriesController.createMemory);
  expressApp.delete('/memories/:memoryId', ctx.memoriesController.deleteMemory);
  expressApp.delete('/memories', ctx.memoriesController.deleteAllMemories);

  expressApp.get('/patreon-redirect', ctx.patreonController.handleRedirect);
  expressApp.get('/login/callback', ctx.loginController.handleRedirect);

  expressApp.get('/db/load/:sessionId', modOutOfDate);
  expressApp.get('/db/save/:sessionId', modOutOfDate);

  expressApp.post('/db/load', ctx.dbController.loadDatabase);
  expressApp.post('/db/save', ctx.dbController.saveDatabase);
  expressApp.get('/db/unload', ctx.dbController.unloadDatabase);
  expressApp.get('/db/list', ctx.dbController.getSaveGames);

  expressApp.get('/animations', ctx.animationsController.getAnimations);
  expressApp.get('/animations/nsfw-enabled', ctx.animationsController.isNsfwEnabled);
  expressApp.post('/animations', ctx.animationsController.setAnimation);

  expressApp.get('/interactions/ignored', ctx.interactionDescriptionController.getIgnoredInteractions);
  expressApp.get('/traits', ctx.mappingController.getTraits);
  expressApp.get('/traits/unmapped', ctx.mappingController.getUnmappedTraits);
  expressApp.post('/traits/export', ctx.mappingController.exportTraits);
  expressApp.get('/moods', ctx.mappingController.getMoods);
  expressApp.get('/moods/unmapped', ctx.mappingController.getUnmappedMoods);
  expressApp.post('/interactions', ctx.interactionDescriptionController.updateInteraction);
  expressApp.get('/voice/phonemize', ctx.voiceController.phonemize);
  expressApp.get('/websocket/isconnected', new WebsocketController().isConnected);

  return expressApp.listen(ctx.port, () => {
    log.debug(`Server is running on port ${ctx.port}`);
  });
}

export function runWebSocketServer(ctx: ApiContext) {
  return startWebSocketServer(ctx);
}
