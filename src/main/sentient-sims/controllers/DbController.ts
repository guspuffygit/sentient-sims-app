import { Request, Response } from 'express';
import log from 'electron-log';
import { DatabaseSession } from '../models/DatabaseSession';
import { ApiContext } from '../services/ApiContext';

export class DbController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    this.loadDatabase = this.loadDatabase.bind(this);
    this.saveDatabase = this.saveDatabase.bind(this);
    this.unloadDatabase = this.unloadDatabase.bind(this);
    this.getSaveGames = this.getSaveGames.bind(this);
  }

  async loadDatabase(req: Request, res: Response) {
    try {
      const databaseSession: DatabaseSession = req.body;
      log.debug(`Loading database: ${databaseSession.sessionId} : ${databaseSession.saveId}`);

      await this.ctx.db.loadDatabase(databaseSession);
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

      await this.ctx.db.saveDatabase(databaseSession);
      return res.json({ text: 'Db Saved' });
    } catch (err: any) {
      log.error('Error saving database', err);
      return res.json({ error: err.message });
    }
  }

  unloadDatabase(req: Request, res: Response) {
    try {
      log.debug(`Unloading database`);

      this.ctx.db.unloadDatabase();
      return res.json({ text: 'Db unloaded' });
    } catch (err: any) {
      log.error('Error saving database', err);
      return res.json({ error: err.message });
    }
  }

  getSaveGames(req: Request, res: Response) {
    try {
      log.debug(`Getting save games`);

      return res.json(this.ctx.db.listSaveGames());
    } catch (err: any) {
      log.error('Error saving database', err);
      return res.json({ error: err.message });
    }
  }
}
