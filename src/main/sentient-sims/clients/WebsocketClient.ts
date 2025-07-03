import { WebsocketStatusResponse } from '../models/WebsocketStatusResponse';
import { ApiClient } from './ApiClient';

export class WebsocketClient extends ApiClient {
  async isConnected(): Promise<WebsocketStatusResponse> {
    const response = await fetch(`${this.apiUrl}/websocket/isconnected`);
    return response.json();
  }
}
