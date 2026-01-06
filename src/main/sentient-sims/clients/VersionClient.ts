import { Version } from '../services/VersionService';
import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export class VersionClient extends ApiClient {
  async getModVersion(): Promise<Version> {
    const response = await axiosClient<Version>(`${this.apiUrl}/versions/mod`);
    return response.data;
  }

  async getAppVersion(): Promise<Version> {
    const response = await axiosClient<Version>(`${this.apiUrl}/versions/app`);
    return response.data;
  }

  async getGameVersion(): Promise<Version> {
    const response = await axiosClient<Version>(`${this.apiUrl}/versions/game`);
    return response.data;
  }
}
