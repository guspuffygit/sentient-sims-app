/* eslint-disable promise/always-return */
import * as fs from 'fs';
import path from 'path';
import log from 'electron-log';
import DatabaseConstructor, { Database } from 'better-sqlite3';
import electron from 'electron';
import { DirectoryService } from './DirectoryService';
import { migrate } from '../db/migrations';
import { DatabaseNotLoadedError } from '../exceptions/DatabaseNotLoadedError';
import { DatabaseSession } from '../models/DatabaseSession';
import { sendModNotification } from '../websocketServer';
import { ModWebsocketMessageType } from '../models/ModWebsocketMessage';
import { notifyDatabaseLoaded } from '../util/notifyRenderer';
import { SaveGame, SaveGameType } from '../models/SaveGame';

export class DbService {
  private directoryService: DirectoryService;

  private db?: Database;

  private databaseSession?: DatabaseSession | null;

  constructor(directoryService: DirectoryService) {
    this.directoryService = directoryService;
  }

  async loadDatabase(databaseSession: DatabaseSession) {
    const unsavedDb =
      this.directoryService.getSentientSimsDbUnsaved(databaseSession);
    const savedDb = this.directoryService.getSentientSimsDb(databaseSession);

    // Only needed for db migration to multi-slot saves, remove after awhile
    if (databaseSession.action === 'perform_migrate_single_slot_save') {
      if (
        DirectoryService.fileExistsSync(
          `${this.directoryService.getSingleSlotSentientSimsDB()}.backup`,
        )
      ) {
        log.info('Database is already migrated');
        return;
      }
      if (
        !DirectoryService.fileExistsSync(
          this.directoryService.getSingleSlotSentientSimsDB(),
        )
      ) {
        log.info('No single slot save exists');
        return;
      }
      log.info(
        `Migrating single slot save to new slot:\n${unsavedDb}\n${savedDb}`,
      );
      fs.copyFileSync(
        this.directoryService.getSingleSlotSentientSimsDB(),
        unsavedDb,
      );
      fs.copyFileSync(
        this.directoryService.getSingleSlotSentientSimsDB(),
        savedDb,
      );
      log.info(`Done copying, moving single slot save to backup`);
      fs.renameSync(
        this.directoryService.getSingleSlotSentientSimsDB(),
        `${this.directoryService.getSingleSlotSentientSimsDB()}.backup`,
      );
    } else if (
      DirectoryService.fileExistsSync(
        this.directoryService.getSingleSlotSentientSimsDB(),
      )
    ) {
      log.info('Single slot save exists, sending notification to mod');
      sendModNotification({
        type: ModWebsocketMessageType.MIGRATE_SINGLE_SLOT_SAVE,
      });
    }

    log.debug(`loadDatabase unsavedDb: ${unsavedDb} savedDb: ${savedDb}`);

    // Create a "working" version of the database and only commit changes to it if the game saves
    if (
      !DirectoryService.fileExistsSync(unsavedDb) &&
      DirectoryService.fileExistsSync(savedDb)
    ) {
      log.debug(`Copying ${savedDb} to ${unsavedDb}`);
      fs.copyFileSync(savedDb, unsavedDb);
    }

    try {
      this.db = new DatabaseConstructor(unsavedDb);
    } catch (err: any) {
      log.error('Error opening database', err);
      throw err;
    }

    // Once the above promise is resolved (i.e., DB opened successfully), proceed with migration
    if (this.db) {
      try {
        migrate(this.db); // Await the migration
        log.info('DB Migration complete');
      } catch (migrationErr: any) {
        log.error('DB migration failed', migrationErr);
        throw migrationErr;
      }
    }

    this.databaseSession = databaseSession;

    notifyDatabaseLoaded(databaseSession);
  }

  getDatabaseTemp(saveGame: SaveGame): Database {
    const saveGameDb = this.directoryService.getSentientSimsSaveGame(saveGame);

    log.info(`loadDatabaseTemp db: ${saveGameDb}`);

    let tempDb: Database;
    try {
      tempDb = new DatabaseConstructor(saveGameDb);
    } catch (err: any) {
      log.error('Error opening temp database', err);
      throw err;
    }

    try {
      migrate(tempDb); // Await the migration
      log.info('Temp DB Migration complete');
    } catch (migrationErr: any) {
      log.error('Temp DB migration failed', migrationErr);
      throw migrationErr;
    }

    return tempDb;
  }

  cleanupUnsavedDatabases(databaseSession: DatabaseSession) {
    let unsavedDatabases;
    try {
      unsavedDatabases = this.directoryService.listSentientSimsDbUnsaved();
    } catch (err: any) {
      log.error('Unabled to list unsaved databases', err);
      return;
    }

    unsavedDatabases
      .filter((unsavedDb) => !unsavedDb.includes(databaseSession.sessionId))
      .forEach((unsavedDb) => {
        try {
          fs.rmSync(unsavedDb);
        } catch (err: any) {
          log.error(
            `Unable to remove unsaved db sessionId: ${databaseSession.sessionId}`,
            err,
          );
        }
      });
  }

  async saveDatabase(databaseSession: DatabaseSession) {
    const unsavedDb =
      this.directoryService.getSentientSimsDbUnsaved(databaseSession);
    const savedDb = this.directoryService.getSentientSimsDb(databaseSession);
    log.debug(`saveDatabase unsavedDb: ${unsavedDb} savedDb: ${savedDb}`);

    if (DirectoryService.fileExistsSync(unsavedDb)) {
      await this.getDb().backup(savedDb);
    }

    this.cleanupUnsavedDatabases(databaseSession);
  }

  async copyErrorDatabase(): Promise<DatabaseSession | null> {
    try {
      if (this.databaseSession) {
        const unsavedDb = this.directoryService.getSentientSimsDbUnsaved(
          this.databaseSession,
        );
        const errorDb = this.directoryService.getSentientSimsErrorDb(
          this.databaseSession,
        );

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

  unloadDatabase() {
    this.db = undefined;

    // Cleanup unsaved databases
    this.directoryService
      .listSentientSimsDbUnsaved()
      .forEach((unsavedDb) => fs.rmSync(unsavedDb));

    this.databaseSession = null;

    electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
      if (wnd.webContents?.isDestroyed() === false) {
        log.debug('Sending database unloaded');
        wnd.webContents.send('on-database-unloaded');
      }
    });
  }

  getDb(saveGame?: SaveGame) {
    if (saveGame) {
      return this.getDatabaseTemp(saveGame);
    }

    if (this?.db) {
      return this.db;
    }

    throw new DatabaseNotLoadedError();
  }

  listSaveGames(): SaveGame[] {
    const saveGames: SaveGame[] = [];
    const unsavedGames = this.directoryService.listSentientSimsDbUnsaved();
    unsavedGames.forEach((game) => {
      const unsaveGameName = path
        .basename(game)
        .replace('-sentient-sims-unsaved.db', '');
      if (
        !unsaveGameName.includes('-shm') &&
        !unsaveGameName.includes('-wal')
      ) {
        saveGames.push({
          name: unsaveGameName,
          type: SaveGameType.UNSAVED,
        });
      }
    });

    const savedGames = this.directoryService.listSentientSimsDbSaved();
    savedGames.forEach((game) => {
      saveGames.push({
        name: path.basename(game).replace('-sentient-sims.db', ''),
        type: SaveGameType.SAVED,
      });
    });

    return saveGames;
  }
}
