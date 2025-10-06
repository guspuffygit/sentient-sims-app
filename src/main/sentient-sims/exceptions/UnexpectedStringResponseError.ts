import { AxiosResponse } from 'axios';

export class UnexpectedStringResponseError extends Error {
  constructor(public response: AxiosResponse<any, any>) {
    super(`Unexpected string response from ${response.config.url}\n${response.data}`);
    this.name = 'UnexpectedStringResponseError';
  }
}
