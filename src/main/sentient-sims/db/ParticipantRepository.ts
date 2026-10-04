import { GetParticipantRequest, GetParticipantsRequest } from '../models/GetParticipantsRequest';
import { defaultSimDescriptions } from '../descriptions/simDescriptions';
import { Repository } from './Repository';
import { ParticipantEntity } from './entities/ParticipantEntity';
import { ParticipantVoiceEntity } from './entities/ParticipantVoiceEntity';
import { ParticipantDTO } from './dto/ParticipantDTO';
import { notifySimsChanged } from '../util/notifyRenderer';
import { isPlaceholderName } from '../util/simAliases';
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

    // A placeholder fullName ("Sim <id>", empty) must never overwrite a real stored
    // name: once persisted it is served back by every name lookup forever (live
    // 2026-08-26: the Grim Reaper's row read "Sim 153992008478429871" and three sims
    // learned to call Death "Sim").
    const requestNameUsable = !isPlaceholderName(participantRequest.fullName);

    if (result.length > 0) {
      const storedName = result[0].name;
      const keepStored = !requestNameUsable && !isPlaceholderName(storedName);
      const participant: ParticipantDTO = {
        id: result[0].id.toString(),
        description: result[0].description,
        name: keepStored ? storedName : participantRequest.fullName,
      };

      if (storedName !== participant.name) {
        this.updateParticipant(participant);
      }

      return participant;
    }

    const participant: ParticipantDTO = {
      id: participantRequest.id,
      description: defaultSimDescriptions.get(participantRequest.fullName),
      name: requestNameUsable ? participantRequest.fullName : undefined,
    };

    if (participant.description || result.length === 0) {
      this.updateParticipant(participant);
    }

    return { ...participant, name: participantRequest.fullName };
  }

  // V-6: persist a GENERATED default description, but only while the character still has
  // none. The generation is fire-and-forget and can land minutes after the miss that
  // triggered it — by then the player may have written their own, and a machine-written
  // placeholder must never overwrite that. Returns whether the row was actually written.
  setDescriptionIfEmpty(participantId: string, description: string, name?: string): boolean {
    const result = this.dbService
      .getDb()
      .prepare(
        `UPDATE participant SET description = ?, description_generated = 1
         WHERE id = ? AND (description IS NULL OR TRIM(description) = '')`,
      )
      .safeIntegers()
      .run([description, BigInt(participantId)]);

    if (result.changes > 0) {
      notifySimsChanged();
      return true;
    }

    // No row at all yet (getParticipant only inserts when it has something to store)
    const existing = this.dbService
      .getDb()
      .prepare('SELECT id FROM participant WHERE id = ?')
      .safeIntegers()
      .all([BigInt(participantId)]) as ParticipantEntity[];
    if (existing.length === 0) {
      this.updateParticipant({ id: participantId, description, name }, { generated: true });
      return true;
    }

    return false;
  }

  /**
   * Drop a description the app wrote itself, so the next scene writes a fresh one.
   *
   * Phase 3.1 fix B: a description is generated once and never refreshed, so a sim who has
   * aged twice is still introduced to every scene as a teenager while the facts block one
   * line below says elder. Only a GENERATED description is cleared — whatever the player
   * wrote stays, staleness and all, because the alternative is deleting their writing.
   * Returns whether anything was actually cleared.
   */
  clearGeneratedDescription(participantId: string): boolean {
    const result = this.dbService
      .getDb()
      .prepare(
        `UPDATE participant SET description = NULL, description_generated = NULL
         WHERE id = ? AND description_generated = 1`,
      )
      .safeIntegers()
      .run([BigInt(participantId)]);
    if (result.changes > 0) {
      notifySimsChanged();
      return true;
    }
    return false;
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

  // Every name this save knows, for checking text that is about to be published to
  // everyone (see util/savedNames.ts). Unnamed rows are dropped.
  getAllNames(): string[] {
    const rows = this.dbService.getDb().prepare('SELECT name FROM participant WHERE name IS NOT NULL').all() as {
      name: string | null;
    }[];

    return rows.map((row) => row.name).filter((name): name is string => Boolean(name));
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

  // Ids mapped to names. getParticipantNames returns a bare list in database order with
  // the unknown ones dropped, so a caller cannot line it up with the ids it asked about -
  // zipping the two by index silently renames people, which is how the facts routes
  // reported one Sim's child under another Sim's name (found live 2026-09-03).
  getParticipantNameMap(ids: string[]): Record<string, string> {
    if (ids.length === 0) {
      return {};
    }

    const placeholders = ids.map(() => '?').join(', ');
    const rows = this.dbService
      .getDb()
      .prepare(`SELECT id, name FROM participant WHERE id IN (${placeholders})`)
      .safeIntegers()
      .all(ids.map((id) => BigInt(id))) as { id: bigint; name: string | null }[];

    const names: Record<string, string> = {};
    for (const row of rows) {
      if (row.name) {
        names[row.id.toString()] = row.name;
      }
    }
    return names;
  }

  // An UPSERT rather than INSERT OR REPLACE so the generated flag survives a write that
  // was not about the description at all: getParticipant re-writes the row whenever it
  // learns a sim's real name, and a REPLACE dropped the flag every time. The flag is kept
  // only while the description text is unchanged — a person editing the text has taken
  // ownership of it, and it must never be cleared out from under them afterwards.
  updateParticipant(participant: ParticipantDTO, options: { generated?: boolean } = {}) {
    const result = this.dbService
      .getDb()
      .prepare(
        `INSERT INTO participant(id, description, name, description_generated) VALUES(?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           description = excluded.description,
           description_generated = CASE
             WHEN excluded.description_generated = 1 THEN 1
             WHEN excluded.description IS participant.description THEN participant.description_generated
             ELSE NULL
           END`,
      )
      .safeIntegers()
      .run([BigInt(participant.id), participant.description, participant.name, options.generated ? 1 : null]);
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
