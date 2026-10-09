import log from 'electron-log';
import {
  CreateMemoryRequest,
  DeleteMemoryRequest,
  GetMemoryParticipantsRequest,
  GetMemoryRequest,
  GetParticipantsMemoriesRequest,
} from '../models/GetMemoryRequest';
import { Repository } from './Repository';
import { MemoryEntity, MemoryRow, toMemoryEntity, withDisplayContent } from './entities/MemoryEntity';
import { MemoryParticipantEntity } from './entities/MemoryParticipantEntity';
import { notifyMemoryDeleted, notifyMemoryEdited, notifyNewMemoryAdded } from '../util/notifyRenderer';
import { MemoryParticipantDTO } from './dto/MemoryParticipantDTO';
import {
  stripArtifacts,
  validateMemoryContent,
  NEAR_DUP_EVENT_TYPES,
  NEAR_DUP_JACCARD,
  trigramJaccard,
} from '../util/memoryHygiene';

export class MemoryRepository extends Repository {
  // The db layer can't depend on services, so annotation (importance/embedding into
  // memory_index) hooks in via this callback, wired up by ApiContext. Must never throw.
  private onMemoryUpserted?: (memory: MemoryEntity) => void;

  // Supplied by ApiContext (which owns the state cache); the repository must not reach
  // into services itself. Never throws - a missing day just means no stamp.
  private gameDayProvider?: () => number | undefined;

  setGameDayProvider(provider: () => number | undefined) {
    this.gameDayProvider = provider;
  }

  setOnMemoryUpserted(callback: (memory: MemoryEntity) => void) {
    this.onMemoryUpserted = callback;
  }

  getMemory(getMemoryRequest: GetMemoryRequest): MemoryEntity {
    const results = this.dbService
      .getDb()
      .prepare('SELECT * FROM memory WHERE id = ?')
      .safeIntegers()
      .all([BigInt(getMemoryRequest.id)]) as MemoryRow[];
    if (results.length > 0) {
      return toMemoryEntity(results[0]);
    }

    throw Error(`Memory with id ${getMemoryRequest.id} not found.`);
  }

  getMemoryParticipants(getMemoryParticipantsRequest: GetMemoryParticipantsRequest): MemoryParticipantDTO[] {
    const memoryParticipants = this.dbService
      .getDb()
      .prepare('SELECT * FROM memory_participants WHERE memory_id = ?')
      .safeIntegers()
      .all([BigInt(getMemoryParticipantsRequest.memory_id)]) as MemoryParticipantEntity[];

    return memoryParticipants.map((memoryParticipant) => {
      return {
        id: memoryParticipant.id === undefined ? undefined : Number(memoryParticipant.id),
        participant_id: memoryParticipant.participant_id.toString(),
        memory_id: memoryParticipant.memory_id.toString(),
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

    const rows = this.dbService.getDb().prepare(query).safeIntegers().all(bigIntParticipantIds) as MemoryRow[];
    return rows.map(toMemoryEntity);
  }

  // This list feeds the in-game memories window, which can't render a null content
  // (see withDisplayContent) — every row it hands out gets a string content.
  getMemories(): MemoryEntity[] {
    const memories = this.dbService
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
      .safeIntegers()
      .all() as MemoryRow[];

    return this.withNameTags(memories.map(toMemoryEntity)).map((memory) => withDisplayContent(memory));
  }

  // V-4: owner (memory_index) + participant names for the renderer's "Milo (thought):"
  // tags. One batched pass per list; a missing index/participant just leaves the tag off.
  withNameTags(memories: MemoryEntity[]): MemoryEntity[] {
    // Memory ids are strings app-side (64-bit game handles); bind them as bigint
    const ids = memories.map((memory) => memory.id).filter((id): id is string => typeof id === 'string');
    if (ids.length === 0) {
      return memories;
    }
    try {
      const placeholders = ids.map(() => '?').join(', ');
      const bigIntIds = ids.map((id) => BigInt(id));
      const owners = this.dbService
        .getDb()
        .prepare(`SELECT memory_id, owner_participant_id FROM memory_index WHERE memory_id IN (${placeholders})`)
        .safeIntegers()
        .all(bigIntIds) as { memory_id: bigint | number; owner_participant_id: bigint | number | null }[];
      const ownerByMemory = new Map<string, string>();
      owners.forEach((row) => {
        if (row.owner_participant_id !== null) {
          ownerByMemory.set(String(row.memory_id), String(row.owner_participant_id));
        }
      });
      const links = this.dbService
        .getDb()
        .prepare(
          `SELECT mp.memory_id AS memory_id, mp.participant_id AS participant_id, p.name AS name
           FROM memory_participants mp
           LEFT JOIN participant p ON p.id = mp.participant_id
           WHERE mp.memory_id IN (${placeholders})
           ORDER BY mp.id ASC`,
        )
        .safeIntegers()
        .all(bigIntIds) as { memory_id: bigint | number; participant_id: bigint | number; name: string | null }[];
      const namesByMemory = new Map<string, string[]>();
      const nameById = new Map<string, string>();
      links.forEach((row) => {
        const memoryId = String(row.memory_id);
        const participantId = String(row.participant_id);
        if (row.name) {
          nameById.set(participantId, row.name);
          const list = namesByMemory.get(memoryId) ?? [];
          if (!list.includes(row.name)) {
            list.push(row.name);
          }
          namesByMemory.set(memoryId, list);
        }
      });
      return memories.map((memory) => {
        if (memory.id === undefined) {
          return memory;
        }
        const owner = ownerByMemory.get(memory.id);
        return {
          ...memory,
          owner_participant_id: owner,
          owner_name: owner ? nameById.get(owner) : undefined,
          participant_names: namesByMemory.get(memory.id),
        };
      });
    } catch (error) {
      log.debug(`memory name tags skipped: ${String(error)}`);
      return memories;
    }
  }

  // The raw, non-reflection memories of a single scene, oldest first. A scene is identified by
  // its location and start time (no schema support needed): this is the "conversational cache"
  // that resets each time the player travels to a new location. Timestamps are SQLite
  // CURRENT_TIMESTAMP strings (UTC, second precision), so `since` must be in the same format.
  // Inner life (thought/monologue rows) is excluded: this transcript replays into SHARED
  // prompts (every actor's "Previously in this scene"), and one sim's private head must
  // never reach another sim's performance. Private rows travel only through owner-scoped
  // retrieval (memory_index.owner_participant_id).
  getSceneMemories(locationId: number, since: string): MemoryEntity[] {
    const rows = this.dbService
      .getDb()
      .prepare(
        `
          SELECT * FROM memory
          WHERE location_id = ? AND timestamp >= ?
            AND (event_type IS NULL OR event_type NOT IN ('reflection', 'thought', 'monologue'))
          ORDER BY timestamp ASC, id ASC;
        `,
      )
      .safeIntegers()
      .all([locationId, since]) as MemoryRow[];
    return rows.map(toMemoryEntity);
  }

  // Who each of these memories involves, keyed by memory id. Scene rows carry no participants
  // of their own, and a sexual act may only be replayed to the sims who were in it
  // (util/intimateScene). Chunked well under sqlite's bound-variable limit.
  getParticipantIdsForMemories(memoryIds: string[]): Map<string, string[]> {
    const byMemory = new Map<string, string[]>();
    const ids = memoryIds.filter((id) => /^\d+$/.test(id));
    for (let start = 0; start < ids.length; start += 500) {
      const chunk = ids.slice(start, start + 500);
      const rows = this.dbService
        .getDb()
        .prepare(
          `SELECT memory_id, participant_id FROM memory_participants
           WHERE memory_id IN (${chunk.map(() => '?').join(', ')})`,
        )
        .safeIntegers()
        .all(chunk.map((id) => BigInt(id))) as { memory_id: bigint; participant_id: bigint }[];
      rows.forEach((row) => {
        const key = row.memory_id.toString();
        const list = byMemory.get(key) ?? [];
        list.push(row.participant_id.toString());
        byMemory.set(key, list);
      });
    }
    return byMemory;
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

  // J1 (2026-09-04): one Sim's OWN reflections, by memory_index owner. Reflections are
  // first-person diary prose, and the prompt used to gather them world-wide (most recent
  // overall, most recent at the location, any author), which is how every briefing carried
  // other Sims' private days. A row with no owner (a save from before reflections were
  // owner-stamped) belongs to nobody and is returned for nobody.
  getRecentReflectionsByOwner(ownerId: string, limit: number): MemoryEntity[] {
    let owner: bigint;
    try {
      owner = BigInt(ownerId);
    } catch {
      return [];
    }
    const rows = this.dbService
      .getDb()
      .prepare(
        `
          SELECT memory.* FROM memory
          INNER JOIN memory_index ON memory_index.memory_id = memory.id
          WHERE memory.event_type = 'reflection' AND memory_index.owner_participant_id = ?
          ORDER BY memory.timestamp DESC, memory.id DESC
          LIMIT ?;
        `,
      )
      .safeIntegers()
      .all([owner, limit]) as MemoryRow[];
    return rows.map(toMemoryEntity);
  }

  getRecentReflections(limit: number): MemoryEntity[] {
    const rows = this.dbService
      .getDb()
      .prepare(
        `
          SELECT * FROM memory
          WHERE event_type = 'reflection'
          ORDER BY timestamp DESC, id DESC
          LIMIT ?;
        `,
      )
      .safeIntegers()
      .all([limit]) as MemoryRow[];
    return rows.map(toMemoryEntity);
  }

  getRecentReflectionsForLocation(locationId: number, limit: number): MemoryEntity[] {
    const rows = this.dbService
      .getDb()
      .prepare(
        `
          SELECT * FROM memory
          WHERE event_type = 'reflection' AND location_id = ?
          ORDER BY timestamp DESC, id DESC
          LIMIT ?;
        `,
      )
      .safeIntegers()
      .all([locationId, limit]) as MemoryRow[];
    return rows.map(toMemoryEntity);
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

    const rows = this.dbService
      .getDb()
      .prepare(query)
      .safeIntegers()
      .all([...bigIntParticipantIds, limit]) as MemoryRow[];
    return rows.map(toMemoryEntity);
  }

  // What one Sim actually DID on one game day, oldest first — the oracle for the battery's
  // "what did you do earlier today".
  //
  // The battery used to ask getRecentReflectionsForParticipants for this, which is wrong
  // twice over and was wrong live on 2026-09-05: a reflection lists everyone who was in the
  // scene as a participant, so a toddler's "today" came back as his parents' diaries about
  // him, and nothing bounded it to today at all. His own row — 'tried dance and it was
  // canceled' — was not in the set, so a correct answer had nothing to be graded against.
  //
  // So: rows this Sim took part in, on this game day, minus OTHER Sims' diary prose. His own
  // reflection stays; it is a first-person account of his day, which is exactly the question.
  //
  // game_day is a HINT here, never a requirement, and that is not tidiness - requiring it
  // returned nothing at all. Measured on the live save 2026-09-05: 30,378 of ~30,522
  // memory_index rows have game_day NULL, against 13 on the current day. The stamp is
  // written on create but only `if (gameDay !== undefined)`, and gameDayProvider is
  // undefined whenever no state report is loaded, so most rows never get one. Ehren had
  // 1,188 rows and none on day 605; the question was not built at all, which is worse than
  // the bug it replaced. So an unstamped row is included and a row stamped with a DIFFERENT
  // day is excluded, and the most-recent-N bound does the rest of the work: a Sim makes
  // enough rows in a day that its newest `limit` are today's whether or not anyone said so.
  // As stamping improves this tightens on its own and needs no second change.
  getOwnDayMemories(participantId: string, gameDay: number, limit: number): MemoryEntity[] {
    let participant: bigint;
    try {
      participant = BigInt(participantId);
    } catch {
      return [];
    }
    const rows = this.dbService
      .getDb()
      .prepare(
        `
          SELECT DISTINCT memory.* FROM memory
          INNER JOIN memory_participants ON memory_participants.memory_id = memory.id
          LEFT JOIN memory_index ON memory_index.memory_id = memory.id
          WHERE memory_participants.participant_id = ?
            AND (memory_index.game_day IS NULL OR memory_index.game_day = ?)
            AND (memory.event_type IS NULL
                 OR memory.event_type != 'reflection'
                 OR memory_index.owner_participant_id = ?)
          ORDER BY memory.timestamp DESC, memory.id DESC
          LIMIT ?;
        `,
      )
      .safeIntegers()
      .all([participant, gameDay, participant, limit]) as MemoryRow[];
    // Newest-first is how the LIMIT has to bite; oldest-first is how a day reads.
    return rows.map(toMemoryEntity).reverse();
  }

  updateMemory(memory: MemoryEntity) {
    if (memory.id === undefined) {
      throw Error('Cannot update a memory without an id');
    }

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
        BigInt(memory.id),
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
      .run([memoryParticipant.id, BigInt(memoryParticipant.participant_id), BigInt(memoryParticipant.memory_id)]);
  }

  private findRecentEcho(owner: string, content: string): { id: string; score: number } | undefined {
    try {
      const rows = this.dbService
        .getDb()
        .prepare(
          `SELECT m.id AS id, m.content AS content
           FROM memory m
           LEFT JOIN memory_index mi ON mi.memory_id = m.id
           LEFT JOIN memory_participants mp ON mp.memory_id = m.id
           WHERE m.event_type IN ('thought', 'monologue', 'reflection')
             AND m.timestamp >= datetime('now', '-30 minutes')
             AND (mi.owner_participant_id = ? OR mp.participant_id = ?)
           GROUP BY m.id
           ORDER BY m.id DESC LIMIT 8`,
        )
        .safeIntegers()
        .all([BigInt(owner), BigInt(owner)]) as { id: bigint | number; content: string | null }[];
      for (const row of rows) {
        if (!row.content) {
          continue;
        }
        const score = trigramJaccard(row.content, content);
        if (score >= NEAR_DUP_JACCARD) {
          return { id: String(row.id), score };
        }
      }
    } catch (error) {
      log.debug(`near-duplicate check skipped: ${String(error)}`);
    }
    return undefined;
  }

  createMemory(
    createMemoryRequest: CreateMemoryRequest,
    options?: { notifyMod?: boolean; modDisplayAction?: string },
  ): MemoryEntity | undefined {
    // Refuse-to-persist gate: refusals, leaked prompt scaffolding, and no-text rows are
    // permanent retrieval poison once written (~8% of the playtest DB). Outcome rows
    // legitimately carry their text in observation, so content-less rows pass as long
    // as an observation exists.
    const incoming = createMemoryRequest.memory;
    if (incoming.content) {
      incoming.content = stripArtifacts(incoming.content);
    }
    if (incoming.content) {
      const validation = validateMemoryContent(incoming.content);
      if (!validation.ok) {
        log.warn(
          `Memory rejected (${validation.reason}) event_type=${incoming.event_type ?? 'unknown'} ` +
            `interaction=${incoming.interaction_name ?? ''}`,
        );
        return undefined;
      }
    } else if (!incoming.observation && !incoming.pre_action) {
      // Outcome rows carry their text in observation; pre-action fallback rows keep the
      // pre_action so the memories window can still render the beat. A row with no text
      // anywhere is pure junk.
      log.warn(
        `Memory rejected (no content, observation, or pre_action) event_type=${incoming.event_type ?? 'unknown'} ` +
          `interaction=${incoming.interaction_name ?? ''}`,
      );
      return undefined;
    }

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
        .safeIntegers()
        .get([createMemoryRequest.memory.content, createMemoryRequest.memory.location_id]) as
        | { id: bigint }
        | undefined;
      if (duplicate) {
        log.info(`Memory create skipped: identical recent content already stored as memory ${duplicate.id}`);
        return this.getMemory({ id: duplicate.id.toString() });
      }
    }

    // N-6: store-time echo suppression for a mind's own inner rows. Same owner (index
    // owner, else the sole participant), last 8 thought/monologue/reflection rows within
    // 30 minutes, trigram Jaccard >= 0.85 -> skip. Dialogue/outcome rows are untouched
    // (the private/shared split and the diaries depend on them landing).
    if (
      createMemoryRequest.memory.id === undefined &&
      createMemoryRequest.memory.content &&
      NEAR_DUP_EVENT_TYPES.has(createMemoryRequest.memory.event_type ?? '')
    ) {
      const owner =
        createMemoryRequest.index?.owner ??
        (createMemoryRequest.participants.length === 1 ? createMemoryRequest.participants[0].id : undefined);
      if (owner) {
        const echo = this.findRecentEcho(owner, createMemoryRequest.memory.content);
        if (echo) {
          log.info(
            `Memory create skipped: near-duplicate of memory ${echo.id} (jaccard ${echo.score.toFixed(2)}) for owner ${owner}`,
          );
          return this.getMemory({ id: echo.id });
        }
      }
    }

    const createMemoryTransaction = this.dbService.getDb().transaction(() => {
      const updateMemoryResult = this.dbService
        .getDb()
        .prepare(
          'INSERT OR REPLACE INTO memory(id, pre_action, observation, content, location_id, action, event_type, interaction_name) VALUES(?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .safeIntegers()
        .run([
          createMemoryRequest.memory.id === undefined ? undefined : BigInt(createMemoryRequest.memory.id),
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
          memory_id: updateMemoryResult.lastInsertRowid.toString(),
          participant_id: participant.id,
        });
      });

      // The game day this memory was made on, so retrieval can decay on the clock the
      // sim lives in rather than on wall-clock hours. Written for EVERY memory, not just
      // ones carrying an index, because "how long ago was this for the sim" is not a
      // property only private rows have. Undefined with no state report loaded (the
      // scenario tester, tests, the main menu) and retrieval falls back to real time.
      const gameDay = this.gameDayProvider?.();
      if (gameDay !== undefined) {
        this.dbService
          .getDb()
          .prepare(
            `INSERT INTO memory_index(memory_id, game_day)
             VALUES(?, ?)
             ON CONFLICT(memory_id) DO UPDATE SET game_day = COALESCE(memory_index.game_day, excluded.game_day)`,
          )
          .run([updateMemoryResult.lastInsertRowid, gameDay]);
      }

      if (createMemoryRequest.index) {
        // Inside the transaction so a private row is never observable without its owner.
        // COALESCE keeps whatever the deferred annotator may already have written.
        const { owner, importance } = createMemoryRequest.index;
        this.dbService
          .getDb()
          .prepare(
            `INSERT INTO memory_index(memory_id, importance, owner_participant_id)
             VALUES(?, ?, ?)
             ON CONFLICT(memory_id) DO UPDATE SET
               importance = COALESCE(excluded.importance, importance),
               owner_participant_id = COALESCE(excluded.owner_participant_id, owner_participant_id)`,
          )
          .run([updateMemoryResult.lastInsertRowid, importance ?? null, owner ? BigInt(owner) : null]);
      }

      return updateMemoryResult.lastInsertRowid;
    });

    const createdMemoryId = createMemoryTransaction();

    const memory = this.withNameTags([this.getMemory({ id: createdMemoryId.toString() })])[0];

    notifyNewMemoryAdded(memory, options);

    log.info(`Memory added:\n${JSON.stringify(memory, null, 2)}`);

    this.onMemoryUpserted?.(memory);

    return memory;
  }

  deleteMemory(deleteMemoryRequest: DeleteMemoryRequest) {
    const result = this.dbService
      .getDb()
      .prepare('DELETE FROM memory WHERE id = ?')
      .run([BigInt(deleteMemoryRequest.id)]);

    notifyMemoryDeleted(deleteMemoryRequest);

    return result;
  }

  deleteAllMemories() {
    return this.dbService.getDb().prepare('DELETE FROM memory').run();
  }
}
