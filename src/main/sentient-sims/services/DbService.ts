/* eslint-disable promise/always-return */
import * as fs from 'fs';
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

export class DbService {
  private directoryService: DirectoryService;

  private db?: Database;

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
          `${this.directoryService.getSingleSlotSentientSimsDB()}.backup`
        )
      ) {
        log.info('Database is already migrated');
        return;
      }
      if (
        !DirectoryService.fileExistsSync(
          this.directoryService.getSingleSlotSentientSimsDB()
        )
      ) {
        log.info('No single slot save exists');
        return;
      }
      log.info(
        `Migrating single slot save to new slot:\n${unsavedDb}\n${savedDb}`
      );
      fs.copyFileSync(
        this.directoryService.getSingleSlotSentientSimsDB(),
        unsavedDb
      );
      fs.copyFileSync(
        this.directoryService.getSingleSlotSentientSimsDB(),
        savedDb
      );
      log.info(`Done copying, moving single slot save to backup`);
      fs.renameSync(
        this.directoryService.getSingleSlotSentientSimsDB(),
        `${this.directoryService.getSingleSlotSentientSimsDB()}.backup`
      );
    } else if (
      DirectoryService.fileExistsSync(
        this.directoryService.getSingleSlotSentientSimsDB()
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

    notifyDatabaseLoaded(databaseSession);
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
            err
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

  unloadDatabase() {
    this.db = undefined;

    // Cleanup unsaved databases
    this.directoryService
      .listSentientSimsDbUnsaved()
      .forEach((unsavedDb) => fs.rmSync(unsavedDb));

    electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
      if (wnd.webContents?.isDestroyed() === false) {
        log.debug('Sending database unloaded');
        wnd.webContents.send('on-database-unloaded');
      }
    });
  }

  getDb() {
    if (this?.db) {
      return this.db;
    }

    throw new DatabaseNotLoadedError();
  }
}
