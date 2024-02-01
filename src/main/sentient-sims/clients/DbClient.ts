import { ApiClient } from './ApiClient';

export class DbClient extends ApiClient {
  async loadDatabase(sessionId: string) {
    return fetch(`${this.apiUrl}/db/load/${sessionId}`);
  }

  async saveDatabase(sessionId: string) {
    return fetch(`${this.apiUrl}/db/save/${sessionId}`);
  }

  async unloadDatabase() {
    return fetch(`${this.apiUrl}/db/unload`);
  }
}
