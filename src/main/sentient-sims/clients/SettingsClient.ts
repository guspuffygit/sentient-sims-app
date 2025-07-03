import { SettingsEnum } from '../models/SettingsEnum';
import { ApiClient } from './ApiClient';

export type SettingsResponse = {
  value: unknown;
};

export class SettingsClient extends ApiClient {
  async updateSetting(settingsEnum: SettingsEnum | string, value: any) {
    return fetch(`${this.apiUrl}/settings/app/${settingsEnum}`, {
      method: 'POST',
      body: JSON.stringify({ value }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getSetting(
    settingsEnum: SettingsEnum | string,
  ): Promise<SettingsResponse> {
    const response = await fetch(`${this.apiUrl}/settings/app/${settingsEnum}`);
    return response.json();
  }

  async resetSetting(
    settingsEnum: SettingsEnum | string,
  ): Promise<SettingsResponse> {
    const response = await fetch(
      `${this.apiUrl}/settings/app/${settingsEnum}/reset`,
    );
    return response.json();
  }
}
