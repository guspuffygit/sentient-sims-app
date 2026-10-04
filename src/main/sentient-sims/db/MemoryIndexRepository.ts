import { Repository } from './Repository';
import { MemoryEntity, MemoryRow, toMemoryEntity } from './entities/MemoryEntity';
import { MemoryEmbeddingEntity, MemoryIndexEntity, MemoryWithIndex } from './entities/MemoryIndexEntity';

// memory_index row as read with safeIntegers() (INTEGER columns arrive as bigint).
type MemoryIndexRow = {
  memory_id: bigint;
  importance?: bigint | null;
  owner_participant_id?: bigint | null;
  game_day?: bigint | null;
};

type MemoryWithIndexRow = MemoryRow & {
  importance?: bigint | null;
  game_day?: bigint | null;
  embedding?: Buffer | null;
  embedding_model?: string | null;
  owner_participant_id?: bigint | null;
};

function toMemoryWithIndex(row: MemoryWithIndexRow): MemoryWithIndex {
  const { importance, game_day: gameDay, ...rest } = row;
  return {
    ...toMemoryEntity(rest),
    importance: importance === null || importance === undefined ? importance : Number(importance),
    game_day: gameDay === null || gameDay === undefined ? gameDay : Number(gameDay),
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
      owner_participant_id: row.owner_participant_id,
      game_day: row.game_day === null || row.game_day === undefined ? row.game_day : Number(row.game_day),
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
  // silent no-op instead of a FOREIGN KEY error. An undefined owner keeps whatever
  // owner the row already has — the annotator overwrites ratings, never privacy.
  //
  // INSERT OR REPLACE deletes the row and writes a new one, so every column this
  // statement does not name is lost. `game_day` (migration 019) was not carried through
  // when it was added, and the annotator runs on every memory that has text: on the live
  // save 11,474 of 11,499 rows had lost their day, and the 25 that kept one were all
  // outcome rows, which have no content to annotate (found 2026-09-05).
  upsertIndex(index: MemoryIndexEntity) {
    const owner = index.owner_participant_id === undefined ? null : index.owner_participant_id;
    return this.dbService
      .getDb()
      .prepare(
        `INSERT OR REPLACE INTO memory_index(memory_id, importance, owner_participant_id, game_day)
         SELECT ?, ?,
                COALESCE(?, (SELECT owner_participant_id FROM memory_index WHERE memory_id = ?)),
                (SELECT game_day FROM memory_index WHERE memory_id = ?)
         WHERE EXISTS (SELECT 1 FROM memory WHERE id = ?)`,
      )
      .run([
        BigInt(index.memory_id),
        index.importance ?? null,
        owner,
        BigInt(index.memory_id),
        BigInt(index.memory_id),
        BigInt(index.memory_id),
      ]);
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
  // ownerScope gates private rows: a memory with a non-null owner only surfaces when that
  // owner is in scope (a sim retrieving for itself, or a scene the owner is part of).
  // Omitted scope means shared rows only — privacy fails closed.
  getRetrievalCandidates(
    participantIds: string[],
    limit: number,
    embeddingModel: string,
    ownerScope: string[] = [],
    // Phase 3.1 H3: a second, smaller window restricted to memories involving these
    // people. Without it a question about Nancy could only ever surface Nancy memories
    // that happen to fall inside the newest-N window, so an old but highly relevant row
    // was unreachable no matter how well it scored. Unioned, not substituted: the recent
    // window is still what ordinary deliberation runs on.
    focusParticipantIds: string[] = [],
    focusLimit = 200,
  ): MemoryWithIndex[] {
    if (participantIds.length === 0) {
      return [];
    }

    const placeholders = participantIds.map(() => '?').join(', ');
    const ownerPlaceholders = ownerScope.map(() => '?').join(', ');
    const ownerFilter = ownerScope.length
      ? `AND (memory_index.owner_participant_id IS NULL OR memory_index.owner_participant_id IN (${ownerPlaceholders}))`
      : 'AND memory_index.owner_participant_id IS NULL';
    const columns = `memory.*, memory_index.importance, memory_embedding.embedding, memory_embedding.embedding_model,
        memory_index.owner_participant_id, memory_index.game_day`;
    const joins = `
      FROM memory
      INNER JOIN memory_participants ON memory.id = memory_participants.memory_id
      LEFT JOIN memory_index ON memory_index.memory_id = memory.id
      LEFT JOIN memory_embedding ON memory_embedding.memory_id = memory.id AND memory_embedding.embedding_model = ?`;
    const query = `
      SELECT DISTINCT ${columns}
      ${joins}
      WHERE memory_participants.participant_id IN (${placeholders})
        ${ownerFilter}
      ORDER BY memory.timestamp DESC, memory.id DESC
      LIMIT ?;
    `;

    const bigIntParticipantIds = participantIds.map((participantIdString) => BigInt(participantIdString));
    const bigIntOwnerScope = ownerScope.map((ownerId) => BigInt(ownerId));

    const rows = this.dbService
      .getDb()
      .prepare(query)
      .safeIntegers()
      .all([embeddingModel, ...bigIntParticipantIds, ...bigIntOwnerScope, limit]) as MemoryWithIndexRow[];

    const focusIds = focusParticipantIds.filter((focusId) => !participantIds.includes(focusId));
    if (focusIds.length > 0) {
      const focusPlaceholders = focusIds.map(() => '?').join(', ');
      // Same owner rules: the focus window must not become a way to read another sim's
      // private monologue by naming them.
      const focusQuery = `
        SELECT DISTINCT ${columns}
        ${joins}
        WHERE memory_participants.participant_id IN (${focusPlaceholders})
          ${ownerFilter}
        ORDER BY memory.timestamp DESC, memory.id DESC
        LIMIT ?;
      `;
      const focusRows = this.dbService
        .getDb()
        .prepare(focusQuery)
        .safeIntegers()
        .all([
          embeddingModel,
          ...focusIds.map((focusId) => BigInt(focusId)),
          ...bigIntOwnerScope,
          focusLimit,
        ]) as MemoryWithIndexRow[];
      const seen = new Set(rows.map((row) => String(row.id)));
      for (const row of focusRows) {
        if (!seen.has(String(row.id))) {
          seen.add(String(row.id));
          rows.push(row);
        }
      }
    }
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
          WHERE (memory_index.memory_id IS NULL OR memory_embedding.memory_id IS NULL)
            AND (memory.event_type IS NULL OR memory.event_type != 'outcome')
          ORDER BY memory.timestamp ASC, memory.id ASC
          LIMIT ?;
        `,
      )
      .safeIntegers()
      .all([embeddingModel, limit]) as MemoryRow[];
    return rows.map(toMemoryEntity);
  }
}
