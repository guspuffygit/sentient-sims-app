import { Repository } from './Repository';
import { MemoryEntity } from './entities/MemoryEntity';
import { MemoryIndexEntity } from './entities/MemoryIndexEntity';

export class MemoryIndexRepository extends Repository {
  getIndex(memoryId: number): MemoryIndexEntity | undefined {
    return this.dbService.getDb().prepare('SELECT * FROM memory_index WHERE memory_id = ?').get([memoryId]) as
      | MemoryIndexEntity
      | undefined;
  }

  upsertIndex(index: MemoryIndexEntity) {
    return this.dbService
      .getDb()
      .prepare(
        'INSERT OR REPLACE INTO memory_index(memory_id, importance, embedding, embedding_model) VALUES(?, ?, ?, ?)',
      )
      .run([index.memory_id, index.importance ?? null, index.embedding ?? null, index.embedding_model ?? null]);
  }

  // Memories with no index row yet (or indexed before an embedder was available),
  // oldest first — the backfill work queue.
  getUnindexedMemories(limit: number): MemoryEntity[] {
    return this.dbService
      .getDb()
      .prepare(
        `
          SELECT memory.* FROM memory
          LEFT JOIN memory_index ON memory_index.memory_id = memory.id
          WHERE memory_index.memory_id IS NULL OR memory_index.embedding IS NULL
          ORDER BY memory.timestamp ASC, memory.id ASC
          LIMIT ?;
        `,
      )
      .all([limit]) as MemoryEntity[];
  }
}
