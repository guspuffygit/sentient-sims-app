import { DatabaseSession } from '../models/DatabaseSession';
import { SaveGame } from '../models/SaveGame';
import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export class DbClient extends ApiClient {
  async loadDatabase(databaseSession: DatabaseSession) {
    return axiosClient.post(`${this.apiUrl}/db/load`, databaseSession);
  }

  async saveDatabase(databaseSession: DatabaseSession) {
    return axiosClient.post(`${this.apiUrl}/db/save`, databaseSession);
  }

  async unloadDatabase() {
    return axiosClient(`${this.apiUrl}/db/unload`);
  }

  async getSaveGames(): Promise<SaveGame[]> {
    const response = await axiosClient<SaveGame[]>(`${this.apiUrl}/db/list`);
    return response.data;
  }
}
