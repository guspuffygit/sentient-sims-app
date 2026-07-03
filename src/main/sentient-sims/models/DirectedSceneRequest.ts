import { InteractionEvent } from './InteractionEvents';

export type DirectedSceneRequest = {
  event: InteractionEvent;
  // Optional per-role model overrides; undefined falls back to the configured default model
  directorModel?: string;
  // Parallel to event.sentient_sims order
  actorModels?: (string | undefined)[];
};
