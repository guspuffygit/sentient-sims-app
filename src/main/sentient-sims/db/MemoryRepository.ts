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
  async getMemory(getMemoryRequest: GetMemoryRequest): Promise<MemoryEntity> {
    const query = `SELECT * FROM memory WHERE id = ?`;
    const result = await this.dbService.all(query, [getMemoryRequest.id]);
    if (result.length > 0) {
      return result[0];
    }

    throw Error(`Memory with id ${getMemoryRequest.id} not found.`);
  }

  async getMemoryParticipants(
    getMemoryParticipantsRequest: GetMemoryParticipantsRequest
  ): Promise<MemoryParticipantEntity[]> {
    const query = `SELECT * FROM memory_participants WHERE memory_id = ?`;
    return this.dbService.all(query, [getMemoryParticipantsRequest.memory_id]);
  }

  async getParticipantsMemories(
    getParticipantsMemoriesRequest: GetParticipantsMemoriesRequest
  ): Promise<MemoryEntity[]> {
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
    return this.dbService.all(
      query,
      getParticipantsMemoriesRequest.participant_ids
    );
  }

  async getMemories(): Promise<MemoryEntity[]> {
    const query = `SELECT * FROM memory ORDER BY timestamp DESC LIMIT 50`;
    return this.dbService.all(query, []);
  }

  /**
   * Updates an existing memory or inserts a new memory if they do not exist in the database.
   *
   * @param {MemoryEntity} memory - The memory entity to update or insert.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async updateMemory(memory: MemoryEntity) {
    return this.dbService.run(
      'INSERT OR REPLACE INTO memory(id, pre_action, observation, content, timestamp, location_id) VALUES(?, ?, ?, ?, ?, ?)',
      [
        memory.id,
        memory.pre_action,
        memory.observation,
        memory.content,
        memory.timestamp,
        memory.location_id,
      ]
    );
  }

  async updateMemoryParticipant(memoryParticipant: MemoryParticipantEntity) {
    return this.dbService.run(
      'INSERT OR REPLACE INTO memory_participants(id, participant_id, memory_id) VALUES(?, ?, ?)',
      [
        memoryParticipant.id,
        memoryParticipant.participant_id,
        memoryParticipant.memory_id,
      ]
    );
  }

  async createMemory(createMemoryRequest: CreateMemoryRequest) {
    try {
      await this.dbService.run('BEGIN TRANSACTION');
      const memoryId = await this.updateMemory(createMemoryRequest.memory);
      const results: Promise<number>[] = [];
      createMemoryRequest.participants.forEach((participant) => {
        results.push(
          this.updateMemoryParticipant({
            memory_id: memoryId,
            participant_id: participant.id,
          })
        );
      });
      await Promise.all(results);

      await this.dbService.run('COMMIT');

      return await this.getMemory({ id: memoryId });
    } catch (err: any) {
      try {
        this.dbService.run('ROLLBACK');
      } catch (_) {
        /* manually ignore cases where the sqlite3 automatically rolled back the transaction */
      }
      throw err;
    }
  }

  async deleteMemory(deleteMemoryRequest: DeleteMemoryRequest) {
    return this.dbService.run('DELETE FROM memory WHERE id = ?', [
      deleteMemoryRequest.id,
    ]);
  }

  async deleteAllMemories() {
    return this.dbService.run('DELETE FROM memory');
  }
}
