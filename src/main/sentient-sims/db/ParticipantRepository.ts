import {
  GetParticipantRequest,
  GetParticipantsRequest,
} from '../models/GetParticipantsRequest';
import { defaultSimDescriptions } from '../descriptions/simDescriptions';
import { Repository } from './Repository';
import { ParticipantEntity } from './entities/ParticipantEntity';

export class ParticipantRepository extends Repository {
  /**
   * Retrieves a participant by their ID. If the participant is not found in the
   * database, it returns a new ParticipantEntity with a description from default
   * sim descriptions if one exists.
   *
   * @param {number} participantId - The unique identifier of the participant.
   * @param {string} participantFullName - The full name of the participant used to retrieve the default description.
   * @returns {Promise<ParticipantEntity>} A promise that resolves to the participant entity.
   */
  async getParticipant(
    participantRequest: GetParticipantRequest
  ): Promise<ParticipantEntity> {
    const result = this.dbService
      .getDb()
      .prepare('SELECT * FROM participant WHERE id = ?')
      .all([participantRequest.id]) as ParticipantEntity[];
    if (result.length > 0) {
      return result[0];
    }

    return {
      id: participantRequest.id,
      description: defaultSimDescriptions.get(participantRequest.fullName),
    };
  }

  async getParticipants(
    getParticipantsRequest: GetParticipantsRequest
  ): Promise<ParticipantEntity[]> {
    const results: Promise<ParticipantEntity>[] = [];
    getParticipantsRequest.forEach((participantRequest) => {
      results.push(this.getParticipant(participantRequest));
    });
    return Promise.all(results);
  }

  getAllParticipants(): ParticipantEntity[] {
    return this.dbService
      .getDb()
      .prepare('SELECT * FROM participant')
      .all() as ParticipantEntity[];
  }

  /**
   * Updates an existing participant or inserts a new participant if they do not exist in the database.
   *
   * @param {ParticipantEntity} participant - The participant entity to update or insert.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  updateParticipant(participant: ParticipantEntity) {
    return this.dbService
      .getDb()
      .prepare(
        'INSERT OR REPLACE INTO participant(id, description) VALUES(?, ?)'
      )
      .run([participant.id, participant.description]);
  }

  deleteParticipant(participant: ParticipantEntity) {
    return this.dbService
      .getDb()
      .prepare('DELETE FROM participant WHERE id = ?')
      .run([participant.id]);
  }
}
