/* eslint-disable promise/always-return */
/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import log from 'electron-log';
import { DbService } from '../services/DbService';

export class DbController {
  private readonly dbService: DbService;

  constructor(dbService: DbService) {
    this.dbService = dbService;

    this.loadDatabase = this.loadDatabase.bind(this);
    this.saveDatabase = this.saveDatabase.bind(this);
  }

  async loadDatabase(req: Request, res: Response) {
    log.debug('Loading database');
    try {
      await this.dbService.loadDatabase();
      return res.json({ text: 'Db Loaded' });
    } catch (err: any) {
      log.error('Error loading database', err);
      return res.json({ error: err.message });
    }
  }

  saveDatabase(req: Request, res: Response) {
    log.debug('Saving database');
    try {
      this.dbService.saveDatabase();
      return res.json({ text: 'Db Saved' });
    } catch (err: any) {
      log.error('Error saving database', err);
      return res.json({ error: err.message });
    }
  }
}
