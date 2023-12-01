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
    this.unloadDatabase = this.unloadDatabase.bind(this);
  }

  async loadDatabase(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      log.debug(`Loading database: ${sessionId}`);

      await this.dbService.loadDatabase(sessionId);
      return res.json({ text: 'Db Loaded' });
    } catch (err: any) {
      log.error('Error loading database', err);
      return res.json({ error: err.message });
    }
  }

  async saveDatabase(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      log.debug(`Saving database: ${sessionId}`);

      await this.dbService.saveDatabase(sessionId);
      return res.json({ text: 'Db Saved' });
    } catch (err: any) {
      log.error('Error saving database', err);
      return res.json({ error: err.message });
    }
  }

  unloadDatabase(req: Request, res: Response) {
    try {
      log.debug(`Unloading database`);

      this.dbService.unloadDatabase();
      return res.json({ text: 'Db unloaded' });
    } catch (err: any) {
      log.error('Error saving database', err);
      return res.json({ error: err.message });
    }
  }
}
