/* eslint-disable promise/always-return */
import * as fs from 'fs';
import log from 'electron-log';
import DatabaseConstructor, { Database } from 'better-sqlite3';
import { DirectoryService } from './DirectoryService';
import { migrate } from '../db/migrations';

export class DbService {
  private directoryService: DirectoryService;

  private db?: Database;

  constructor(directoryService: DirectoryService) {
    this.directoryService = directoryService;
  }

  async loadDatabase(sessionId: string) {
    // Create a "working" version of the database and only commit changes to it if the game saves
    if (
      !DirectoryService.fileExistsSync(
        this.directoryService.getSentientSimsDbUnsaved(sessionId)
      ) &&
      DirectoryService.fileExistsSync(this.directoryService.getSentientSimsDb())
    ) {
      fs.copyFileSync(
        this.directoryService.getSentientSimsDb(),
        this.directoryService.getSentientSimsDbUnsaved(sessionId)
      );
    }

    try {
      this.db = new DatabaseConstructor(
        this.directoryService.getSentientSimsDbUnsaved(sessionId)
      );
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
  }

  saveDatabase(sessionId: string) {
    if (
      DirectoryService.fileExistsSync(
        this.directoryService.getSentientSimsDbUnsaved(sessionId)
      )
    ) {
      fs.copyFileSync(
        this.directoryService.getSentientSimsDbUnsaved(sessionId),
        this.directoryService.getSentientSimsDb()
      );
    }

    // Cleanup old unsaved databases
    this.directoryService
      .listSentientSimsDbUnsaved()
      .filter((unsavedDb) => !unsavedDb.includes(sessionId))
      .forEach((unsavedDb) => fs.rmSync(unsavedDb));
  }

  getDb() {
    if (this.db) {
      return this.db;
    }

    throw new Error('Database is not loaded yet!');
  }
}
