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

export type BrowsableInteraction = BasicInteraction & {
  source: MappingSource;
};
