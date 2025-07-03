import { DatabaseSession } from '../models/DatabaseSession';
import { SaveGame } from '../models/SaveGame';
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

  async getSaveGames(): Promise<SaveGame[]> {
    const response = await fetch(`${this.apiUrl}/db/list`);
    return (await response.json()) as SaveGame[];
  }
}
