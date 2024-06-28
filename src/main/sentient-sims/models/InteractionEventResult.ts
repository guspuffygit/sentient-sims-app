import { MemoryEntity } from '../db/entities/MemoryEntity';
import { OpenAICompatibleRequest } from './OpenAICompatibleRequest';

export enum InteractionEventStatus {
  GENERATED = 'generated',
  UNMAPPED_ANIMATION = 'unmappedanimation',
  IGNORED = 'ignored',
  UNMAPPED_INTERACTION = 'unmappedinteraction',
  MAPPING_ANIMATION = 'mappinganimation',
  NSFW_DISABLED = 'nsfwdisabled',
  NOOP = 'noop',
  NOT_PLAYER_SIM = 'notplayersim',
  CLASSIFIED = 'classified',
  UNCLASSIFIED = 'unclassified',
}

export type InteractionEventResult = {
  status: InteractionEventStatus;
  memory?: MemoryEntity;
  text?: string;
  request?: OpenAICompatibleRequest;
};
