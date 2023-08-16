import log from 'electron-log';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';

export class CustomLLMService {
  private settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  customLLMEnabled() {
    return this.settingsService.get(SettingsEnum.CUSTOM_LLM_ENABLED) as boolean;
  }

  customLLMHostname() {
    return this.settingsService.get(SettingsEnum.CUSTOM_LLM_HOSTNAME) as string;
  }

  async generate(prompt: string, callback: any) {
    const url = `${this.customLLMHostname()}/api/v1/generate`;
    log.debug(`url: ${url}`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.settingsService.get(
            SettingsEnum.ACCESS_TOKEN
          )}`,
        },
        body: JSON.stringify({
          prompt,
          max_new_tokens: 90,
        }),
      });

      const result = await response.json();
      log.debug(result);
      callback(null, result);
    } catch (e: any) {
      log.error(`Error requesting to server`, e);
      callback(e);
    }
  }
}
