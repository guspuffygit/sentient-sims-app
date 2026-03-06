import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export type OptionsStatus = {
  modsEnabled: boolean | null;
  scriptModsOn: boolean | null;
};

export class OptionsClient extends ApiClient {
  async getOptionsStatus(): Promise<OptionsStatus> {
    const response = await axiosClient.get<OptionsStatus>(`${this.apiUrl}/options/status`);
    return response.data;
  }

  async fixOptions(): Promise<OptionsStatus> {
    const response = await axiosClient.post<OptionsStatus>(`${this.apiUrl}/options/fix`);
    return response.data;
  }
}
