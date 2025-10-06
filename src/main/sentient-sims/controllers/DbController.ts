import { Request, Response } from 'express';
import log from 'electron-log';
import { DatabaseSession } from '../models/DatabaseSession';
import { DbService } from '../services/DbService';

export class DbController {
  private readonly dbService: DbService;

  constructor(dbService: DbService) {
    this.dbService = dbService;

    this.loadDatabase = this.loadDatabase.bind(this);
    this.saveDatabase = this.saveDatabase.bind(this);
    this.unloadDatabase = this.unloadDatabase.bind(this);
    this.getSaveGames = this.getSaveGames.bind(this);
  }

  async loadDatabase(req: Request, res: Response) {
    try {
      const databaseSession: DatabaseSession = req.body;
      log.debug(`Loading database: ${databaseSession.sessionId} : ${databaseSession.saveId}`);

      await this.dbService.loadDatabase(databaseSession);
      return res.json({ text: 'Db Loaded' });
    } catch (err: any) {
      log.error('Error loading database', err);
      return res.json({ error: err.message });
    }
  }

  async saveDatabase(req: Request, res: Response) {
    try {
      const databaseSession: DatabaseSession = req.body;
      log.debug(`Saving database: ${databaseSession.sessionId} : ${databaseSession.saveId}`);

      await this.dbService.saveDatabase(databaseSession);
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

  getSaveGames(req: Request, res: Response) {
    try {
      log.debug(`Getting save games`);

      return res.json(this.dbService.listSaveGames());
    } catch (err: any) {
      log.error('Error saving database', err);
      return res.json({ error: err.message });
    }
  }
}
