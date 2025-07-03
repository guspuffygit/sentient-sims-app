import { InteractionEventStatus } from './InteractionEventResult';
import { SentientSim } from './SentientSim';

export enum SSEventType {
  WICKED_WHIMS = 'wickedwhims',
  INTERACTION = 'interaction',
  INTERACTION_MAPPING = 'interaction_mapping',
  WANTS = 'wants',
  DO_SOMETHING = 'dosomething',
  CONTINUE = 'continue',
  CHAT = 'chat',
  CHAT_CONTINUE = 'chat_continue',
}

export enum WWEventType {
  ASKING = 'asking',
  STARTING = 'starting',
  ACTIVE = 'active',
  MAPPING = 'mapping',
}

export type SSTime = {
  second: number;
  minute: number;
  hour: number;
  day: number;
  week: number;
};

export enum SSSeasonType {
  SUMMER = 0,
  FALL = 1,
  WINTER = 2,
  SPRING = 3,
}

export enum SSSeasonSegment {
  EARLY = 0,
  MID = 1,
  LATE = 2,
}

export type SSSeason = {
  season_type: SSSeasonType;
  season_segment: SSSeasonSegment;
};

export type SSEnvironment = {
  location_id: number;
  world_id: number;
  time: SSTime;
  weather?: any;
  season?: SSSeason;
};

export enum SSRelationshipDirection {
  BIDIRECTIONAL = 0,
  UNIDIRECTIONAL = 1,
}

export enum SSRelationshipBitType {
  Invalid = 0,
  NoGroup = 1,
}

export type SSRelationshipBit = {
  sim_one_id: string;
  sim_two_id: string;
  name: string;
  directionality?: SSRelationshipDirection;
  group_id?: SSRelationshipBitType;
  timout?: number;
  priority?: number;
  persisted?: boolean;
  is_collection?: boolean;
  is_track_bit?: boolean;
  is_trope_bit?: boolean;
  visible?: boolean;
};

export type SSRelationships = {
  relationship_bits?: SSRelationshipBit[];
};

export type SSEvent = {
  event_id: string;
  event_type: SSEventType;
  // TODO: Deprecated
  location_id: number;
  environment: SSEnvironment;
  sentient_sims: SentientSim[];
  relationships?: SSRelationships;
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

export type ChatContinueInteractionEvent = SSEvent;

export type InteractionEvent = SSEvent & {
  interaction_name: string;
  testing_action?: string;
};

export type InteractionMappingEvent = InteractionEvent & {
  status: InteractionEventStatus;
};

export type DoSomethingInteractionEvent = SSEvent & {
  action: string;
};

export type ChatInteractionEvent = SSEvent & {
  action: string;
};

export type InteractionEvents =
  | WWInteractionEvent
  | WantsInteractionEvent
  | ContinueInteractionEvent
  | InteractionEvent
  | DoSomethingInteractionEvent
  | InteractionMappingEvent;
