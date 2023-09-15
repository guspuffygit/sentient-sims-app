/* eslint-disable no-await-in-loop,no-plusplus,no-promise-executor-return */
import log from 'electron-log';
import { SentientSimsHTTPStatusCode } from '../models/SentientSimsHTTPStatusCode';

export async function fetchWithRetries(
  url: string,
  options: RequestInit,
  retries: number = 3,
  delay: number = 10000,
  attempts: number = 0
): Promise<any> {
  const response = await fetch(url, options);

  log.debug(`response status: ${response.status}`);

  switch (response.status) {
    case SentientSimsHTTPStatusCode.MAINTENANCE_MODE: {
      log.error('AI Server in maintenance mode');
      if (attempts < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetries(url, options, retries, delay, attempts + 1);
      }
      throw new Error(
        'Sentient Sims AI Server is in maintenance mode, check #api-status in discord for details and try again later.'
      );
    }
    case SentientSimsHTTPStatusCode.NO_WORKERS_EXCEPTION: {
      log.error('No workers available');
      if (attempts < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetries(url, options, retries, delay, attempts + 1);
      }
      throw new Error('No AI workers available to service request.');
    }
    case SentientSimsHTTPStatusCode.NOT_MEMBER_EXCEPTION: {
      throw new Error(
        'Must be a Founder or Patron to use the Sentient Sims Uncensored AI Server.'
      );
    }
    default: {
      return response;
    }
  }
}
