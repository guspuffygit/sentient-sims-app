import log from 'electron-log';
import { Database } from 'better-sqlite3';
import { MemoryEntity } from './entities/MemoryEntity';

export type DbMigrationSql = ((db: Database) => void) | string;

export type DbMigration = {
  name: string;
  sql: DbMigrationSql;
};

export const migrations: Map<string, DbMigrationSql> = new Map(
  Object.entries({
    '001-create-participant-table': `
      CREATE TABLE participant (
        id                   INTEGER NOT NULL  PRIMARY KEY  ,
        description          TEXT
      );
    `,
    '002-create-location-table': `
      CREATE TABLE location (
        id                   INTEGER NOT NULL  PRIMARY KEY  ,
        name                 TEXT     ,
        lot_type             TEXT     ,
        description          TEXT
      );
    `,
    '003-create-memory-table': `
      CREATE TABLE memory (
        id                   INTEGER PRIMARY KEY  ,
        pre_action           TEXT     ,
        observation          TEXT     ,
        content              TEXT     ,
        timestamp            DATETIME DEFAULT CURRENT_TIMESTAMP ,
        location_id          INTEGER NOT NULL
      );
    `,
    '004-create-memory-participants-table': `
      CREATE TABLE memory_participants (
        id                   INTEGER PRIMARY KEY  ,
        participant_id       INTEGER NOT NULL    ,
        memory_id            INTEGER NOT NULL    ,
        FOREIGN KEY ( memory_id ) REFERENCES memory( id ) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `,
    '005-create-timestamps-for-null-timestamps': (db: Database) => {
      // I screwed up timestamp generation so everything is null in the database at this point
      // To fix it, we get the current timestamp and loop through everything and set their timestamps
      // to one second previous so that everything will get sorted in the database correctly going forward
      function hasNullTimestamp() {
        const result = db
          .prepare(
            `
              SELECT EXISTS (
                  SELECT 1 FROM memory
                  WHERE timestamp IS NULL
              ) AS has_null_timestamp;
            `,
          )
          .get() as { has_null_timestamp: number };

        return result.has_null_timestamp === 1;
      }

      if (hasNullTimestamp()) {
        log.info('Creating timestamps for null timestamps in the memory table');
        let currentTime = new Date();

        const rows = db
          .prepare(
            `
              SELECT id FROM memory
              WHERE timestamp IS NULL
              ORDER BY id DESC;
            `,
          )
          .all() as MemoryEntity[];
        log.info(`Creating timestamps for ${rows.length} rows in the memory table`);

        rows.forEach((memory) => {
          const newTimeStamp = currentTime.toISOString().replace('T', ' ').slice(0, -5);

          db.prepare(
            `
              UPDATE memory
              SET timestamp = ?
              WHERE id = ?;
            `,
          ).run(newTimeStamp, memory.id);

          // Subtract one second for the next timestamp
          currentTime = new Date(currentTime.getTime() - 1000);
        });
      }
    },
    '006-add-participant-name': `
      ALTER TABLE participant
      ADD COLUMN name TEXT;
    `,
    '007-add-action-memories': `
      ALTER TABLE memory
      ADD COLUMN action TEXT;
    `,
    '008-add-memories-event-type': `
      ALTER TABLE memory
      ADD COLUMN event_type TEXT;
    `,
    '009-add-interaction-name-to-memory': `
      ALTER TABLE memory
      ADD COLUMN interaction_name TEXT;
    `,
    '010-create-painting-table': `
      CREATE TABLE painting (
        uuid                 TEXT NOT NULL  PRIMARY KEY  ,
        instance_id          TEXT NOT NULL  UNIQUE  ,
        prompt               TEXT     ,
        image                BLOB     ,
        metadata             TEXT     ,
        created_at           DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `,
    // Scenes are derived from location_id + timestamp instead of a dedicated column: the mod
    // parses memory rows into a Python class with fixed fields, so any new column breaks it.
    // This cleans up databases that briefly ran an add-scene-id migration; no-op elsewhere.
    '011-remove-memory-scene-id': (db: Database) => {
      const columns = db.prepare('PRAGMA table_info(memory)').all() as { name: string }[];
      if (columns.some((column) => column.name === 'scene_id')) {
        log.info('Dropping scene_id column from memory table');
        db.prepare('ALTER TABLE memory DROP COLUMN scene_id').run();
      }
    },
    // Retrieval metadata lives in a sidecar table instead of new memory columns: the mod
    // parses memory rows into a Python class with fixed fields (see migration 011).
    // embedding is a Float32Array serialized to raw little-endian bytes.
    '012-create-memory-index': `
      CREATE TABLE memory_index (
        memory_id            INTEGER NOT NULL  PRIMARY KEY  ,
        importance           INTEGER  ,
        embedding            BLOB     ,
        embedding_model      TEXT     ,
        FOREIGN KEY ( memory_id ) REFERENCES memory( id ) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `,
    // Per-sim ElevenLabs voice overrides live in a sidecar table so the mod-facing
    // participant row keeps its shape. Deliberately no foreign key: updateParticipant
    // uses INSERT OR REPLACE, and a REPLACE-delete fires ON DELETE CASCADE, so an FK
    // here would wipe a sim's voice every time the mod refreshed their description.
    '013-create-participant-voice': `
      CREATE TABLE participant_voice (
        participant_id       INTEGER NOT NULL  PRIMARY KEY  ,
        voice_id             TEXT     ,
        voice_name           TEXT
      );
    `,
    // An embedding is only comparable to vectors from the model that produced it, so
    // embeddings move out of memory_index into their own table keyed by
    // (memory_id, embedding_model). Every model's vectors persist side by side: switching
    // embedding providers adds rows instead of overwriting, and switching back reuses the
    // already-stored work. memory_index keeps importance, which is model-independent.
    '014-move-embeddings-to-memory-embedding': (db: Database) => {
      db.prepare(
        `
          CREATE TABLE memory_embedding (
            memory_id            INTEGER NOT NULL    ,
            embedding_model      TEXT NOT NULL       ,
            embedding            BLOB NOT NULL       ,
            PRIMARY KEY ( memory_id, embedding_model ),
            FOREIGN KEY ( memory_id ) REFERENCES memory( id ) ON DELETE CASCADE ON UPDATE CASCADE
          );
        `,
      ).run();
      db.prepare(
        `
          INSERT INTO memory_embedding (memory_id, embedding_model, embedding)
          SELECT memory_id, embedding_model, embedding FROM memory_index
          WHERE embedding IS NOT NULL AND embedding_model IS NOT NULL;
        `,
      ).run();
      db.prepare('ALTER TABLE memory_index DROP COLUMN embedding').run();
      db.prepare('ALTER TABLE memory_index DROP COLUMN embedding_model').run();
    },
    // A sim keeps one pinned voice per voice type (ElevenLabs, Kokoro), so switching TTS
    // providers back and forth never loses either assignment. The table is rebuilt because
    // the primary key grows from participant_id to (participant_id, voice_type); existing
    // pins predate voice types and were always ElevenLabs voices.
    '015-participant-voice-per-voice-type': (db: Database) => {
      db.prepare(
        `
          CREATE TABLE participant_voice_typed (
            participant_id       INTEGER NOT NULL    ,
            voice_type           TEXT NOT NULL       ,
            voice_id             TEXT     ,
            voice_name           TEXT     ,
            PRIMARY KEY ( participant_id, voice_type )
          );
        `,
      ).run();
      db.prepare(
        `
          INSERT INTO participant_voice_typed (participant_id, voice_type, voice_id, voice_name)
          SELECT participant_id, 'elevenlabs', voice_id, voice_name FROM participant_voice
          WHERE voice_id IS NOT NULL;
        `,
      ).run();
      db.prepare('DROP TABLE participant_voice').run();
      db.prepare('ALTER TABLE participant_voice_typed RENAME TO participant_voice').run();
    },
    // Every provider call (ai_exchange) and the pipeline trace behind each memory
    // (memory_trace), persisted so the bench and the watches can read prompts back after an
    // app restart (Phase 3.0 F4); both were in-memory rings that died with the process.
    // memory_id is TEXT with no foreign key: memory ids are 64-bit game handles that travel
    // as strings everywhere in the app, createMemory uses INSERT OR REPLACE (a REPLACE-delete
    // fires ON DELETE CASCADE — see 013), and a deleted memory should still leave its
    // provenance readable. request, prompt_overflow, review and exchanges hold JSON;
    // memory_trace.exchanges references ai_exchange rows by id instead of storing a second
    // copy of each prompt.
    '016-create-ai-exchange-and-memory-trace': (db: Database) => {
      db.prepare(
        `
          CREATE TABLE ai_exchange (
            id                   INTEGER NOT NULL  PRIMARY KEY  ,
            at                   TEXT NOT NULL       ,
            label                TEXT NOT NULL       ,
            action_type          TEXT     ,
            stage_id             TEXT     ,
            api_type             TEXT     ,
            model                TEXT     ,
            duration_ms          INTEGER NOT NULL    ,
            prompt_chars         INTEGER NOT NULL    ,
            response_preview     TEXT NOT NULL       ,
            response_text        TEXT NOT NULL       ,
            request              TEXT NOT NULL       ,
            prompt_overflow      TEXT     ,
            error                TEXT     ,
            memory_id            TEXT
          );
        `,
      ).run();
      db.prepare('CREATE INDEX ai_exchange_memory_id ON ai_exchange(memory_id)').run();
      db.prepare(
        `
          CREATE TABLE memory_trace (
            memory_id            TEXT NOT NULL  PRIMARY KEY  ,
            pipeline             TEXT NOT NULL       ,
            director_direction   TEXT     ,
            review               TEXT     ,
            exchanges            TEXT NOT NULL
          );
        `,
      ).run();
    },
    // Every outcome the mod reported, with the verdict the app graded it as (Phase 3.0 F5).
    // The outcome memory row is what cognition reads; this is the provenance behind it, so
    // "did a phantom success get written during this probe?" is a query instead of a memory
    // of watching the log. Same memory_id rules as 016 (TEXT, no foreign key). game_clock
    // holds JSON; ran/late/unowned are 0/1 with NULL meaning "never observed" for ran.
    '017-create-action-outcome': (db: Database) => {
      db.prepare(
        `
          CREATE TABLE action_outcome (
            id                   INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT ,
            at                   TEXT NOT NULL       ,
            request_id           TEXT     ,
            sim_id               TEXT NOT NULL       ,
            action               TEXT     ,
            interaction_name     TEXT     ,
            outcome              TEXT NOT NULL       ,
            verdict              TEXT NOT NULL       ,
            decided_at           TEXT     ,
            claim                TEXT     ,
            push_id              TEXT     ,
            ran                  INTEGER     ,
            finishing            TEXT     ,
            sim_running          TEXT     ,
            game_clock           TEXT     ,
            dispatch_age_ms      INTEGER     ,
            late                 INTEGER NOT NULL    ,
            unowned              INTEGER NOT NULL    ,
            source               TEXT     ,
            cause                TEXT     ,
            reason               TEXT     ,
            memory_id            TEXT
          );
        `,
      ).run();
      db.prepare('CREATE INDEX action_outcome_request_id ON action_outcome(request_id)').run();
      db.prepare('CREATE INDEX action_outcome_memory_id ON action_outcome(memory_id)').run();
      db.prepare('CREATE INDEX action_outcome_verdict ON action_outcome(verdict)').run();
    },
    // The semantic fact store (Phase 3.1 H2): what each sim knows about themselves and
    // about everyone else, so a sim can answer "who are your parents" correctly instead of
    // inventing an answer from whatever happened to be in the prompt.
    //
    // Bi-temporal and invalidate-never-delete (the Graphiti/AtomMem pattern): a fact that
    // stops being true gets valid_to_day set, it is not removed, because "she used to be
    // married to him" is itself worth knowing and because a deleted row cannot explain a
    // belief. A row with object_sim_id is an EDGE, which makes this table a property graph
    // without a graph database.
    //
    // source is the trust ladder: game > player > reflection > told/inferred, enforced in
    // SemanticMemoryService.canSupersede. A sim told a lie stores it as `told` with low
    // confidence and the game fact still wins in <KNOWN_FACTS>.
    //
    // provenance_memory_id is TEXT with no foreign key, same rules as 016/017: memory ids
    // are 64-bit game handles that travel as strings, and a fact should still explain
    // itself after the memory row behind it is pruned.
    '018-create-sim-fact': (db: Database) => {
      db.prepare(
        `
          CREATE TABLE sim_fact (
            id                   INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT ,
            subject_sim_id       TEXT NOT NULL       ,
            predicate            TEXT NOT NULL       ,
            object_text          TEXT     ,
            object_sim_id        TEXT     ,
            source               TEXT NOT NULL       ,
            confidence           REAL NOT NULL       ,
            valid_from_day       INTEGER     ,
            valid_to_day         INTEGER     ,
            provenance_memory_id TEXT     ,
            superseded_by        INTEGER     ,
            created_at           TEXT NOT NULL
          );
        `,
      ).run();
      // The hot read is "every current fact about this sim", so the partial-shaped index
      // leads with the subject and the validity window.
      db.prepare('CREATE INDEX sim_fact_subject ON sim_fact(subject_sim_id, valid_to_day)').run();
      db.prepare('CREATE INDEX sim_fact_object ON sim_fact(object_sim_id, valid_to_day)').run();
      db.prepare('CREATE INDEX sim_fact_predicate ON sim_fact(subject_sim_id, predicate, valid_to_day)').run();
      db.prepare('CREATE INDEX sim_fact_provenance ON sim_fact(provenance_memory_id)').run();
      // The last dossier the mod sent, kept whole. The hash is how ingestion skips a
      // dossier that has not changed, and the json is the oracle the self-knowledge
      // battery grades answers against (H5) — a fact row cannot hold a relationship score.
      db.prepare(
        `
          CREATE TABLE sim_dossier (
            sim_id               TEXT NOT NULL  PRIMARY KEY  ,
            hash                 TEXT NOT NULL       ,
            json                 TEXT NOT NULL       ,
            updated_day          INTEGER     ,
            updated_at           TEXT NOT NULL
          );
        `,
      ).run();
    },
    // The game day a memory was made on (Phase 3.1 H3). memory.timestamp is real UTC, so
    // recency decay measured a sim's memories in wall-clock hours: at speed 3 a whole sim
    // week passes in real minutes, and everything looked equally fresh. A day here lets
    // retrieval decay on the clock the sim actually lives in. NULL for every row written
    // before this migration and for any row written with no state report loaded, in which
    // case retrieval falls back to real time exactly as before.
    '019-memory-index-game-day': (db: Database) => {
      db.prepare('ALTER TABLE memory_index ADD COLUMN game_day INTEGER').run();
    },
    // Which descriptions the app wrote itself (Phase 3.1 fix B). A description is
    // generated once, when the row is empty, and then never touched again — so a sim who
    // has aged twice since still gets introduced to every scene as a teenager. Refreshing
    // it means clearing it, and clearing a description the PLAYER wrote would be worse
    // than the staleness. This column is what tells the two apart: 1 for a generated one,
    // 0 or NULL for anything a person typed, including every row written before this.
    '020-participant-description-generated': (db: Database) => {
      db.prepare('ALTER TABLE participant ADD COLUMN description_generated INTEGER').run();
    },
    // Private memories (a sim's inner monologue) are owned by one participant: retrieval
    // for any other sim must never surface them. Lives in the memory_index sidecar because
    // the mod parses memory rows into a Python class with fixed fields (see migration 011).
    // NULL owner = shared memory, visible to everyone as before.
    // Shipped as 014 on our fork before 4.1.0 took that number; see RENAMED_MIGRATIONS.
    '021-add-memory-index-owner': `
      ALTER TABLE memory_index
      ADD COLUMN owner_participant_id INTEGER;
    `,
    // One row per sim per game day: the nightly planner's goals (validated against the
    // mod's goal_pool), the free-form persona sentence, and the discretionary action
    // loadout. Its own table, never memory columns (see migration 011); no FK to
    // participant for the same REPLACE-delete reason as participant_voice (013).
    // review is written the FOLLOWING night when the diary grades how the day went.
    // Shipped as 015 on our fork before 4.1.0 took that number; see RENAMED_MIGRATIONS.
    '022-create-daily-plan': `
      CREATE TABLE daily_plan (
        sim_id               TEXT NOT NULL  ,
        absolute_day         INTEGER NOT NULL  ,
        goals                TEXT     ,
        persona              TEXT     ,
        loadout              TEXT     ,
        source               TEXT     ,
        review               TEXT     ,
        created_at           DATETIME DEFAULT CURRENT_TIMESTAMP  ,
        PRIMARY KEY ( sim_id, absolute_day )
      );
    `,
  }),
);

const createDbMigrationsTable = (db: Database) => {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
  ).run();
};

const getAppliedMigrations = (db: Database): string[] => {
  const rows = db.prepare('SELECT name FROM migrations').all() as { name: string }[];
  return rows.map((row) => row.name);
};

// Two migrations first shipped on a fork under numbers 4.1.0 later used for its own
// (014-move-embeddings-to-memory-embedding, 015-participant-voice-per-voice-type), so
// they were renumbered. A database that applied them under the old names already has
// the column and the table; its ledger row is relabelled before the to-apply set is
// computed, so the migration neither runs twice (the DDL would throw) nor dangles.
export const RENAMED_MIGRATIONS: Record<string, string> = {
  '014-add-memory-index-owner': '021-add-memory-index-owner',
  '015-create-daily-plan': '022-create-daily-plan',
};

const relabelRenamedMigrations = (db: Database) => {
  const applied = getAppliedMigrations(db);
  Object.entries(RENAMED_MIGRATIONS).forEach(([oldName, newName]) => {
    if (!applied.includes(oldName)) {
      return;
    }
    if (applied.includes(newName)) {
      db.prepare('DELETE FROM migrations WHERE name = ?').run(oldName);
    } else {
      db.prepare('UPDATE migrations SET name = ? WHERE name = ?').run(newName, oldName);
    }
    log.info(`Migration ledger: ${oldName} is recorded as ${newName}`);
  });
};

const applyMigration = (db: Database, dbMigration: DbMigration) => {
  try {
    const migrationTransaction = db.transaction(() => {
      if (typeof dbMigration.sql === 'function') {
        dbMigration.sql(db);
      } else if (typeof dbMigration.sql === 'string') {
        db.prepare(dbMigration.sql).run();
      }

      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(dbMigration.name);
    });

    migrationTransaction();
  } catch (err: any) {
    log.error(`Error applying migration: ${err}`);
    throw err;
  }
};

export const migrate = (db: Database) => {
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  createDbMigrationsTable(db);
  relabelRenamedMigrations(db);

  const appliedMigrations = getAppliedMigrations(db);
  const migrationsToApply: string[] = [];
  migrations.forEach((value, key) => {
    if (!appliedMigrations.includes(key)) {
      migrationsToApply.push(key);
    }
  });
  migrationsToApply.sort();

  for (const migrationName of migrationsToApply) {
    const migration: DbMigration = {
      name: migrationName,
      sql: migrations.get(migrationName) as string,
    };
    log.info(`Applying migration: ${migration.name}`);
    applyMigration(db, migration);
  }
};
