import { DbService } from '../services/DbService';

export abstract class Repository {
  protected readonly dbService: DbService;

  constructor(dbService: DbService) {
    this.dbService = dbService;
  }
}
