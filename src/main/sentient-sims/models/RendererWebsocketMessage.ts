import { LogMessage } from 'main/sentient-sims/models/LogMessage';

export type RendererWebsocketMessage = {
  log?: LogMessage;
  logs?: string[];
};
