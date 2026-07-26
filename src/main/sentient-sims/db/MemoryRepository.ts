import log from 'electron-log';
import {
  CreateMemoryRequest,
  DeleteMemoryRequest,
  GetMemoryParticipantsRequest,
  GetMemoryRequest,
  GetParticipantsMemoriesRequest,
} from '../models/GetMemoryRequest';
import { Repository } from './Repository';
import { MemoryEntity } from './entities/MemoryEntity';
import { MemoryParticipantEntity } from './entities/MemoryParticipantEntity';
import { notifyMemoryDeleted, notifyMemoryEdited, notifyNewMemoryAdded } from '../util/notifyRenderer';
import { MemoryParticipantDTO } from './dto/MemoryParticipantDTO';

export class MemoryRepository extends Repository {
  // The db layer can't depend on services, so annotation (importance/embedding into
  // memory_index) hooks in via this callback, wired up by ApiContext. Must never throw.
  private onMemoryUpserted?: (memory: MemoryEntity) => void;

  setOnMemoryUpserted(callback: (memory: MemoryEntity) => void) {
    this.onMemoryUpserted = callback;
  }

  getMemory(getMemoryRequest: GetMemoryRequest): MemoryEntity {
    const results = this.dbService
      .getDb()
      .prepare('SELECT * FROM memory WHERE id = ?')
      .all([getMemoryRequest.id]) as MemoryEntity[];
    if (results.length > 0) {
      return results[0];
    }

    throw Error(`Memory with id ${getMemoryRequest.id} not found.`);
  }

  getMemoryParticipants(getMemoryParticipantsRequest: GetMemoryParticipantsRequest): MemoryParticipantDTO[] {
    const memoryParticipants = this.dbService
      .getDb()
      .prepare('SELECT * FROM memory_participants WHERE memory_id = ?')
      .all([getMemoryParticipantsRequest.memory_id]) as MemoryParticipantEntity[];

    return memoryParticipants.map((memoryParticipant) => {
      return {
        id: memoryParticipant.id,
        participant_id: memoryParticipant.participant_id.toString(),
        memory_id: memoryParticipant.memory_id,
      };
    });
  }

  getParticipantsMemories(getParticipantsMemoriesRequest: GetParticipantsMemoriesRequest): MemoryEntity[] {
    const placeholders = getParticipantsMemoriesRequest.participant_ids.map(() => '?').join(', ');

    const query = `
      SELECT * FROM (
        SELECT DISTINCT memory.*
        FROM memory
        INNER JOIN memory_participants ON memory.id = memory_participants.memory_id
        WHERE memory_participants.participant_id IN (${placeholders})
        ORDER BY memory.timestamp DESC
        LIMIT 100
      ) AS subquery
      ORDER BY subquery.timestamp ASC;
    `;

    const bigIntParticipantIds = getParticipantsMemoriesRequest.participant_ids.map((participantIdString) =>
      BigInt(participantIdString),
    );

    return this.dbService.getDb().prepare(query).all(bigIntParticipantIds) as MemoryEntity[];
  }

  getMemories(): MemoryEntity[] {
    return this.dbService
      .getDb()
      .prepare(
        `
          SELECT * FROM (
            SELECT * FROM memory
            ORDER BY timestamp DESC
            LIMIT 100
          ) AS subquery
          ORDER BY subquery.timestamp ASC;
        `,
      )
      .all() as MemoryEntity[];
  }

  // The raw, non-reflection memories of a single scene, oldest first. A scene is identified by
  // its location and start time (no schema support needed): this is the "conversational cache"
  // that resets each time the player travels to a new location. Timestamps are SQLite
  // CURRENT_TIMESTAMP strings (UTC, second precision), so `since` must be in the same format.
  getSceneMemories(locationId: number, since: string): MemoryEntity[] {
    return this.dbService
      .getDb()
      .prepare(
        `
          SELECT * FROM memory
          WHERE location_id = ? AND timestamp >= ? AND (event_type IS NULL OR event_type != 'reflection')
          ORDER BY timestamp ASC, id ASC;
        `,
      )
      .all([locationId, since]) as MemoryEntity[];
  }

  // Distinct participant ids that took part in a scene, used to link a scene reflection back to
  // everyone who was present.
  getSceneParticipantIds(locationId: number, since: string): string[] {
    const rows = this.dbService
      .getDb()
      .prepare(
        `
          SELECT DISTINCT memory_participants.participant_id AS participant_id
          FROM memory_participants
          INNER JOIN memory ON memory.id = memory_participants.memory_id
          WHERE memory.location_id = ? AND memory.timestamp >= ?
            AND (memory.event_type IS NULL OR memory.event_type != 'reflection');
        `,
      )
      .safeIntegers()
      .all([locationId, since]) as { participant_id: bigint }[];

    return rows.map((row) => row.participant_id.toString());
  }

  getRecentReflections(limit: number): MemoryEntity[] {
    return this.dbService
      .getDb()
      .prepare(
        `
          SELECT * FROM memory
          WHERE event_type = 'reflection'
          ORDER BY timestamp DESC, id DESC
          LIMIT ?;
        `,
      )
      .all([limit]) as MemoryEntity[];
  }

  getRecentReflectionsForLocation(locationId: number, limit: number): MemoryEntity[] {
    return this.dbService
      .getDb()
      .prepare(
        `
          SELECT * FROM memory
          WHERE event_type = 'reflection' AND location_id = ?
          ORDER BY timestamp DESC, id DESC
          LIMIT ?;
        `,
      )
      .all([locationId, limit]) as MemoryEntity[];
  }

  getRecentReflectionsForParticipants(participantIds: string[], limit: number): MemoryEntity[] {
    if (participantIds.length === 0) {
      return [];
    }

    const placeholders = participantIds.map(() => '?').join(', ');
    const query = `
      SELECT DISTINCT memory.*
      FROM memory
      INNER JOIN memory_participants ON memory.id = memory_participants.memory_id
      WHERE memory.event_type = 'reflection' AND memory_participants.participant_id IN (${placeholders})
      ORDER BY memory.timestamp DESC, memory.id DESC
      LIMIT ?;
    `;

    const bigIntParticipantIds = participantIds.map((participantIdString) => BigInt(participantIdString));

    return this.dbService
      .getDb()
      .prepare(query)
      .all([...bigIntParticipantIds, limit]) as MemoryEntity[];
  }

  updateMemory(memory: MemoryEntity) {
    const result = this.dbService
      .getDb()
      .prepare(
        'UPDATE memory SET pre_action = ?, observation = ?, content = ?, timestamp = ?, location_id = ?, action = ?, event_type = ?, interaction_name = ? WHERE id = ?',
      )
      .run(
        memory.pre_action,
        memory.observation,
        memory.content,
        memory.timestamp,
        memory.location_id,
        memory.action,
        memory.event_type,
        memory.interaction_name,
        memory.id,
      );

    notifyMemoryEdited(memory);

    this.onMemoryUpserted?.(memory);

    return result;
  }

  updateMemoryParticipant(memoryParticipant: MemoryParticipantDTO) {
    return this.dbService
      .getDb()
      .prepare('INSERT OR REPLACE INTO memory_participants(id, participant_id, memory_id) VALUES(?, ?, ?)')
      .safeIntegers()
      .run([memoryParticipant.id, BigInt(memoryParticipant.participant_id), memoryParticipant.memory_id]);
  }

  createMemory(createMemoryRequest: CreateMemoryRequest, options?: { notifyMod?: boolean }) {
    // A scene transcript can be POSTed back once per completing interaction (live, a hug
    // SI and the chat SI it rode on both completed and stored the same dialogue twice —
    // both then get embedded, retrieved, and fed to "Previously in this scene"). Exact
    // content duplicates at the same location within the paced-scene window are dropped.
    if (createMemoryRequest.memory.id === undefined && createMemoryRequest.memory.content) {
      const duplicate = this.dbService
        .getDb()
        .prepare(
          "SELECT id FROM memory WHERE content = ? AND location_id = ? AND timestamp >= datetime('now', '-5 minutes') ORDER BY id DESC LIMIT 1",
        )
        .get([createMemoryRequest.memory.content, createMemoryRequest.memory.location_id]) as
        | { id: number }
        | undefined;
      if (duplicate) {
        log.info(`Memory create skipped: identical recent content already stored as memory ${duplicate.id}`);
        return this.getMemory({ id: duplicate.id });
      }
    }

    const createMemoryTransaction = this.dbService.getDb().transaction(() => {
      const updateMemoryResult = this.dbService
        .getDb()
        .prepare(
          'INSERT OR REPLACE INTO memory(id, pre_action, observation, content, location_id, action, event_type, interaction_name) VALUES(?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .run([
          createMemoryRequest.memory.id,
          createMemoryRequest.memory.pre_action,
          createMemoryRequest.memory.observation,
          createMemoryRequest.memory.content,
          createMemoryRequest.memory.location_id,
          createMemoryRequest.memory.action,
          createMemoryRequest.memory.event_type,
          createMemoryRequest.memory.interaction_name,
        ]);

      createMemoryRequest.participants.forEach((participant) => {
        this.updateMemoryParticipant({
          memory_id: Number(updateMemoryResult.lastInsertRowid),
          participant_id: participant.id,
        });
      });

      return updateMemoryResult.lastInsertRowid;
    });

    const createdMemoryId = createMemoryTransaction();

    const memory = this.getMemory({ id: Number(createdMemoryId) });

    notifyNewMemoryAdded(memory, options);

    log.info(`Memory added:\n${JSON.stringify(memory, null, 2)}`);

    this.onMemoryUpserted?.(memory);

    return memory;
  }

  deleteMemory(deleteMemoryRequest: DeleteMemoryRequest) {
    const result = this.dbService.getDb().prepare('DELETE FROM memory WHERE id = ?').run([deleteMemoryRequest.id]);

    notifyMemoryDeleted(deleteMemoryRequest);

    return result;
  }

  deleteAllMemories() {
    return this.dbService.getDb().prepare('DELETE FROM memory').run();
  }
}
