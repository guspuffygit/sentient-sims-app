/* eslint-disable promise/always-return */
import electron from 'electron';
import { WebSocketServer, WebSocket } from 'ws';
import log from 'electron-log';
import { ModLogWebsocketMessage } from './models/ModLogWebsocketMessage';
import { formatLog } from './util/format';
import { RendererWebsocketMessage } from './models/RendererWebsocketMessage';
import { LogLevel } from './models/LogLevel';
import { WebsocketNotification } from './models/ModWebsocketMessage';
import { modWebsocketPort, rendererWebsocketPort } from './constants';
import { WebsocketStatusChange } from './models/WebsocketStatusResponse';
import { ApiContext } from './services/ApiContext';

function notifyAllWindows(message: string, ...args: any[]) {
  electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
    if (wnd.webContents?.isDestroyed() === false) {
      wnd.webContents.send(message, ...args);
    }
  });
}

function notifyWebsocketStatus(status: WebsocketStatusChange) {
  log.debug(`Websocket status changed ${status.type} : ${status.status}`);
  notifyAllWindows('websocket-status-change', status);
}

let rendererWs: WebSocket;
let modWs: WebSocket;

let modConnected = false;
let rendererConnected = false;

export const startWebSocketServer = (ctx: ApiContext) => {
  const rendererServer = new WebSocketServer({ port: rendererWebsocketPort });
  rendererServer.on('connection', function handleRenderer(ws: WebSocket) {
    rendererWs = ws;

    rendererConnected = true;
    notifyWebsocketStatus({
      type: 'renderer',
      status: true,
    });
    ws.on('close', () => {
      rendererConnected = false;
      notifyWebsocketStatus({
        type: 'renderer',
        status: false,
      });
    });

    ws.on('error', log.error);

    ws.on('message', function message(data: any) {
      log.debug(`receivedRenderer: ${data}`);
    });

    ctx.logs
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

    modConnected = true;
    notifyWebsocketStatus({
      type: 'mod',
      status: true,
    });
    ws.on('close', () => {
      modConnected = false;
      notifyWebsocketStatus({
        type: 'mod',
        status: false,
      });
    });

    ws.on('error', log.error);

    ws.on('message', function message(data: any) {
      const parsedData: ModLogWebsocketMessage = JSON.parse(data.toString());

      if (!parsedData.log) {
        return;
      }
      if (parsedData.log.level === LogLevel.DEBUG.toString() && !ctx.settings.debugLogs) {
        return;
      }

      const formattedLog = formatLog(parsedData.log);
      ctx.logs.appendLog([formattedLog]).catch((e: any) => log.error('Unable to append to logs.txt', e));
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

export function isWebSocketConnected(type: 'renderer' | 'mod'): boolean {
  if (type === 'renderer') {
    return rendererConnected;
  }

  return modConnected;
}
