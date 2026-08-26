import { GetParticipantRequest, GetParticipantsRequest } from '../models/GetParticipantsRequest';
import { defaultSimDescriptions } from '../descriptions/simDescriptions';
import { Repository } from './Repository';
import { ParticipantEntity } from './entities/ParticipantEntity';
import { ParticipantVoiceEntity } from './entities/ParticipantVoiceEntity';
import { ParticipantDTO } from './dto/ParticipantDTO';
import { notifySimsChanged } from '../util/notifyRenderer';
import { SaveGame } from '../models/SaveGame';
import { toVoiceType, VoiceType } from '../models/VoiceType';

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
    const db = this.dbService.getDb(saveGame);
    const participants = db.prepare('SELECT * FROM participant').safeIntegers().all() as ParticipantEntity[];
    const voiceRows = db.prepare('SELECT * FROM participant_voice').safeIntegers().all() as ParticipantVoiceEntity[];

    const voicesByParticipant = new Map<string, ParticipantDTO['voices']>();
    voiceRows.forEach((row) => {
      const voiceType = toVoiceType(row.voice_type);
      if (!row.voice_id || !voiceType) {
        return;
      }
      const participantId = row.participant_id.toString();
      const voices = voicesByParticipant.get(participantId) ?? {};
      voices[voiceType] = { voiceId: row.voice_id, voiceName: row.voice_name ?? undefined };
      voicesByParticipant.set(participantId, voices);
    });

    return participants.map((participantEntity) => {
      return {
        id: participantEntity.id.toString(),
        description: participantEntity.description,
        name: participantEntity.name,
        voices: voicesByParticipant.get(participantEntity.id.toString()),
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
   * Pins a sim to a specific voice of the given type, or clears that type's pin so the
   * sim goes back to automatic voice casting for it. Pins of other voice types are
   * untouched, so switching TTS providers keeps each provider's assignments. Stored
   * separately from the participant row, see migrations 013/015.
   */
  setParticipantVoice(participantId: string, voiceType: VoiceType, voice?: { voiceId?: string; voiceName?: string }) {
    if (!voice?.voiceId) {
      const cleared = this.dbService
        .getDb()
        .prepare('DELETE FROM participant_voice WHERE participant_id = ? AND voice_type = ?')
        .safeIntegers()
        .run([BigInt(participantId), voiceType.toString()]);
      notifySimsChanged();
      return cleared;
    }

    const result = this.dbService
      .getDb()
      .prepare(
        'INSERT OR REPLACE INTO participant_voice(participant_id, voice_type, voice_id, voice_name) VALUES(?, ?, ?, ?)',
      )
      .safeIntegers()
      .run([BigInt(participantId), voiceType.toString(), voice.voiceId, voice.voiceName ?? null]);
    notifySimsChanged();
    return result;
  }

  // Voice ids of the given type keyed by participant id, for the sims that have an override set
  getParticipantVoices(participantIds: string[], voiceType: VoiceType): Map<string, string> {
    const voices = new Map<string, string>();
    if (participantIds.length === 0) {
      return voices;
    }

    const placeholders = participantIds.map(() => '?').join(', ');
    const rows = this.dbService
      .getDb()
      .prepare(
        `SELECT participant_id, voice_type, voice_id FROM participant_voice
         WHERE voice_type = ? AND participant_id IN (${placeholders})`,
      )
      .safeIntegers()
      .all([voiceType.toString(), ...participantIds.map((id) => BigInt(id))]) as ParticipantVoiceEntity[];

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
