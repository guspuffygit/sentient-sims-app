export type MemoryIndexEntity = {
  memory_id: number;
  importance?: number | null;
  embedding?: Buffer | null;
  embedding_model?: string | null;
};
