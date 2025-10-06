import { GetParticipantRequest, GetParticipantsRequest } from '../models/GetParticipantsRequest';
import { defaultSimDescriptions } from '../descriptions/simDescriptions';
import { Repository } from './Repository';
import { ParticipantEntity } from './entities/ParticipantEntity';
import { ParticipantDTO } from './dto/ParticipantDTO';
import { notifySimsChanged } from '../util/notifyRenderer';
import { SaveGame } from '../models/SaveGame';

export class ParticipantRepository extends Repository {
  /**
   * Retrieves a participant by their ID. If the participant is not found in the
   * database, it returns a new ParticipantDTO with a description from default
   * sim descriptions if one exists.
   */
  async getParticipant(participantRequest: GetParticipantRequest): Promise<ParticipantDTO> {
    const result = this.dbService
      .getDb()
      .prepare('SELECT * FROM participant WHERE id = ?')
      .safeIntegers()
      .all([BigInt(participantRequest.id)]) as ParticipantEntity[];

    if (result.length > 0) {
      const participant: ParticipantDTO = {
        id: result[0].id.toString(),
        description: result[0].description,
        name: participantRequest.fullName,
      };

      if (result[0]?.name !== participant.name) {
        this.updateParticipant(participant);
      }

      return participant;
    }

    const participant: ParticipantDTO = {
      id: participantRequest.id,
      description: defaultSimDescriptions.get(participantRequest.fullName),
      name: participantRequest.fullName,
    };

    if (participant.description) {
      this.updateParticipant(participant);
    }

    return participant;
  }

  async getParticipants(getParticipantsRequest: GetParticipantsRequest): Promise<ParticipantDTO[]> {
    const results: Promise<ParticipantDTO>[] = [];
    getParticipantsRequest.forEach((participantRequest) => {
      results.push(this.getParticipant(participantRequest));
    });
    return Promise.all(results);
  }

  getAllParticipants(saveGame?: SaveGame): ParticipantDTO[] {
    const participants = this.dbService
      .getDb(saveGame)
      .prepare('SELECT * FROM participant')
      .safeIntegers()
      .all() as ParticipantEntity[];

    return participants.map((participantEntity) => {
      return {
        id: participantEntity.id.toString(),
        description: participantEntity.description,
        name: participantEntity.name,
      };
    });
  }

  updateParticipant(participant: ParticipantDTO) {
    const result = this.dbService
      .getDb()
      .prepare('INSERT OR REPLACE INTO participant(id, description, name) VALUES(?, ?, ?)')
      .safeIntegers()
      .run([BigInt(participant.id), participant.description, participant.name]);
    notifySimsChanged();
    return result;
  }

  deleteParticipant(participant: ParticipantDTO) {
    const result = this.dbService
      .getDb()
      .prepare('DELETE FROM participant WHERE id = ?')
      .safeIntegers()
      .run([BigInt(participant.id)]);
    notifySimsChanged();
    return result;
  }
}
