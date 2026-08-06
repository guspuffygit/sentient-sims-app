import { InteractionEvent } from 'main/sentient-sims/models/InteractionEvents';
import { MappingSource } from 'main/sentient-sims/models/MappingSource';

export type InteractionDTO = {
  name: string;
  event?: InteractionEvent;
  action?: string;
  ignored?: boolean;
  sub?: string;
};

export type BasicInteraction = {
  name: string;
  action?: string;
  ignored?: boolean;
  sub?: string;
};

export type ShadowedVersion = {
  action?: string;
  ignored?: boolean;
};

export type BrowsableInteraction = BasicInteraction & {
  source: MappingSource;
  // The versions this entry shadows, when they exist, so the UI can show whether
  // the displayed text matches what everyone else gets and what the original was
  online?: ShadowedVersion;
  builtIn?: ShadowedVersion;
};
