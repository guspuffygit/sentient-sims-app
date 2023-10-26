/* eslint-disable promise/always-return */
import { WebSocketServer } from 'ws';
import log from 'electron-log';
import { LogsService } from './services/LogsService';
import { ModWebsocketMessage } from './models/ModWebsocketMesssage';
import { formatLog } from './util/format';
import { RendererWebsocketMessage } from './models/RendererWebsocketMessage';
import { SettingsService } from './services/SettingsService';
import { SettingsEnum } from './models/SettingsEnum';
import { LogLevel } from './models/LogLevel';

export const startWebSocketServer = (
  logsService: LogsService,
  settingsService: SettingsService
) => {
  const rendererServer = new WebSocketServer({ port: 25146 });
  let rendererWs: any;

  rendererServer.on('connection', function handleRenderer(ws: any) {
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

  const modServer = new WebSocketServer({ port: 25145 });
  modServer.on('connection', function handleMod(ws: any) {
    ws.on('error', log.error);

    ws.on('message', function message(data: any) {
      const parsedData: ModWebsocketMessage = JSON.parse(data.toString());

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
