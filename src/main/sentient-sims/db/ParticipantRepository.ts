import { GetParticipantRequest, GetParticipantsRequest } from '../models/GetParticipantsRequest';
import { defaultSimDescriptions } from '../descriptions/simDescriptions';
import { Repository } from './Repository';
import { ParticipantEntity } from './entities/ParticipantEntity';
import { ParticipantVoiceEntity } from './entities/ParticipantVoiceEntity';
import { ParticipantDTO } from './dto/ParticipantDTO';
import { notifySimsChanged } from '../util/notifyRenderer';
import { SaveGame } from '../models/SaveGame';

export class ParticipantRepository extends Repository {
  /**
   * Retrieves a participant by their ID. If the participant is not found in the
   * database, it returns a new ParticipantDTO with a description from default
   * sim descriptions if one exists.
   */
  getParticipant(participantRequest: GetParticipantRequest): ParticipantDTO {
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

    if (participant.description || result.length === 0) {
      this.updateParticipant(participant);
    }

    return participant;
  }

  getParticipants(getParticipantsRequest: GetParticipantsRequest): ParticipantDTO[] {
    return getParticipantsRequest.map((participantRequest) => this.getParticipant(participantRequest));
  }

  getAllParticipants(saveGame?: SaveGame): ParticipantDTO[] {
    const participants = this.dbService
      .getDb(saveGame)
      .prepare(
        `SELECT participant.*, participant_voice.voice_id, participant_voice.voice_name
         FROM participant
         LEFT JOIN participant_voice ON participant_voice.participant_id = participant.id`,
      )
      .safeIntegers()
      .all() as (ParticipantEntity & Pick<ParticipantVoiceEntity, 'voice_id' | 'voice_name'>)[];

    return participants.map((participantEntity) => {
      return {
        id: participantEntity.id.toString(),
        description: participantEntity.description,
        name: participantEntity.name,
        voiceId: participantEntity.voice_id ?? undefined,
        voiceName: participantEntity.voice_name ?? undefined,
      };
    });
  }

  // Read-only name lookup for a set of ids (no insert-or-replace side effects like getParticipant).
  getParticipantNames(ids: string[]): string[] {
    if (ids.length === 0) {
      return [];
    }

    const placeholders = ids.map(() => '?').join(', ');
    const rows = this.dbService
      .getDb()
      .prepare(`SELECT name FROM participant WHERE id IN (${placeholders})`)
      .safeIntegers()
      .all(ids.map((id) => BigInt(id))) as { name: string | null }[];

    return rows.map((row) => row.name).filter((name): name is string => Boolean(name));
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
    this.clearParticipantVoice(participant.id);
    notifySimsChanged();
    return result;
  }

  /**
   * Pins a sim to a specific ElevenLabs voice, or clears the pin so the sim goes back
   * to automatic voice casting. Stored separately from the participant row, see
   * migration 013.
   */
  setParticipantVoice(participantId: string, voice?: { voiceId?: string; voiceName?: string }) {
    if (!voice?.voiceId) {
      const cleared = this.clearParticipantVoice(participantId);
      notifySimsChanged();
      return cleared;
    }

    const result = this.dbService
      .getDb()
      .prepare('INSERT OR REPLACE INTO participant_voice(participant_id, voice_id, voice_name) VALUES(?, ?, ?)')
      .safeIntegers()
      .run([BigInt(participantId), voice.voiceId, voice.voiceName ?? null]);
    notifySimsChanged();
    return result;
  }

  // Voice ids keyed by participant id, for the sims that have an override set
  getParticipantVoices(participantIds: string[]): Map<string, string> {
    const voices = new Map<string, string>();
    if (participantIds.length === 0) {
      return voices;
    }

    const placeholders = participantIds.map(() => '?').join(', ');
    const rows = this.dbService
      .getDb()
      .prepare(`SELECT participant_id, voice_id FROM participant_voice WHERE participant_id IN (${placeholders})`)
      .safeIntegers()
      .all(participantIds.map((id) => BigInt(id))) as ParticipantVoiceEntity[];

    rows.forEach((row) => {
      if (row.voice_id) {
        voices.set(row.participant_id.toString(), row.voice_id);
      }
    });

    return voices;
  }

  private clearParticipantVoice(participantId: string) {
    return this.dbService
      .getDb()
      .prepare('DELETE FROM participant_voice WHERE participant_id = ?')
      .safeIntegers()
      .run([BigInt(participantId)]);
  }
}
