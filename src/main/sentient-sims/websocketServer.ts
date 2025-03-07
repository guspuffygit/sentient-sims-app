/* eslint-disable promise/always-return */
import { WebSocketServer, WebSocket } from 'ws';
import log from 'electron-log';
import { LogsService } from './services/LogsService';
import { ModLogWebsocketMessage } from './models/ModLogWebsocketMessage';
import { formatLog } from './util/format';
import { RendererWebsocketMessage } from './models/RendererWebsocketMessage';
import { SettingsService } from './services/SettingsService';
import { SettingsEnum } from './models/SettingsEnum';
import { LogLevel } from './models/LogLevel';
import { WebsocketNotification } from './models/ModWebsocketMessage';
import { modWebsocketPort, rendererWebsocketPort } from './constants';

let rendererWs: WebSocket;
let modWs: WebSocket;

export const startWebSocketServer = (
  logsService: LogsService,
  settingsService: SettingsService,
) => {
  const rendererServer = new WebSocketServer({ port: rendererWebsocketPort });
  rendererServer.on('connection', function handleRenderer(ws: WebSocket) {
    rendererWs = ws;
    ws.on('error', log.error);

    ws.on('message', function message(data: any) {
      log.debug(`receivedRenderer: ${data}`);
    });

    logsService
      .readLogs()
      .then((logs) => {
        try {
          const logMessage: RendererWebsocketMessage = {
            logs,
          };
          ws.send(JSON.stringify(logMessage));
        } catch (e: any) {
          log.error('Unable to send logs from logs.txt to renderer', e);
        }
      })
      .catch((err: any) => {
        log.error('Unable to read logs from logs.txt', err);
      });
  });

  const modServer = new WebSocketServer({ port: modWebsocketPort });
  modServer.on('connection', function handleMod(ws: WebSocket) {
    modWs = ws;
    ws.on('error', log.error);

    ws.on('message', function message(data: any) {
      const parsedData: ModLogWebsocketMessage = JSON.parse(data.toString());

      if (!parsedData.log) {
        return;
      }
      if (
        parsedData.log.level === LogLevel.DEBUG.toString() &&
        !settingsService.get(SettingsEnum.DEBUG_LOGS)
      ) {
        return;
      }

      const formattedLog = formatLog(parsedData.log);
      logsService
        .appendLog([formattedLog])
        .catch((e: any) => log.error('Unable to append to logs.txt', e));
      if (rendererWs) {
        rendererWs.send(JSON.stringify(parsedData));
      }
    });
  });
};

export function sendModNotification(notification: WebsocketNotification) {
  try {
    if (modWs) {
      modWs.send(JSON.stringify(notification));
    }
  } catch (err: any) {
    log.error('Unable to send message to mod via websocket', err);
  }
}
