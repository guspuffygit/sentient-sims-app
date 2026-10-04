import { LogMessage } from './LogMessage';

export type ModLogWebsocketMessage = {
  log?: LogMessage;
  // V-1: game clock speed changes (see ss_clock.broadcast_clock_state)
  clock_state?: ClockState;
  // The game ending a conversation the app is airing (see scene/ss_scene_watch.py):
  // the sims in it walked apart, or one of them left the lot.
  scene_control?: SceneControl;
  // Which build just connected, sent once per websocket open (ss_version_service.announce_mod_info)
  mod_info?: ModInfo;
};

export type ModInfo = {
  // 'core' | 'stream' for a packaged build, 'dev' for the loose tree (ss_tier.mod_tier)
  tier: string;
  mod_version: string;
  required_app_version: string;
};

export type SceneControl = {
  // 'stop' ends the named scene; 'stop_all' ends everything (the lot is going away)
  action: 'stop' | 'stop_all';
  // 'soft' lets the line already playing finish; 'hard' cuts it off now
  mode: 'soft' | 'hard';
  scene_id?: string;
  reason: 'walked_away' | 'left_lot' | 'zone_unload' | 'cheat';
  // Who ended it, and how far away they had got
  sim_id?: string | null;
  distance_m?: number | null;
};

export type ClockState = {
  speed: string;
  paused: boolean;
  // 'user' = the player (or the game) paused; 'mod' = a pause the mod itself pushed
  // (pause_on_generation, voice hold, error dialog) which must never gate playback
  paused_by?: 'user' | 'mod' | null;
};
