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
    const query = `SELECT * FROM participant WHERE id = ?`;
    const result = await this.dbService.all(query, [participantRequest.id]);
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

  /**
   * Updates an existing participant or inserts a new participant if they do not exist in the database.
   *
   * @param {ParticipantEntity} participant - The participant entity to update or insert.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async updateParticipant(participant: ParticipantEntity) {
    return this.dbService.run(
      'INSERT OR REPLACE INTO participant(id, description) VALUES(?, ?)',
      [participant.id, participant.description]
    );
  }

  async deleteParticipant(participant: ParticipantEntity) {
    return this.dbService.run('DELETE FROM participant WHERE id = ?', [
      participant.id,
    ]);
  }
}
