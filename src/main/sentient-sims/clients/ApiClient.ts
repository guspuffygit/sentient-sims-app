import { appApiUrl } from '../constants';

export abstract class ApiClient {
  protected readonly apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl ?? appApiUrl;
  }
}
