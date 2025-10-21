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

  updateMemory(memory: MemoryEntity) {
    const result = this.dbService
      .getDb()
      .prepare(
        'UPDATE memory SET pre_action = ?, observation = ?, content = ?, timestamp = ?, location_id = ?, action = ? WHERE id = ?',
      )
      .run(
        memory.pre_action,
        memory.observation,
        memory.content,
        memory.timestamp,
        memory.location_id,
        memory.action,
        memory.id,
      );

    notifyMemoryEdited(memory);

    return result;
  }

  updateMemoryParticipant(memoryParticipant: MemoryParticipantDTO) {
    return this.dbService
      .getDb()
      .prepare('INSERT OR REPLACE INTO memory_participants(id, participant_id, memory_id) VALUES(?, ?, ?)')
      .safeIntegers()
      .run([memoryParticipant.id, BigInt(memoryParticipant.participant_id), memoryParticipant.memory_id]);
  }

  createMemory(createMemoryRequest: CreateMemoryRequest) {
    const createMemoryTransaction = this.dbService.getDb().transaction(() => {
      const updateMemoryResult = this.dbService
        .getDb()
        .prepare(
          'INSERT OR REPLACE INTO memory(id, pre_action, observation, content, location_id, action) VALUES(?, ?, ?, ?, ?, ?)',
        )
        .run([
          createMemoryRequest.memory.id,
          createMemoryRequest.memory.pre_action,
          createMemoryRequest.memory.observation,
          createMemoryRequest.memory.content,
          createMemoryRequest.memory.location_id,
          createMemoryRequest.memory.action,
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

    notifyNewMemoryAdded(memory);

    log.info(`Memory added:\n${JSON.stringify(memory, null, 2)}`);

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
