import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export type OptionsStatus = {
  modsEnabled: boolean | null;
  scriptModsOn: boolean | null;
};

export type ModsDirectoryDetection = {
  found: boolean;
  modsDirectory: string;
};

export class OptionsClient extends ApiClient {
  async detectModsDirectory(): Promise<ModsDirectoryDetection> {
    const response = await axiosClient.post<ModsDirectoryDetection>(`${this.apiUrl}/options/detect-mods`);
    return response.data;
  }

  async getOptionsStatus(): Promise<OptionsStatus> {
    const response = await axiosClient.get<OptionsStatus>(`${this.apiUrl}/options/status`);
    return response.data;
  }

  async fixOptions(): Promise<OptionsStatus> {
    const response = await axiosClient.post<OptionsStatus>(`${this.apiUrl}/options/fix`);
    return response.data;
  }
}
