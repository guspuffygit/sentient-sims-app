import { SettingsEnum } from '../models/SettingsEnum';
import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export type SettingsResponse = {
  value: unknown;
};

export class SettingsClient extends ApiClient {
  async updateSetting(settingsEnum: SettingsEnum | string, value: any) {
    return axiosClient.post(`${this.apiUrl}/settings/app/${settingsEnum}`, { value });
  }

  async getSetting(settingsEnum: SettingsEnum | string): Promise<SettingsResponse> {
    const response = await axiosClient<SettingsResponse>(`${this.apiUrl}/settings/app/${settingsEnum}`);
    return response.data;
  }

  async resetSetting(settingsEnum: SettingsEnum | string): Promise<SettingsResponse> {
    const response = await axiosClient<SettingsResponse>(`${this.apiUrl}/settings/app/${settingsEnum}/reset`);
    return response.data;
  }
}
