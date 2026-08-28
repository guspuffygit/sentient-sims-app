import * as fs from 'fs';
import path from 'path';
import log from 'electron-log';
import DatabaseConstructor, { Database } from 'better-sqlite3';
import { DirectoryService } from './DirectoryService';
import { migrate } from '../db/migrations';
import { DatabaseNotLoadedError } from '../exceptions/DatabaseNotLoadedError';
import { DatabaseSession } from '../models/DatabaseSession';
import { sendModNotification } from '../websocketServer';
import { ModWebsocketMessageType } from '../models/ModWebsocketMessage';
import { notifyDatabaseLoaded } from '../util/notifyRenderer';
import { getAllBrowserWindows } from '../util/browserWindows';
import { SaveGame, SaveGameType } from '../models/SaveGame';
import { ApiContext } from './ApiContext';

export class DbService {
  private ctx: ApiContext;

  private db?: Database;

  private databaseSession?: DatabaseSession | null;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  // Identity of the currently loaded database. Fire-and-forget work (annotation,
  // backfill) captures this before awaiting and drops its result if a different
  // database has been loaded in the meantime.
  get sessionKey(): string | undefined {
    if (!this.db || !this.databaseSession) {
      return undefined;
    }
    return `${this.databaseSession.sessionId}:${this.databaseSession.saveId}`;
  }

  loadDatabase(databaseSession: DatabaseSession) {
    // The mod requests a load both on zone load and on websocket open, which at game
    // boot arrive back to back. If this exact session is already open, the second
    // request has nothing to do — re-running it would repeat migrations, flush the
    // generation queue, and kick off a duplicate embedding backfill.
    if (
      this.db &&
      this.databaseSession &&
      this.databaseSession.sessionId === databaseSession.sessionId &&
      this.databaseSession.saveId === databaseSession.saveId &&
      !databaseSession.action
    ) {
      log.info(
        `Database session ${databaseSession.sessionId} (save ${databaseSession.saveId}) already loaded, skipping reload`,
      );
      return;
    }

    const unsavedDb = this.ctx.directory.getSentientSimsDbUnsaved(databaseSession);
    const savedDb = this.ctx.directory.getSentientSimsDb(databaseSession);

    // Only needed for db migration to multi-slot saves, remove after awhile
    if (databaseSession.action === 'perform_migrate_single_slot_save') {
      if (DirectoryService.fileExistsSync(`${this.ctx.directory.getSingleSlotSentientSimsDB()}.backup`)) {
        log.info('Database is already migrated');
        return;
      }
      if (!DirectoryService.fileExistsSync(this.ctx.directory.getSingleSlotSentientSimsDB())) {
        log.info('No single slot save exists');
        return;
      }
      log.info(`Migrating single slot save to new slot:\n${unsavedDb}\n${savedDb}`);
      fs.copyFileSync(this.ctx.directory.getSingleSlotSentientSimsDB(), unsavedDb);
      fs.copyFileSync(this.ctx.directory.getSingleSlotSentientSimsDB(), savedDb);
      log.info(`Done copying, moving single slot save to backup`);
      fs.renameSync(
        this.ctx.directory.getSingleSlotSentientSimsDB(),
        `${this.ctx.directory.getSingleSlotSentientSimsDB()}.backup`,
      );
    } else if (DirectoryService.fileExistsSync(this.ctx.directory.getSingleSlotSentientSimsDB())) {
      log.info('Single slot save exists, sending notification to mod');
      sendModNotification({
        type: ModWebsocketMessageType.MIGRATE_SINGLE_SLOT_SAVE,
      });
    }

    log.debug(`loadDatabase unsavedDb: ${unsavedDb} savedDb: ${savedDb}`);

    // The game keeps one guid per played game but writes a brand new slot id when a save
    // is recovered from a backup or saved into a new slot, so the first load of that slot
    // would start from an empty database and silently drop every sim and lot biography.
    // Seed it from the same game's most recently saved database instead.
    if (!DirectoryService.fileExistsSync(unsavedDb) && !DirectoryService.fileExistsSync(savedDb)) {
      try {
        const seedDb = this.findSameGameSeedDb(databaseSession);
        if (seedDb) {
          log.info(`Save ${databaseSession.saveId} has no database yet, seeding it from ${seedDb}`);
          fs.copyFileSync(seedDb, unsavedDb);
        }
      } catch (err) {
        log.error(`Unable to seed database for save ${databaseSession.saveId}`, err);
      }
    }

    // Create a "working" version of the database and only commit changes to it if the game saves
    if (!DirectoryService.fileExistsSync(unsavedDb) && DirectoryService.fileExistsSync(savedDb)) {
      log.debug(`Copying ${savedDb} to ${unsavedDb}`);
      fs.copyFileSync(savedDb, unsavedDb);
    }

    // Close any previously loaded database first: an open handle keeps the old
    // session's -wal/-shm files locked on Windows, which makes cleanup fail
    this.closeDatabase();

    try {
      this.db = new DatabaseConstructor(unsavedDb);
    } catch (err) {
      log.error('Error opening database', err);
      throw err;
    }

    try {
      migrate(this.db);
      log.info('DB Migration complete');
    } catch (migrationErr) {
      log.error('DB migration failed', migrationErr);
      throw migrationErr;
    }

    this.databaseSession = databaseSession;

    // Loading a save jumps the game state, so any in-progress scene no longer describes reality.
    this.ctx.generationQueue.flushToFallback();
    this.ctx.sceneService.reset();

    // The mod caches sim descriptions in memory keyed by sim_id and only ever
    // drops that cache on an explicit CLEAR_SIM_CACHE message. Loading a
    // different save (or reloading the same one) leaves the mod serving stale
    // descriptions from the previously loaded database, so clear it here.
    sendModNotification({
      type: ModWebsocketMessageType.CLEAR_SIM_CACHE,
    });

    notifyDatabaseLoaded(databaseSession);

    // Saves from before the memory_index existed (or played without an embedder) get
    // their retrieval metadata filled in here, off the request path. No-op without a key.
    this.ctx.memoryAnnotation.backfillInBackground();
  }

  // A save id is `{slot_id}_{guid}` where the guid identifies the played game across
  // slot changes; any saved database sharing the guid is an earlier state of the same game.
  private findSameGameSeedDb(databaseSession: DatabaseSession): string | undefined {
    const match = databaseSession.saveId.match(/^\d+_(\d+)$/);
    if (!match) {
      return undefined;
    }

    let newest: string | undefined;
    let newestMtimeMs = -Infinity;
    this.ctx.directory
      .listSentientSimsDbSaved()
      .filter((file) => new RegExp(`^\\d+_${match[1]}-sentient-sims\\.db$`).test(path.basename(file)))
      .forEach((file) => {
        const { mtimeMs } = fs.statSync(file);
        if (mtimeMs > newestMtimeMs) {
          newest = file;
          newestMtimeMs = mtimeMs;
        }
      });

    return newest;
  }

  getDatabaseTemp(saveGame: SaveGame): Database {
    const saveGameDb = this.ctx.directory.getSentientSimsSaveGame(saveGame);

    log.info(`loadDatabaseTemp db: ${saveGameDb}`);

    let tempDb: Database;
    try {
      tempDb = new DatabaseConstructor(saveGameDb);
    } catch (err) {
      log.error('Error opening temp database', err);
      throw err;
    }

    try {
      migrate(tempDb);
      log.info('Temp DB Migration complete');
    } catch (migrationErr) {
      log.error('Temp DB migration failed', migrationErr);
      throw migrationErr;
    }

    return tempDb;
  }

  cleanupUnsavedDatabases(databaseSession: DatabaseSession) {
    let unsavedDatabases;
    try {
      unsavedDatabases = this.ctx.directory.listSentientSimsDbUnsaved();
    } catch (err) {
      log.error('Unabled to list unsaved databases', err);
      return;
    }

    unsavedDatabases
      .filter((unsavedDb) => !unsavedDb.includes(databaseSession.sessionId))
      .forEach((unsavedDb) => {
        try {
          fs.rmSync(unsavedDb);
        } catch (err) {
          log.error(`Unable to remove unsaved db sessionId: ${databaseSession.sessionId}`, err);
        }
      });
  }

  async saveDatabase(databaseSession: DatabaseSession) {
    const unsavedDb = this.ctx.directory.getSentientSimsDbUnsaved(databaseSession);
    const savedDb = this.ctx.directory.getSentientSimsDb(databaseSession);
    log.debug(`saveDatabase unsavedDb: ${unsavedDb} savedDb: ${savedDb}`);

    if (DirectoryService.fileExistsSync(unsavedDb)) {
      await this.getDb().backup(savedDb);
    }

    this.cleanupUnsavedDatabases(databaseSession);
  }

  copyErrorDatabase(): DatabaseSession | null {
    try {
      if (this.databaseSession) {
        const unsavedDb = this.ctx.directory.getSentientSimsDbUnsaved(this.databaseSession);
        const errorDb = this.ctx.directory.getSentientSimsErrorDb(this.databaseSession);

        if (DirectoryService.fileExistsSync(unsavedDb)) {
          fs.copyFileSync(unsavedDb, errorDb);
          return this.databaseSession;
        }

        log.info(`No currently loaded unsaved db exists`);
      }
    } catch (err) {
      log.error(`Unable to copy unsaved db to error database`, err);
    }

    return null;
  }

  private closeDatabase() {
    if (this.db) {
      try {
        this.db.close();
      } catch (err) {
        log.error('Error closing database', err);
      }
      this.db = undefined;
    }
  }

  unloadDatabase() {
    this.closeDatabase();

    this.ctx.generationQueue.flushToFallback();
    this.ctx.sceneService.reset();

    // Cleanup unsaved databases
    this.ctx.directory.listSentientSimsDbUnsaved().forEach((unsavedDb) => {
      fs.rmSync(unsavedDb);
    });

    this.databaseSession = null;

    getAllBrowserWindows().forEach((wnd) => {
      if (!wnd.webContents.isDestroyed()) {
        log.debug('Sending database unloaded');
        wnd.webContents.send('on-database-unloaded');
      }
    });
  }

  getDb(saveGame?: SaveGame) {
    if (saveGame) {
      return this.getDatabaseTemp(saveGame);
    }

    if (this.db) {
      return this.db;
    }

    throw new DatabaseNotLoadedError();
  }

  listSaveGames(): SaveGame[] {
    const saveGames: SaveGame[] = [];
    const unsavedGames = this.ctx.directory.listSentientSimsDbUnsaved();
    unsavedGames.forEach((game) => {
      const unsaveGameName = path.basename(game).replace('-sentient-sims-unsaved.db', '');
      if (!unsaveGameName.includes('-shm') && !unsaveGameName.includes('-wal')) {
        saveGames.push({
          name: unsaveGameName,
          type: SaveGameType.UNSAVED,
        });
      }
    });

    const savedGames = this.ctx.directory.listSentientSimsDbSaved();
    savedGames.forEach((game) => {
      saveGames.push({
        name: path.basename(game).replace('-sentient-sims.db', ''),
        type: SaveGameType.SAVED,
      });
    });

    return saveGames;
  }
}
