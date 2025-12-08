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
  expressApp.get('/debug/test-ai', ctx.controller.debug.healthCheckGenerationService);
  expressApp.post('/debug/send-logs', ctx.controller.debug.sendDebugLogs);
  expressApp.post('/debug/interaction', ctx.controller.debug.sendBugReport);

  expressApp.post('/ai/v2/generate', ctx.controller.ai.sentientSimsGenerate);
  expressApp.post('/ai/v2/event/interaction', ctx.controller.ai.interactionEvent);
  expressApp.post('/ai/v2/event/classification', ctx.controller.ai.classificationEvent);
  expressApp.post('/ai/v2/event/classification', ctx.controller.ai.classificationEvent);
  expressApp.post('/ai/v2/event/buff', ctx.controller.ai.buffDescription);
  expressApp.post('/ai/v3/event/buff', ctx.controller.ai.buffEvent);
  expressApp.get('/ai/v2/models', ctx.controller.ai.getModels);
  expressApp.get('/ai/v2/tts', ctx.controller.ai.tts);

  expressApp.get('/files/last-exception', ctx.controller.file.getLastExceptionFiles);
  expressApp.delete('/files/last-exception', ctx.controller.file.deleteLastExceptionFiles);
  expressApp.get('/files/:filename', ctx.controller.assets.getAssetsFile);

  expressApp.get('/settings/app/:appSetting', ctx.controller.settings.getSetting);
  expressApp.post('/settings/app/:appSetting', ctx.controller.settings.updateSetting);
  expressApp.get('/settings/app/:appSetting/reset', ctx.controller.settings.resetSetting);

  expressApp.get('/versions/mod', ctx.controller.version.getModVersion);
  expressApp.get('/versions/app', ctx.controller.version.getAppVersion);
  expressApp.get('/versions/game', ctx.controller.version.getGameVersion);

  expressApp.post('/update/mod', ctx.controller.update.updateMod);

  expressApp.get('/participants', ctx.controller.participants.getAllParticipants);
  expressApp.get('/participants/:participantId', ctx.controller.participants.getParticipant);
  expressApp.post('/participants/:participantId', ctx.controller.participants.updateParticipant);
  expressApp.delete('/participants/:participantId', ctx.controller.participants.deleteParticipant);

  expressApp.get('/locations', ctx.controller.locations.getAllLocations);
  expressApp.get('/locations/default', ctx.controller.locations.getDefaultLocations);
  expressApp.get('/locations/modified', ctx.controller.locations.getModifiedLocations);
  expressApp.get('/locations/:locationId', ctx.controller.locations.getLocation);
  expressApp.post('/locations', ctx.controller.locations.updateLocation);
  expressApp.delete('/locations/:locationId', ctx.controller.locations.deleteLocation);

  expressApp.get('/memories/:memoryId', ctx.controller.memories.getMemory);
  expressApp.get('/memories', ctx.controller.memories.getMemories);
  expressApp.post('/memories/:memoryId', ctx.controller.memories.updateMemory);
  expressApp.post('/memories', ctx.controller.memories.createMemory);
  expressApp.delete('/memories/:memoryId', ctx.controller.memories.deleteMemory);
  expressApp.delete('/memories', ctx.controller.memories.deleteAllMemories);

  expressApp.get('/patreon-redirect', ctx.controller.patreon.handleRedirect);
  expressApp.get('/login/callback', ctx.controller.login.handleRedirect);

  expressApp.get('/db/load/:sessionId', modOutOfDate);
  expressApp.get('/db/save/:sessionId', modOutOfDate);

  expressApp.post('/db/load', ctx.controller.db.loadDatabase);
  expressApp.post('/db/save', ctx.controller.db.saveDatabase);
  expressApp.get('/db/unload', ctx.controller.db.unloadDatabase);
  expressApp.get('/db/list', ctx.controller.db.getSaveGames);

  expressApp.get('/animations/online-all', ctx.controller.animations.getOnlineAnimations);

  expressApp.get('/animations', ctx.controller.animations.getAnimations);
  expressApp.get('/animations/nsfw-enabled', ctx.controller.animations.isNsfwEnabled);
  expressApp.post('/animations', ctx.controller.animations.setAnimation);

  expressApp.post('/animations/save-locally', ctx.controller.animations.saveAnimationLocally);

  expressApp.get('/interactions/ignored', ctx.controller.interactionDescription.getIgnoredInteractions);

  expressApp.get('/interactions/online-all', ctx.controller.interactionDescription.getOnlineInteractions);

  expressApp.get('/traits', ctx.controller.mapping.getTraits);
  expressApp.get('/traits/unmapped', ctx.controller.mapping.getUnmappedTraits);
  expressApp.post('/traits/export', ctx.controller.mapping.exportTraits);
  expressApp.get('/moods', ctx.controller.mapping.getMoods);
  expressApp.get('/moods/unmapped', ctx.controller.mapping.getUnmappedMoods);

  expressApp.post('/interactions/save-locally', ctx.controller.interactionDescription.saveInteractionLocally);

  expressApp.post('/interactions', ctx.controller.interactionDescription.updateInteraction);
  expressApp.get('/voice/phonemize', ctx.controller.voice.phonemize);
  expressApp.get('/websocket/isconnected', new WebsocketController().isConnected);
  expressApp.get('/announcements', ctx.controller.news.getNews);

  return expressApp.listen(ctx.port, () => {
    log.debug(`Server is running on port ${ctx.port}`);
  });
}

export function runWebSocketServer(ctx: ApiContext) {
  return startWebSocketServer(ctx);
}
