import express, { NextFunction, Request, RequestHandler, Response } from 'express';
import log from 'electron-log';
import { modOutOfDate } from './controllers/VersionController';
import { DebugController } from './controllers/DebugController';
import { startWebSocketServer } from './websocketServer';
import { WebsocketController } from './controllers/WebsocketController';
import { ApiContext } from './services/ApiContext';

type RouteHandler = (req: Request, res: Response, next?: NextFunction) => unknown;

const wrap =
  (fn: RouteHandler): RequestHandler =>
  (req, res, next) => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };

export function runApi(ctx: ApiContext) {
  const expressApp = express();
  expressApp.use(express.json({ limit: 52428800 }));

  expressApp.get('/debug/health', wrap(DebugController.appHealthCheck));
  expressApp.get('/debug/test-ai', wrap(ctx.controller.debug.healthCheckGenerationService));
  expressApp.post('/debug/send-logs', wrap(ctx.controller.debug.sendDebugLogs));
  expressApp.post('/debug/interaction', wrap(ctx.controller.debug.sendBugReport));

  expressApp.post('/ai/v2/generate', wrap(ctx.controller.ai.sentientSimsGenerate));
  expressApp.post('/ai/v2/event/interaction', wrap(ctx.controller.ai.interactionEvent));
  expressApp.post('/ai/v2/event/classification', wrap(ctx.controller.ai.classificationEvent));
  expressApp.post('/ai/v2/event/classification', wrap(ctx.controller.ai.classificationEvent));
  expressApp.post('/ai/v2/event/buff', wrap(ctx.controller.ai.buffDescription));
  expressApp.post('/ai/v3/event/buff', wrap(ctx.controller.ai.buffEvent));
  expressApp.get('/ai/v2/models', wrap(ctx.controller.ai.getModels));
  expressApp.get('/ai/v2/tts', wrap(ctx.controller.ai.tts));

  expressApp.get('/files/last-exception', wrap(ctx.controller.file.getLastExceptionFiles));
  expressApp.delete('/files/last-exception', wrap(ctx.controller.file.deleteLastExceptionFiles));
  expressApp.get('/files/:filename', wrap(ctx.controller.assets.getAssetsFile));

  expressApp.get('/settings/app/:appSetting', wrap(ctx.controller.settings.getSetting));
  expressApp.post('/settings/app/:appSetting', wrap(ctx.controller.settings.updateSetting));
  expressApp.get('/settings/app/:appSetting/reset', wrap(ctx.controller.settings.resetSetting));

  expressApp.get('/versions/mod', wrap(ctx.controller.version.getModVersion));
  expressApp.get('/versions/app', wrap(ctx.controller.version.getAppVersion));
  expressApp.get('/versions/game', wrap(ctx.controller.version.getGameVersion));

  expressApp.post('/update/mod', wrap(ctx.controller.update.updateMod));

  expressApp.get('/participants', wrap(ctx.controller.participants.getAllParticipants));
  expressApp.get('/participants/:participantId', wrap(ctx.controller.participants.getParticipant));
  expressApp.post('/participants/:participantId', wrap(ctx.controller.participants.updateParticipant));
  expressApp.delete('/participants/:participantId', wrap(ctx.controller.participants.deleteParticipant));

  expressApp.get('/locations', wrap(ctx.controller.locations.getAllLocations));
  expressApp.get('/locations/default', wrap(ctx.controller.locations.getDefaultLocations));
  expressApp.get('/locations/modified', wrap(ctx.controller.locations.getModifiedLocations));
  expressApp.get('/locations/:locationId', wrap(ctx.controller.locations.getLocation));
  expressApp.post('/locations', wrap(ctx.controller.locations.updateLocation));
  expressApp.delete('/locations/:locationId', wrap(ctx.controller.locations.deleteLocation));

  expressApp.get('/memories/:memoryId', wrap(ctx.controller.memories.getMemory));
  expressApp.get('/memories', wrap(ctx.controller.memories.getMemories));
  expressApp.post('/memories/:memoryId', wrap(ctx.controller.memories.updateMemory));
  expressApp.post('/memories', wrap(ctx.controller.memories.createMemory));
  expressApp.delete('/memories/:memoryId', wrap(ctx.controller.memories.deleteMemory));
  expressApp.delete('/memories', wrap(ctx.controller.memories.deleteAllMemories));

  expressApp.get('/patreon-redirect', wrap(ctx.controller.patreon.handleRedirect));
  expressApp.get('/login/callback', wrap(ctx.controller.login.handleRedirect));

  expressApp.get('/db/load/:sessionId', wrap(modOutOfDate));
  expressApp.get('/db/save/:sessionId', wrap(modOutOfDate));

  expressApp.post('/db/load', wrap(ctx.controller.db.loadDatabase));
  expressApp.post('/db/save', wrap(ctx.controller.db.saveDatabase));
  expressApp.get('/db/unload', wrap(ctx.controller.db.unloadDatabase));
  expressApp.get('/db/list', wrap(ctx.controller.db.getSaveGames));

  expressApp.get('/animations/online-all', wrap(ctx.controller.animations.getOnlineAnimations));

  expressApp.get('/animations', wrap(ctx.controller.animations.getAnimations));
  expressApp.get('/animations/nsfw-enabled', wrap(ctx.controller.animations.isNsfwEnabled));
  expressApp.post('/animations', wrap(ctx.controller.animations.setAnimation));

  expressApp.post('/animations/save-locally', wrap(ctx.controller.animations.saveAnimationLocally));

  expressApp.get('/interactions/ignored', wrap(ctx.controller.interactionDescription.getIgnoredInteractions));

  expressApp.get('/interactions/online-all', wrap(ctx.controller.interactionDescription.getOnlineInteractions));

  expressApp.get('/traits', wrap(ctx.controller.mapping.getTraits));
  expressApp.get('/traits/unmapped', wrap(ctx.controller.mapping.getUnmappedTraits));
  expressApp.post('/traits/export', wrap(ctx.controller.mapping.exportTraits));
  expressApp.get('/moods', wrap(ctx.controller.mapping.getMoods));
  expressApp.get('/moods/unmapped', wrap(ctx.controller.mapping.getUnmappedMoods));

  expressApp.post('/interactions/save-locally', wrap(ctx.controller.interactionDescription.saveInteractionLocally));

  expressApp.post('/interactions', wrap(ctx.controller.interactionDescription.updateInteraction));
  expressApp.get('/voice/phonemize', wrap(ctx.controller.voice.phonemize));
  expressApp.get('/websocket/isconnected', wrap(new WebsocketController().isConnected));
  expressApp.get('/announcements', wrap(ctx.controller.news.getNews));

  expressApp.get('/options/status', wrap(ctx.controller.options.getOptionsStatus));
  expressApp.post('/options/fix', wrap(ctx.controller.options.fixOptions));

  return expressApp.listen(ctx.port, () => {
    log.debug(`Server is running on port ${ctx.port}`);
  });
}

export function runWebSocketServer(ctx: ApiContext) {
  startWebSocketServer(ctx);
}
