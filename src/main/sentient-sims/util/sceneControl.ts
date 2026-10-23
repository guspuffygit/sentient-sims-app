// The game ending a conversation the app is airing: the sims in it walked apart, or one of
// them left the lot. See the mod's scene/ss_scene_watch.py. Core since 2026-09-28 (it was
// the stream tier's onModMessage): the mod's scene watch ships in every build.
import log from 'electron-log';
import type { ScenePlaybackRegistry } from '../services/ScenePlaybackRegistry';
import type { SceneControl } from '../models/ModLogWebsocketMessage';
import { notifySceneStopAll } from './notifyRenderer';

export function onSceneControl(scenePlayback: ScenePlaybackRegistry, control: SceneControl) {
  const where = control.distance_m != null ? ` at ${control.distance_m}m` : '';
  log.info(`[Scene] the game ended ${control.scene_id ?? 'every scene'} (${control.mode}): ${control.reason}${where}`);
  if (control.action === 'stop_all') {
    scenePlayback.stopAll(control.reason);
    // The registry only knows scenes with an id; a reply to the player airs without one
    // and kept playing over the loading screen and onto the next lot (2026-10-23). The
    // renderer drops its whole queue and the line playing now, id or not.
    notifySceneStopAll();
  } else if (control.scene_id) {
    scenePlayback.stop(control.scene_id, control.reason, control.mode);
  }
}
