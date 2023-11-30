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

export class MemoryRepository extends Repository {
  /**
   * Retrieves a memory by their ID. If the memory is not found in the
   * database, it throws an error.
   *
   * @param {number} memoryId - The unique identifier of the memory.
   * @returns {Promise<MemoryEntity>} A promise that resolves to the memory entity.
   */
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

  getMemoryParticipants(
    getMemoryParticipantsRequest: GetMemoryParticipantsRequest
  ): MemoryParticipantEntity[] {
    return this.dbService
      .getDb()
      .prepare('SELECT * FROM memory_participants WHERE memory_id = ?')
      .all([
        getMemoryParticipantsRequest.memory_id,
      ]) as MemoryParticipantEntity[];
  }

  getParticipantsMemories(
    getParticipantsMemoriesRequest: GetParticipantsMemoriesRequest
  ): MemoryEntity[] {
    const placeholders = getParticipantsMemoriesRequest.participant_ids
      .map(() => '?')
      .join(', ');

    const query = [
      'SELECT DISTINCT memory.*',
      'FROM memory',
      'INNER JOIN memory_participants ON memory.id = memory_participants.memory_id',
      `WHERE memory_participants.participant_id IN (${placeholders})`,
      'ORDER BY memory.timestamp DESC',
      'LIMIT 50',
    ].join('\n');

    log.info(query);

    return this.dbService
      .getDb()
      .prepare(query)
      .all(getParticipantsMemoriesRequest.participant_ids) as MemoryEntity[];
  }

  getMemories(): MemoryEntity[] {
    return this.dbService
      .getDb()
      .prepare('SELECT * FROM memory ORDER BY timestamp DESC LIMIT 50')
      .all() as MemoryEntity[];
  }

  updateMemory(memory: MemoryEntity) {
    return this.dbService
      .getDb()
      .prepare(
        'UPDATE memory SET pre_action = ?, observation = ?, content = ?, timestamp = ?, location_id = ? WHERE id = ?'
      )
      .run(
        memory.pre_action,
        memory.observation,
        memory.content,
        memory.timestamp,
        memory.location_id,
        memory.id
      );
  }

  updateMemoryParticipant(memoryParticipant: MemoryParticipantEntity) {
    return this.dbService
      .getDb()
      .prepare(
        'INSERT OR REPLACE INTO memory_participants(id, participant_id, memory_id) VALUES(?, ?, ?)'
      )
      .run([
        memoryParticipant.id,
        memoryParticipant.participant_id,
        memoryParticipant.memory_id,
      ]);
  }

  createMemory(createMemoryRequest: CreateMemoryRequest) {
    const createMemoryTransaction = this.dbService.getDb().transaction(() => {
      const updateMemoryResult = this.dbService
        .getDb()
        .prepare(
          'INSERT OR REPLACE INTO memory(id, pre_action, observation, content, timestamp, location_id) VALUES(?, ?, ?, ?, ?, ?)'
        )
        .run([
          createMemoryRequest.memory.id,
          createMemoryRequest.memory.pre_action,
          createMemoryRequest.memory.observation,
          createMemoryRequest.memory.content,
          createMemoryRequest.memory.timestamp,
          createMemoryRequest.memory.location_id,
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

    return this.getMemory({ id: Number(createdMemoryId) });
  }

  deleteMemory(deleteMemoryRequest: DeleteMemoryRequest) {
    return this.dbService
      .getDb()
      .prepare('DELETE FROM memory WHERE id = ?')
      .run([deleteMemoryRequest.id]);
  }

  deleteAllMemories() {
    return this.dbService.getDb().prepare('DELETE FROM memory').run();
  }
}
