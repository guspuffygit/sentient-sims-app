import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import log from 'electron-log';
import { UnexpectedStringResponseError } from '../exceptions/UnexpectedStringResponseError';
import { SentientSimsHTTPStatusCode } from '../models/SentientSimsHTTPStatusCode';

export const axiosClient = axios.create({
  validateStatus: (status) => {
    return status <= 205;
  },
});

axiosClient.interceptors.request.use((config) => {
  if (config.retryCount === undefined) {
    config.retryCount = 0;
  }

  return config;
});

const defaultMaxRetries = 3;

// The server names the model and the tier it needs; the hint points at the fix
export function tierUpgradeMessage(body: unknown): string {
  const reason =
    body && typeof body === 'object' && typeof (body as { error?: unknown }).error === 'string'
      ? (body as { error: string }).error
      : 'This model needs a higher Patreon tier';
  return `${reason}. Upgrade on Patreon or pick another model in the AI provider settings.`;
}

function retryElseThrow(error: Error, maxRetries: number, config?: AxiosRequestConfig) {
  if (typeof config?.retryCount === 'number' && config.retryCount < maxRetries) {
    config.retryCount += 1;
    log.info(`Retrying ${config.url}`);
    return axiosClient(config);
  }

  throw error;
}

axiosClient.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.config.responseType !== 'text') {
      log.error('Error, unexpected string response:', response.config, response.data);
      if (typeof response.config.retryCount === 'number' && response.config.retryCount < 1) {
        response.config.retryCount += 1;
        return axiosClient(response.config);
      }
      return retryElseThrow(new UnexpectedStringResponseError(response), 1, response.config);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      throw error;
    }
    if (error.response) {
      // The AxiosError util.inspect output omits the response body, so log it explicitly
      const { data } = error.response;
      const body = typeof data === 'string' ? data : JSON.stringify(data);
      const url = `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`;
      log.error(`HTTP ${error.response.status} from ${url}: ${body.slice(0, 2000)}`);
    }
    switch (error.status) {
      case SentientSimsHTTPStatusCode.MAINTENANCE_MODE: {
        log.error('AI Server in maintenance mode');

        return retryElseThrow(
          new Error(
            'Sentient Sims AI Server is in maintenance mode, check #api-status in discord for details and try again later.',
          ),
          defaultMaxRetries,
          error.config,
        );
      }
      case SentientSimsHTTPStatusCode.NO_WORKERS_EXCEPTION: {
        log.error('No workers available');
        return retryElseThrow(
          new Error('No AI workers available to service request.'),
          defaultMaxRetries,
          error.config,
        );
      }
      case SentientSimsHTTPStatusCode.NOT_MEMBER_EXCEPTION: {
        throw new Error('Must be a Founder or Patron to use the Sentient Sims Uncensored AI Server.');
      }
      case SentientSimsHTTPStatusCode.TIER_UPGRADE_REQUIRED: {
        throw new Error(tierUpgradeMessage(error.response?.data));
      }
      default: {
        return retryElseThrow(error, 3, error.config);
      }
    }
  },
);
