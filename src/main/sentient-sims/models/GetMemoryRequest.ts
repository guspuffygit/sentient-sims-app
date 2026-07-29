import { ParticipantDTO } from '../db/dto/ParticipantDTO';
import { MemoryEntity } from '../db/entities/MemoryEntity';

// Ids can exceed Number.MAX_SAFE_INTEGER (game handles are 64-bit); bigint carries them
// to the sqlite bind without float64 truncation silently zeroing the low digits.
export type GetMemoryRequest = {
  id: number | bigint;
};

export type DeleteMemoryRequest = {
  id: number | bigint;
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
