import { Request, Response } from 'express';
import { isWebSocketConnected } from '../websocketServer';
import { WebsocketStatusResponse } from '../models/WebsocketStatusResponse';

export class WebsocketController {
  isConnected = (req: Request, res: Response) => {
    const response: WebsocketStatusResponse = {
      mod: isWebSocketConnected('mod'),
      renderer: isWebSocketConnected('renderer'),
    };
    res.json(response);
  };
}
