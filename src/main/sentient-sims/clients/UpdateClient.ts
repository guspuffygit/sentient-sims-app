import { ModUpdate } from '../services/UpdateService';
import { ApiClient } from './ApiClient';

export class UpdateClient extends ApiClient {
  async updateMod(modUpdate: ModUpdate) {
    return fetch(`${this.apiUrl}/update/mod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modUpdate),
    });
  }
}
