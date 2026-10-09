import { ParticipantDTO } from '../db/dto/ParticipantDTO';
import { MemoryEntity } from '../db/entities/MemoryEntity';

// Ids can exceed Number.MAX_SAFE_INTEGER (game handles are 64-bit); they stay strings all
// the way to the repository, which binds them as BigInt so no float64 truncation happens.
export type GetMemoryRequest = {
  id: string;
};

export type DeleteMemoryRequest = {
  id: string;
};

export type GetMemoryParticipantsRequest = {
  memory_id: string;
};

export type GetParticipantsMemoriesRequest = {
  participant_ids: string[];
};

export type CreateMemoryRequest = {
  memory: MemoryEntity;
  participants: ParticipantDTO[];
  // Retrieval metadata known at creation time, stamped synchronously into memory_index:
  // owner makes the row private to one participant (inner monologue), importance is a
  // score the pipeline already computed so the annotator skips its own rating call.
  index?: { owner?: string; importance?: number };
};
