import { ParticipantDTO } from '../db/dto/ParticipantDTO';
import { MemoryEntity } from '../db/entities/MemoryEntity';

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
  participant_ids: string[];
};

export type CreateMemoryRequest = {
  memory: MemoryEntity;
  participants: ParticipantDTO[];
};
