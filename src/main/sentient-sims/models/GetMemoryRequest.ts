import { MemoryEntity } from '../db/entities/MemoryEntity';
import { ParticipantEntity } from '../db/entities/ParticipantEntity';

export type GetMemoryRequest = {
  id: number;
};

export type DeleteMemoryRequest = {
  id: number;
};

export type GetMemoryParticipantsRequest = {
  memory_id: number;
};

export type GetParticipantsMemoriesRequest = {
  participant_ids: number[];
};

export type CreateMemoryRequest = {
  memory: MemoryEntity;
  participants: ParticipantEntity[];
};
