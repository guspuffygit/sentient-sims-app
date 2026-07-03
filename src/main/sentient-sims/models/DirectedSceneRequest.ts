import { InteractionEvent } from './InteractionEvents';

export type DirectedSceneRequest = {
  event: InteractionEvent;
  // Optional per-role model overrides; undefined falls back to the configured default model
  directorModel?: string;
  // Parallel to event.sentient_sims order
  actorModels?: (string | undefined)[];
  // Continue the previous scene: drive the actors forward from memory instead of replaying the original action
  continueScene?: boolean;
};
