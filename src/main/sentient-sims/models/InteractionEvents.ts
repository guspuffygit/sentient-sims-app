import { SentientSim } from './SentientSim';

export enum SSEventType {
  WICKED_WHIMS = 'wickedwhims',
  INTERACTION = 'interaction',
  WANTS = 'wants',
  DO_SOMETHING = 'dosomething',
  CONTINUE = 'continue',
}

export enum WWEventType {
  ASKING = 'asking',
  STARTING = 'starting',
  ACTIVE = 'active',
  MAPPING = 'mapping',
}

export type SSEvent = {
  event_id: string;
  event_type: SSEventType;
  location_id: number;
  sentient_sims: SentientSim[];
};

export type WWInteractionEvent = SSEvent & {
  sex_category: number;
  sex_location: number;
  testing_action?: string;
  animation_author: string;
  animation_name: string;
  animation_identifier: string;
  ww_event_type: WWEventType;
};

export type WantsInteractionEvent = SSEvent;

export type ContinueInteractionEvent = SSEvent;

export type InteractionEvent = SSEvent & {
  interaction_name: string;
};

export type DoSomethingInteractionEvent = SSEvent & {
  action: string;
};

export type InteractionEvents =
  | WWInteractionEvent
  | WantsInteractionEvent
  | ContinueInteractionEvent
  | InteractionEvent
  | DoSomethingInteractionEvent;
