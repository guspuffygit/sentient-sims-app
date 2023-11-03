import log from 'electron-log';
import { Database } from 'sqlite3';

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
]);

const createDbMigrationsTable = async (db: Database) => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      db.exec(
        `
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        `,
        (err) => {
          if (err) return reject(err);
          return resolve();
        }
      );
    });
  });
};

const getAppliedMigrations = (db: Database): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT name FROM migrations', (err, rows) => {
      if (err) return reject(err);
      const appliedMigrations = rows.map((row: any) => row.name);
      return resolve(appliedMigrations);
    });
  });
};

const applyMigration = async (db: Database, dbMigration: DbMigration) => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // eslint-disable-next-line consistent-return
      db.exec(dbMigration.sql, (migrationErr) => {
        if (migrationErr) return reject(migrationErr);

        db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          dbMigration.name,
          (err) => {
            if (err) return reject(err);
            return resolve();
          }
        );
      });
    });
  });
};

export const migrate = async (db: Database) => {
  await createDbMigrationsTable(db);

  const appliedMigrations = await getAppliedMigrations(db);
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
    // eslint-disable-next-line no-await-in-loop
    await applyMigration(db, migration);
  }
};
