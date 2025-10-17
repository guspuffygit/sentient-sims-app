import log from 'electron-log';
import { notifyPatreonLinking, sendPopUpNotification } from '../util/notifyRenderer';
import { ApiContext } from './ApiContext';

export class NotLoggedInError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotLoggedInError';
  }
}

export class PatreonService {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  async handlePatreonRedirect(code: string) {
    notifyPatreonLinking(true);
    try {
      const token = this.ctx.settings.accessToken;
      const url = `${this.ctx.settings.sentientSimsAIEndpoint}/patreon-redirect?code=${code}`;
      if (token) {
        log.debug(`Handling patreon redirect code: ${url}, token: ${token}`);
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              Authentication: token,
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
      } else {
        throw new NotLoggedInError('Unable to handle patreon redirect');
      }
    } finally {
      notifyPatreonLinking(false);
    }
  }
}
