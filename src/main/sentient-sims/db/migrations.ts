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
          .get() as any;

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
    '007-add-memory-game-timestamp': `
      ALTER TABLE memory
      ADD COLUMN game_timestamp INTEGER NOT NULL DEFAULT 0;
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
  const rows = db.prepare('SELECT name FROM migrations').all();
  return rows.map((row: any) => row.name);
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
