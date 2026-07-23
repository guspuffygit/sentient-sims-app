import { MemoryEntity } from './MemoryEntity';

export type MemoryIndexEntity = {
  memory_id: number;
  importance?: number | null;
  embedding?: Buffer | null;
  embedding_model?: string | null;
};

// A memory row joined with its (possibly missing) retrieval metadata.
export type MemoryWithIndex = MemoryEntity & {
  importance?: number | null;
  embedding?: Buffer | null;
  embedding_model?: string | null;
};
