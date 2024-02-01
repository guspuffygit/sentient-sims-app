// eslint-disable-next-line max-classes-per-file
import log from 'electron-log';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';
import { sendPopUpNotification } from '../util/notifyRenderer';

export class NotLoggedInError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotLoggedInError';
  }
}

export class PatreonService {
  private settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  async handlePatreonRedirect(code: string) {
    const token = this.settingsService.get(SettingsEnum.ACCESS_TOKEN) as string;
    const url = `https://api.sentientsimulations.com/interaction/patreon-redirect?code=${code}`;
    if (token) {
      log.debug(`Handling patreon redirect code: ${url}, token: ${token}`);
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.text();
        log.info(`Patreon redirect result: ${result}`);
        if (result !== '{"message":"Updated."}') {
          throw new Error(result);
        }
      } catch (err: any) {
        log.error(`Patreon redirect failed`, err);
        sendPopUpNotification(err?.message);
        throw err;
      }
    }

    throw new NotLoggedInError('Unable to handle patreon redirect');
  }
}
