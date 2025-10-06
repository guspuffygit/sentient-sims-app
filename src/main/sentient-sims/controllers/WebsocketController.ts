import { Request, Response } from 'express';
import { isWebSocketConnected } from '../websocketServer';
import { WebsocketStatusResponse } from '../models/WebsocketStatusResponse';

export class WebsocketController {
  constructor() {
    this.isConnected = this.isConnected.bind(this);
  }

  async isConnected(req: Request, res: Response) {
    const response: WebsocketStatusResponse = {
      mod: isWebSocketConnected('mod'),
      renderer: isWebSocketConnected('renderer'),
    };
    res.json(response);
  }
}
