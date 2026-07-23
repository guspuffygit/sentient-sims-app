import { Repository } from './Repository';
import { MemoryEntity } from './entities/MemoryEntity';
import { MemoryIndexEntity, MemoryWithIndex } from './entities/MemoryIndexEntity';

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

  // Recent memories involving any of the given participants, joined with their retrieval
  // metadata (LEFT JOIN: rows the annotator hasn't reached yet still show up, with null
  // importance/embedding). Newest-first window that MemoryRetrievalService scores in process.
  getRetrievalCandidates(participantIds: string[], limit: number): MemoryWithIndex[] {
    if (participantIds.length === 0) {
      return [];
    }

    const placeholders = participantIds.map(() => '?').join(', ');
    const query = `
      SELECT DISTINCT memory.*, memory_index.importance, memory_index.embedding, memory_index.embedding_model
      FROM memory
      INNER JOIN memory_participants ON memory.id = memory_participants.memory_id
      LEFT JOIN memory_index ON memory_index.memory_id = memory.id
      WHERE memory_participants.participant_id IN (${placeholders})
      ORDER BY memory.timestamp DESC, memory.id DESC
      LIMIT ?;
    `;

    const bigIntParticipantIds = participantIds.map((participantIdString) => BigInt(participantIdString));

    return this.dbService
      .getDb()
      .prepare(query)
      .all([...bigIntParticipantIds, limit]) as MemoryWithIndex[];
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
