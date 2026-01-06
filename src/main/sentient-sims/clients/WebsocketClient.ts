import { WebsocketStatusResponse } from '../models/WebsocketStatusResponse';
import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export class WebsocketClient extends ApiClient {
  async isConnected(): Promise<WebsocketStatusResponse> {
    const response = await axiosClient<WebsocketStatusResponse>(`${this.apiUrl}/websocket/isconnected`);
    return response.data;
  }
}
