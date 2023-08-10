import request from 'request';
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

  generate(prompt: string, callback: any) {
    const options = {
      method: 'POST',
      url: `${this.customLLMHostname()}/api/v1/generate`,
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
    };

    request(
      options,
      // eslint-disable-next-line consistent-return
      (error: string | undefined, response: any, responseBody: any) => {
        if (error) {
          return callback(error);
        }

        try {
          const result = JSON.parse(responseBody);

          // Strip USER and ASSISTANT continuations
          // TODO: Use stop tokens in model settings
          let { text } = result.results[0];
          text = text.split('USER:', 1)[0].trim();
          text = text.split('ASSISTANT:', 1)[0].trim();
          result.results[0].text = text;

          callback(null, result);
        } catch (err) {
          log.error(err);
          callback(err);
        }
      }
    );
  }
}
