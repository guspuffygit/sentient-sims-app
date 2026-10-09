// Tier IPC channels (release 4.5).
//
// Both interfaces are EMPTY in core. A tier file that talks to the renderer augments them:
//
//   declare module '../tiers/ipc' {
//     interface TierInvokeChannels { 'twitch-status-get': { args: []; result: TwitchChatStatus } }
//     interface TierEventChannels { 'twitch-status': TwitchChatStatus }
//   }
//
// The preload exposes tierInvoke / tierOn typed over these, so in a stripped tree, where
// the augmenting file is gone, `keyof` is `never` and any leftover caller fails tsc instead
// of shipping a dead bridge.
import type { IpcMain, IpcMainInvokeEvent } from 'electron';
import { getAllBrowserWindows } from '../util/browserWindows';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TierInvokeChannels {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TierEventChannels {}

export type TierInvokeChannel = keyof TierInvokeChannels;
export type TierEventChannel = keyof TierEventChannels;

export type TierInvokeArgs<C extends TierInvokeChannel> = TierInvokeChannels[C] extends {
  args: infer A extends unknown[];
}
  ? A
  : never;

export type TierInvokeResult<C extends TierInvokeChannel> = TierInvokeChannels[C] extends { result: infer R }
  ? R
  : never;

export function handleTierInvoke<C extends TierInvokeChannel>(
  ipcMain: IpcMain,
  channel: C,
  handler: (...args: TierInvokeArgs<C>) => TierInvokeResult<C> | Promise<TierInvokeResult<C>>,
) {
  ipcMain.handle(channel, (_event: IpcMainInvokeEvent, ...args: unknown[]) => handler(...(args as TierInvokeArgs<C>)));
}

export function notifyTierEvent<C extends TierEventChannel>(channel: C, payload: TierEventChannels[C]) {
  getAllBrowserWindows().forEach((wnd) => {
    if (!wnd.webContents.isDestroyed()) {
      wnd.webContents.send(channel, payload);
    }
  });
}
