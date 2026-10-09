/* eslint-disable promise/always-return */
import { WebSocketServer, WebSocket } from 'ws';
import log from 'electron-log';
import { ClockState, ModInfo, VoiceKeyEvent } from './models/ModLogWebsocketMessage';
import { formatLog } from './util/format';
import { notifyClockState } from './util/notifyRenderer';
import { parseModMessage, rawDataToString } from './util/modWebsocketMessage';
import { mirrorModLog } from './util/modLogMirror';
import { onSceneControl } from './util/sceneControl';
import { RendererWebsocketMessage } from './models/RendererWebsocketMessage';
import { LogLevel } from './models/LogLevel';
import { WebsocketNotification } from './models/ModWebsocketMessage';
import { modWebsocketPort, rendererWebsocketPort } from './constants';
import { WebsocketStatusChange } from './models/WebsocketStatusResponse';
import { ApiContext } from './services/ApiContext';
import { getAllBrowserWindows } from './util/browserWindows';

function notifyAllWindows(message: string, ...args: unknown[]) {
  getAllBrowserWindows().forEach((wnd) => {
    if (!wnd.webContents.isDestroyed()) {
      wnd.webContents.send(message, ...args);
    }
  });
}

function notifyWebsocketStatus(status: WebsocketStatusChange) {
  log.debug(`Websocket status changed ${status.type} : ${status.status}`);
  notifyAllWindows('websocket-status-change', status);
}

let rendererWs: WebSocket | undefined;
let modWs: WebSocket | undefined;

let modConnected = false;
let rendererConnected = false;
// The mod_info the mod on the current socket sent; a 4.1 mod never sends one
let lastModInfo: ModInfo | undefined;

// The voice hotkey lives in the game overlay (D8): VoiceInputService registers its
// hotkey service here so the mod learns the chords on connect and the key edges it
// reports (`voice_key`) reach it
export type VoiceKeySink = {
  onModConnected(): void;
  onKey(event: VoiceKeyEvent): void;
};
let voiceKeySink: VoiceKeySink | undefined;

export function setVoiceKeySink(sink: VoiceKeySink | undefined) {
  voiceKeySink = sink;
}

const runningClock: ClockState = { speed: 'NORMAL', paused: false, paused_by: null };
// The clock the connected mod last reported
let modClockState: ClockState | undefined;

// V-1: the renderer holds playback on the last state it was sent, so it is sent again
// whenever the mod reports, the mod disconnects, or the setting changes
export function publishClockState(ctx: ApiContext) {
  notifyClockState(ctx.settings.playbackFollowsGameClock && modClockState ? modClockState : runningClock);
}

export const startWebSocketServer = (ctx: ApiContext) => {
  // Loopback only: the game and the renderer are on this machine, nothing else should reach it
  const rendererServer = new WebSocketServer({ host: '127.0.0.1', port: rendererWebsocketPort });
  // A failed bind emits 'error'; unhandled it would crash the main process.
  rendererServer.on('error', (err) => {
    log.error(`Renderer websocket server error on port ${rendererWebsocketPort}`, err);
  });
  rendererServer.on('connection', function handleRenderer(ws: WebSocket) {
    rendererWs = ws;

    rendererConnected = true;
    notifyWebsocketStatus({
      type: 'renderer',
      status: true,
    });
    ws.on('close', () => {
      // A replaced socket closing late must not mark the live one disconnected
      if (rendererWs !== ws) {
        return;
      }
      rendererWs = undefined;
      rendererConnected = false;
      notifyWebsocketStatus({
        type: 'renderer',
        status: false,
      });
    });

    ws.on('error', (err) => {
      log.error(err);
    });

    ws.on('message', function message(data) {
      log.debug(`receivedRenderer: ${rawDataToString(data)}`);
    });

    ctx.logs
      .readLogs()
      .then((logs) => {
        try {
          const logMessage: RendererWebsocketMessage = {
            logs,
          };
          ws.send(JSON.stringify(logMessage));
        } catch (e) {
          log.error('Unable to send logs from logs.txt to renderer', e);
        }
      })
      .catch((err: unknown) => {
        log.error('Unable to read logs from logs.txt', err);
      });
  });

  const modServer = new WebSocketServer({ host: '127.0.0.1', port: modWebsocketPort });
  modServer.on('error', (err) => {
    log.error(`Mod websocket server error on port ${modWebsocketPort}`, err);
  });
  modServer.on('connection', function handleMod(ws: WebSocket) {
    modWs = ws;

    modConnected = true;
    lastModInfo = undefined;
    // The overlay starts with no voice chords bound
    voiceKeySink?.onModConnected();
    notifyWebsocketStatus({
      type: 'mod',
      status: true,
    });
    ws.on('close', () => {
      // Cleared so sendModNotification stops writing into a closed socket
      if (modWs !== ws) {
        return;
      }
      modWs = undefined;
      modConnected = false;
      modClockState = undefined;
      publishClockState(ctx);
      // The next game session numbers its state reports from 1 again
      ctx.simStateCache.reset();
      notifyWebsocketStatus({
        type: 'mod',
        status: false,
      });
    });

    ws.on('error', (err) => {
      log.error(err);
    });

    ws.on('message', function message(data) {
      const parsedData = parseModMessage(data);
      if (!parsedData) {
        return;
      }

      if (parsedData.clock_state) {
        modClockState = parsedData.clock_state;
        publishClockState(ctx);
        return;
      }

      if (parsedData.voice_key) {
        voiceKeySink?.onKey(parsedData.voice_key);
        return;
      }

      if (parsedData.mod_info) {
        // Which build connected: a core mod has no stream features, so the UI can hide them
        lastModInfo = parsedData.mod_info;
        log.info(
          `[Mod] connected: tier=${lastModInfo.tier} mod=${lastModInfo.mod_version} ` +
            `requires app ${lastModInfo.required_app_version}`,
        );
        return;
      }

      if (parsedData.scene_control) {
        onSceneControl(ctx.scenePlayback, parsedData.scene_control);
        return;
      }

      // Messages a build tier owns
      if (ctx.tiers.some((tier) => tier.onModMessage?.(ctx, parsedData) === true)) {
        return;
      }

      if (!parsedData.log) {
        return;
      }
      if (parsedData.log.level === (LogLevel.DEBUG as string) && !ctx.settings.debugLogs) {
        return;
      }

      // INFO and above also go to main.log, next to the app's own lines (see modLogMirror)
      mirrorModLog(parsedData.log);
      const formattedLog = formatLog(parsedData.log);
      ctx.logs.appendLog([formattedLog]).catch((e: unknown) => {
        log.error('Unable to append to logs.txt', e);
      });
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
  } catch (err) {
    log.error('Unable to send message to mod via websocket', err);
  }
}

export function isWebSocketConnected(type: 'renderer' | 'mod'): boolean {
  if (type === 'renderer') {
    return rendererConnected;
  }

  return modConnected;
}

export function getModInfo(): ModInfo | undefined {
  return lastModInfo;
}
