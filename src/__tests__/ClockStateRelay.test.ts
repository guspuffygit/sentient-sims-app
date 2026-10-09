import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type FakeServer = EventEmitter & { options: { port: number } };

const servers = vi.hoisted(() => [] as unknown[]);

vi.mock('ws', async () => {
  const events = await import('node:events');
  class WebSocketServer extends events.EventEmitter {
    constructor(public options: { port: number }) {
      super();
      servers.push(this);
    }
  }
  return { WebSocketServer, WebSocket: events.EventEmitter };
});

const windowSend = vi.hoisted(() => vi.fn());

vi.mock('main/sentient-sims/util/browserWindows', () => ({
  getAllBrowserWindows: () => [{ webContents: { isDestroyed: () => false, send: windowSend } }],
}));

import { modWebsocketPort } from 'main/sentient-sims/constants';
import { SimStateReport } from 'main/sentient-sims/models/SimStateReport';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { SimStateCache } from 'main/sentient-sims/services/SimStateCache';
import { publishClockState, startWebSocketServer } from 'main/sentient-sims/websocketServer';

const settings = { playbackFollowsGameClock: true };
const simStateCache = new SimStateCache();
const ctx = { settings, simStateCache, tiers: [] } as unknown as ApiContext;

startWebSocketServer(ctx);
const modServer = (servers as FakeServer[]).find((server) => server.options.port === modWebsocketPort);
if (!modServer) {
  throw new Error('The mod websocket server was not started');
}

const userPause = { speed: 'PAUSED', paused: true, paused_by: 'user' };
const running = { speed: 'NORMAL', paused: false, paused_by: null };

function connectMod(): EventEmitter {
  const socket = new EventEmitter();
  modServer?.emit('connection', socket);
  return socket;
}

function sendClock(socket: EventEmitter, state: object) {
  socket.emit('message', Buffer.from(JSON.stringify({ clock_state: state })));
}

function stateReport(seq: number, simId: string): SimStateReport {
  return { type: 'state_report', seq, sims: [{ sim_id: simId, sims: [], objects: [] }] };
}

function clockStatesSent(): unknown[] {
  return windowSend.mock.calls.filter((call) => call[0] === 'clock-state').map((call) => call[1] as unknown);
}

describe('clock state relay', () => {
  beforeEach(() => {
    settings.playbackFollowsGameClock = true;
    connectMod().emit('close');
    windowSend.mockClear();
  });

  it('forwards the clock the mod reports', () => {
    sendClock(connectMod(), userPause);
    expect(clockStatesSent()).toEqual([userPause]);
  });

  it('releases a user pause when the game goes away while paused', () => {
    const socket = connectMod();
    sendClock(socket, userPause);
    socket.emit('close');
    expect(clockStatesSent()).toEqual([userPause, running]);
  });

  it('leaves the clock alone when a replaced socket closes late', () => {
    const stale = connectMod();
    sendClock(connectMod(), userPause);
    stale.emit('close');
    expect(clockStatesSent()).toEqual([userPause]);
  });

  it('releases a user pause when the setting is switched off', () => {
    sendClock(connectMod(), userPause);
    settings.playbackFollowsGameClock = false;
    publishClockState(ctx);
    expect(clockStatesSent()).toEqual([userPause, running]);
  });

  it('applies the pause the game is already in when the setting is switched on', () => {
    settings.playbackFollowsGameClock = false;
    sendClock(connectMod(), userPause);
    settings.playbackFollowsGameClock = true;
    publishClockState(ctx);
    expect(clockStatesSent()).toEqual([running, userPause]);
  });
});

describe('state cache across game sessions', () => {
  it('takes the reports of a game that restarted and numbers them from 1 again', () => {
    const firstSession = connectMod();
    simStateCache.ingest(stateReport(500, '100'));
    firstSession.emit('close');

    connectMod();
    simStateCache.ingest(stateReport(1, '200'));

    expect(simStateCache.getReport()?.seq).toBe(1);
    expect(simStateCache.getSimIds()).toEqual(['200']);
  });

  it('keeps the cache when a replaced socket closes late', () => {
    const stale = connectMod();
    connectMod();
    simStateCache.ingest(stateReport(500, '100'));
    stale.emit('close');

    expect(simStateCache.getReport()?.seq).toBe(500);
  });
});
