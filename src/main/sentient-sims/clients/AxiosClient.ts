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

function retryElseThrow(
  error: Error,
  maxRetries: number,
  config?: AxiosRequestConfig,
) {
  if (
    typeof config?.retryCount === 'number' &&
    config?.retryCount < maxRetries
  ) {
    config.retryCount += 1;
    log.info(`Retrying ${config.url}`);
    return axiosClient(config);
  }

  throw error;
}

axiosClient.interceptors.response.use(
  (response) => {
    if (
      typeof response?.data === 'string' &&
      response?.config?.responseType !== 'text'
    ) {
      log.error(
        'Error, unexpected string response:',
        response?.config,
        response?.data,
      );
      if (
        typeof response?.config?.retryCount === 'number' &&
        response?.config?.retryCount < 1
      ) {
        response.config.retryCount += 1;
        return axiosClient(response.config);
      }
      return retryElseThrow(
        new UnexpectedStringResponseError(response),
        1,
        response?.config,
      );
    }
    return response;
  },
  (error: AxiosError) => {
    switch (error?.status) {
      case SentientSimsHTTPStatusCode.MAINTENANCE_MODE: {
        log.error('AI Server in maintenance mode');

        return retryElseThrow(
          new Error(
            'Sentient Sims AI Server is in maintenance mode, check #api-status in discord for details and try again later.',
          ),
          defaultMaxRetries,
          error?.config,
        );
      }
      case SentientSimsHTTPStatusCode.NO_WORKERS_EXCEPTION: {
        log.error('No workers available');
        return retryElseThrow(
          new Error('No AI workers available to service request.'),
          defaultMaxRetries,
          error?.config,
        );
      }
      case SentientSimsHTTPStatusCode.NOT_MEMBER_EXCEPTION: {
        throw new Error(
          'Must be a Founder or Patron to use the Sentient Sims Uncensored AI Server.',
        );
      }
      default: {
        return retryElseThrow(error, 1, error?.config);
      }
    }
  },
);
