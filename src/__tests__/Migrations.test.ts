import * as fs from 'fs';
import { describe, expect, it } from 'vitest';
import { RENAMED_MIGRATIONS, migrate } from 'main/sentient-sims/db/migrations';
import { mockApiContext } from './util';

function loadedDb(sessionId: string) {
  const ctx = mockApiContext();
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
  ctx.db.loadDatabase({ sessionId, saveId: '1' });
  return ctx.db.getDb();
}

function migrationNames(db: ReturnType<typeof loadedDb>): string[] {
  return (db.prepare('SELECT name FROM migrations ORDER BY id').all() as { name: string }[]).map((row) => row.name);
}

describe('migrate', () => {
  // A save's DB goes back and forth between app builds (the stream app, then the core
  // app, or a newer app then an older one). A migration row this build has never heard
  // of must not stop it opening the DB.
  it('ignores applied migrations newer than it knows', () => {
    const db = loadedDb('migrations-newer-row');
    db.prepare('INSERT INTO migrations (name) VALUES (?)').run('999-from-a-newer-build');
    const before = migrationNames(db);

    expect(() => {
      migrate(db);
    }).not.toThrow();

    expect(migrationNames(db)).toEqual(before);
    expect(migrationNames(db)).toContain('999-from-a-newer-build');
  });

  it('is a no-op the second time', () => {
    const db = loadedDb('migrations-twice');
    const before = migrationNames(db);

    migrate(db);
    migrate(db);

    expect(migrationNames(db)).toEqual(before);
  });

  // Two of ours first shipped under 014/015, numbers 4.1.0 then used for its own; they
  // are 021/022 now and a fresh database only ever sees the new names.
  it('records the renumbered migrations under their new names', () => {
    const names = migrationNames(loadedDb('migrations-renumbered-fresh'));

    Object.entries(RENAMED_MIGRATIONS).forEach(([oldName, newName]) => {
      expect(names).toContain(newName);
      expect(names).not.toContain(oldName);
    });
  });

  // A database migrated before the renumbering has the column and the table already,
  // recorded under the old names. Running either again would throw (ADD COLUMN on a
  // column that exists, CREATE TABLE on a table that exists), so the ledger is
  // relabelled instead of re-applied.
  it('relabels a ledger that recorded the old names instead of running them twice', () => {
    const db = loadedDb('migrations-renumbered-ledger');
    Object.entries(RENAMED_MIGRATIONS).forEach(([oldName, newName]) => {
      db.prepare('UPDATE migrations SET name = ? WHERE name = ?').run(oldName, newName);
    });
    expect(migrationNames(db)).toContain('014-add-memory-index-owner');

    expect(() => {
      migrate(db);
    }).not.toThrow();

    const names = migrationNames(db);
    Object.entries(RENAMED_MIGRATIONS).forEach(([oldName, newName]) => {
      expect(names).toContain(newName);
      expect(names).not.toContain(oldName);
    });
    expect(names.filter((name) => name === '022-create-daily-plan')).toHaveLength(1);
    expect(
      db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'daily_plan'").get(),
    ).toBeTruthy();
  });
});
