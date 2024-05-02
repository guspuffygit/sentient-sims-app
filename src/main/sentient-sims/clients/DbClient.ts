import { DatabaseSession } from '../models/DatabaseSession';
import { ApiClient } from './ApiClient';

export class DbClient extends ApiClient {
  async loadDatabase(databaseSession: DatabaseSession) {
    return fetch(`${this.apiUrl}/db/load`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(databaseSession),
    });
  }

  async saveDatabase(databaseSession: DatabaseSession) {
    return fetch(`${this.apiUrl}/db/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(databaseSession),
    });
  }

  async unloadDatabase() {
    return fetch(`${this.apiUrl}/db/unload`);
  }
}
