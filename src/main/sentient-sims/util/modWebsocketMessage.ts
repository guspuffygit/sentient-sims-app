import { RawData } from 'ws';
import log from 'electron-log';
import { ModLogWebsocketMessage } from '../models/ModLogWebsocketMessage';

export function rawDataToString(data: RawData): string {
  if (Array.isArray(data)) {
    return Buffer.concat(data).toString('utf-8');
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString('utf-8');
  }
  return data.toString('utf-8');
}

/**
 * One message from the mod's websocket, or undefined when it is not JSON. A bad frame used
 * to throw inside the ws 'message' handler, an uncaught exception in the main process.
 */
export function parseModMessage(data: RawData): ModLogWebsocketMessage | undefined {
  const text = rawDataToString(data);
  try {
    return JSON.parse(text) as ModLogWebsocketMessage;
  } catch (err) {
    log.warn(`Ignoring a mod websocket message that is not JSON: ${text.slice(0, 200)}`, err);
    return undefined;
  }
}
