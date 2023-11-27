/* eslint-disable promise/always-return */
import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import log from 'electron-log';
import { DirectoryService } from './DirectoryService';
import { migrate } from '../db/migrations';

sqlite3.verbose();

export class DbService {
  private directoryService: DirectoryService;

  private db?: sqlite3.Database;

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

    // Promise to handle database opening
    await new Promise<void>((resolve, reject) => {
      this.db = new sqlite3.Database(
        this.directoryService.getSentientSimsDbUnsaved(sessionId),
        (err) => {
          if (err) {
            log.error('Error opening database', err);
            reject(err); // Reject the promise with the error
          } else {
            resolve();
          }
        }
      );
    });

    // Once the above promise is resolved (i.e., DB opened successfully), proceed with migration
    if (this.db) {
      try {
        await migrate(this.db); // Await the migration
        log.info('DB Migration complete');
      } catch (migrationErr) {
        log.error('DB migration failed', migrationErr);
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

  async getDb() {
    if (this.db) {
      return this.db;
    }

    throw new Error('Database is not loaded yet!');
  }

  async run(sql: string, params: any) {
    const db = await this.getDb();
    await new Promise<void>((resolve, reject) => {
      db.run(sql, params, function doRun(err) {
        if (err) {
          log.error('Error in db run', err);
          return reject(err); // Reject the promise with the error
        }

        return resolve(); // Resolve the promise when successful
      });
    });
  }

  async all(sql: string, params: any) {
    const db = await this.getDb();
    return new Promise<any[]>((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          log.error('Error in db all:', err);
          return reject(err);
        }

        return resolve(rows);
      });
    });
  }
}
