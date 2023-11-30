import log from 'electron-log';
import { Database } from '@guspuffy/better-sqlite3';

export type DbMigration = {
  name: string;
  sql: string;
};

export const migrations: Map<string, string> = new Map([
  [
    '001-create-participant-table',
    `
    CREATE TABLE participant (
      id                   INTEGER NOT NULL  PRIMARY KEY  ,
      description          TEXT
    );
  `,
  ],
  [
    '002-create-location-table',
    `
    CREATE TABLE location (
      id                   INTEGER NOT NULL  PRIMARY KEY  ,
      name                 TEXT     ,
      lot_type             TEXT     ,
      description          TEXT
    );
  `,
  ],
  [
    '003-create-memory-table',
    `
    CREATE TABLE memory (
      id                   INTEGER PRIMARY KEY  ,
      pre_action           TEXT     ,
      observation          TEXT     ,
      content              TEXT     ,
      timestamp            DATETIME DEFAULT CURRENT_TIMESTAMP ,
      location_id          INTEGER NOT NULL
    );
  `,
  ],
  [
    '004-create-memory-participants-table',
    `
    CREATE TABLE memory_participants (
      id                   INTEGER PRIMARY KEY  ,
      participant_id       INTEGER NOT NULL    ,
      memory_id            INTEGER NOT NULL    ,
      FOREIGN KEY ( memory_id ) REFERENCES memory( id ) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `,
  ],
]);

const createDbMigrationsTable = (db: Database) => {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `
  ).run();
};

const getAppliedMigrations = (db: Database): string[] => {
  const rows = db.prepare('SELECT name FROM migrations').all();
  return rows.map((row: any) => row.name);
};

const applyMigration = (db: Database, dbMigration: DbMigration) => {
  try {
    const migrationTransaction = db.transaction(() => {
      db.prepare(dbMigration.sql).run();

      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(
        dbMigration.name
      );
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

  // eslint-disable-next-line no-restricted-syntax
  for (const migrationName of migrationsToApply) {
    const migration: DbMigration = {
      name: migrationName,
      sql: migrations.get(migrationName) as string,
    };
    log.info(`Applying migration: ${migration.name} sql:\n${migration.sql}`);
    applyMigration(db, migration);
  }
};
