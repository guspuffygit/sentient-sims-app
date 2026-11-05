import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import log from 'electron-log';
import { UnexpectedStringResponseError } from '../exceptions/UnexpectedStringResponseError';
import { UsageLimitError, parseUsageLimitRefusal } from '../exceptions/UsageLimitError';
import {
  SUBSCRIBE_HINT,
  SubscriptionRequiredError,
  parseSubscriptionRequired,
} from '../exceptions/SubscriptionRequiredError';
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
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED') {
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
        const subscriptionRequired = parseSubscriptionRequired(error.response?.data);
        if (subscriptionRequired) {
          throw new SubscriptionRequiredError(`${subscriptionRequired} ${SUBSCRIBE_HINT}`);
        }
        throw new Error(`A Sentient Sims membership is needed to use the Sentient Sims AI Server. ${SUBSCRIBE_HINT}`);
      }
      case SentientSimsHTTPStatusCode.USAGE_USED_UP: {
        // A usage refusal holds until the member changes a setting or the period
        // resets, so a retry would only repeat it; a provider rate limit still retries
        const refusal = parseUsageLimitRefusal(error.response?.data);
        if (refusal) {
          throw new UsageLimitError(refusal);
        }
        return retryElseThrow(error, defaultMaxRetries, error.config);
      }
      default: {
        return retryElseThrow(error, 3, error.config);
      }
    }
  },
);
