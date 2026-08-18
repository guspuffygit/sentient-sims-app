import { Repository } from './Repository';
import { MemoryEntity, MemoryRow, toMemoryEntity } from './entities/MemoryEntity';
import { MemoryEmbeddingEntity, MemoryIndexEntity, MemoryWithIndex } from './entities/MemoryIndexEntity';

// memory_index row as read with safeIntegers() (INTEGER columns arrive as bigint).
type MemoryIndexRow = {
  memory_id: bigint;
  importance?: bigint | null;
};

type MemoryWithIndexRow = MemoryRow & {
  importance?: bigint | null;
  embedding?: Buffer | null;
  embedding_model?: string | null;
};

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
    };
  }

  getEmbedding(memoryId: string, embeddingModel: string): Buffer | undefined {
    const row = this.dbService
      .getDb()
      .prepare('SELECT embedding FROM memory_embedding WHERE memory_id = ? AND embedding_model = ?')
      .get([BigInt(memoryId), embeddingModel]) as { embedding: Buffer } | undefined;
    return row?.embedding;
  }

  // Annotation is fire-and-forget, so by the time it lands the memory may have been
  // deleted (or the db reloaded). The WHERE EXISTS guard makes a stale upsert a
  // silent no-op instead of a FOREIGN KEY error.
  upsertIndex(index: MemoryIndexEntity) {
    return this.dbService
      .getDb()
      .prepare(
        `INSERT OR REPLACE INTO memory_index(memory_id, importance)
         SELECT ?, ?
         WHERE EXISTS (SELECT 1 FROM memory WHERE id = ?)`,
      )
      .run([BigInt(index.memory_id), index.importance ?? null, BigInt(index.memory_id)]);
  }

  // One row per (memory, model): re-embedding under the same model replaces in place,
  // embedding under a new model adds a row and leaves every other model's vector intact.
  upsertEmbedding(embedding: MemoryEmbeddingEntity) {
    return this.dbService
      .getDb()
      .prepare(
        `INSERT OR REPLACE INTO memory_embedding(memory_id, embedding_model, embedding)
         SELECT ?, ?, ?
         WHERE EXISTS (SELECT 1 FROM memory WHERE id = ?)`,
      )
      .run([BigInt(embedding.memory_id), embedding.embedding_model, embedding.embedding, BigInt(embedding.memory_id)]);
  }

  // Drops every model's vector for a memory — for when its text changed and the stored
  // embeddings no longer describe it.
  deleteEmbeddings(memoryId: string) {
    return this.dbService
      .getDb()
      .prepare('DELETE FROM memory_embedding WHERE memory_id = ?')
      .run([BigInt(memoryId)]);
  }

  // Recent memories involving any of the given participants, joined with their retrieval
  // metadata (LEFT JOINs: rows the annotator hasn't reached yet still show up, with null
  // importance/embedding). Only the given model's embedding is joined — vectors from other
  // models aren't comparable to the query. Newest-first window that MemoryRetrievalService
  // scores in process.
  getRetrievalCandidates(participantIds: string[], limit: number, embeddingModel: string): MemoryWithIndex[] {
    if (participantIds.length === 0) {
      return [];
    }

    const placeholders = participantIds.map(() => '?').join(', ');
    const query = `
      SELECT DISTINCT memory.*, memory_index.importance, memory_embedding.embedding, memory_embedding.embedding_model
      FROM memory
      INNER JOIN memory_participants ON memory.id = memory_participants.memory_id
      LEFT JOIN memory_index ON memory_index.memory_id = memory.id
      LEFT JOIN memory_embedding ON memory_embedding.memory_id = memory.id AND memory_embedding.embedding_model = ?
      WHERE memory_participants.participant_id IN (${placeholders})
      ORDER BY memory.timestamp DESC, memory.id DESC
      LIMIT ?;
    `;

    const bigIntParticipantIds = participantIds.map((participantIdString) => BigInt(participantIdString));

    const rows = this.dbService
      .getDb()
      .prepare(query)
      .safeIntegers()
      .all([embeddingModel, ...bigIntParticipantIds, limit]) as MemoryWithIndexRow[];
    return rows.map(toMemoryWithIndex);
  }

  // Memories with no index row yet, or no stored embedding for the given model, oldest
  // first — the backfill work queue. Embeddings live per model, so a model the user has
  // used before is already fully covered and a brand-new model queues everything, without
  // either touching the other models' stored vectors.
  getUnindexedMemories(limit: number, embeddingModel: string): MemoryEntity[] {
    const rows = this.dbService
      .getDb()
      .prepare(
        `
          SELECT memory.* FROM memory
          LEFT JOIN memory_index ON memory_index.memory_id = memory.id
          LEFT JOIN memory_embedding ON memory_embedding.memory_id = memory.id AND memory_embedding.embedding_model = ?
          WHERE memory_index.memory_id IS NULL OR memory_embedding.memory_id IS NULL
          ORDER BY memory.timestamp ASC, memory.id ASC
          LIMIT ?;
        `,
      )
      .safeIntegers()
      .all([embeddingModel, limit]) as MemoryRow[];
    return rows.map(toMemoryEntity);
  }
}
