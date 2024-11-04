import { Version } from '../services/VersionService';
import { ApiClient } from './ApiClient';

export class VersionClient extends ApiClient {
  async getModVersion(): Promise<Version> {
    const response = await fetch(`${this.apiUrl}/versions/mod`);
    return response.json();
  }

  async getAppVersion(): Promise<Version> {
    const response = await fetch(`${this.apiUrl}/versions/app`);
    return response.json();
  }

  async getGameVersion(): Promise<Version> {
    const response = await fetch(`${this.apiUrl}/versions/game`);
    return response.json();
  }
}
