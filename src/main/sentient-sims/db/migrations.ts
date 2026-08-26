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
