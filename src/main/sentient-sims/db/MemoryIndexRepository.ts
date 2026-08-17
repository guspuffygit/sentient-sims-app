import { Repository } from './Repository';
import { MemoryEntity, MemoryRow, toMemoryEntity } from './entities/MemoryEntity';
import { MemoryIndexEntity, MemoryWithIndex } from './entities/MemoryIndexEntity';

// memory_index row as read with safeIntegers() (INTEGER columns arrive as bigint).
type MemoryIndexRow = {
  memory_id: bigint;
  importance?: bigint | null;
  embedding?: Buffer | null;
  embedding_model?: string | null;
};

type MemoryWithIndexRow = MemoryRow & Omit<MemoryIndexRow, 'memory_id'>;

function toMemoryWithIndex(row: MemoryWithIndexRow): MemoryWithIndex {
  const { importance, ...rest } = row;
  return {
    ...toMemoryEntity(rest),
    importance: importance === null || importance === undefined ? importance : Number(importance),
  };
}

export class MemoryIndexRepository extends Repository {
  getIndex(memoryId: string): MemoryIndexEntity | undefined {
    const row = this.dbService
      .getDb()
      .prepare('SELECT * FROM memory_index WHERE memory_id = ?')
      .safeIntegers()
      .get([BigInt(memoryId)]) as MemoryIndexRow | undefined;

    if (!row) {
      return undefined;
    }

    return {
      memory_id: row.memory_id.toString(),
      importance: row.importance === null || row.importance === undefined ? row.importance : Number(row.importance),
      embedding: row.embedding,
      embedding_model: row.embedding_model,
    };
  }

  // Annotation is fire-and-forget, so by the time it lands the memory may have been
  // deleted (or the db reloaded). The WHERE EXISTS guard makes a stale upsert a
  // silent no-op instead of a FOREIGN KEY error.
  upsertIndex(index: MemoryIndexEntity) {
    return this.dbService
      .getDb()
      .prepare(
        `INSERT OR REPLACE INTO memory_index(memory_id, importance, embedding, embedding_model)
         SELECT ?, ?, ?, ?
         WHERE EXISTS (SELECT 1 FROM memory WHERE id = ?)`,
      )
      .run([
        BigInt(index.memory_id),
        index.importance ?? null,
        index.embedding ?? null,
        index.embedding_model ?? null,
        BigInt(index.memory_id),
      ]);
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

    const rows = this.dbService
      .getDb()
      .prepare(query)
      .safeIntegers()
      .all([...bigIntParticipantIds, limit]) as MemoryWithIndexRow[];
    return rows.map(toMemoryWithIndex);
  }

  // Memories with no index row yet (or indexed before an embedder was available),
  // oldest first — the backfill work queue.
  getUnindexedMemories(limit: number): MemoryEntity[] {
    const rows = this.dbService
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
      .safeIntegers()
      .all([limit]) as MemoryRow[];
    return rows.map(toMemoryEntity);
  }
}
