import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    retryCount?: number;
  }
}
