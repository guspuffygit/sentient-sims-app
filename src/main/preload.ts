// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { SettingsEnum } from './sentient-sims/models/SettingsEnum';
import { CaughtError } from './sentient-sims/models/CaughtError';

type IpcCallback = (event: IpcRendererEvent, ...args: any[]) => void;

const electronHandler = {
  onDebugModeToggle: (callback: IpcCallback) => {
    return ipcRenderer.on('debug-mode-toggle', callback);
  },
  onChatGeneration: (callback: IpcCallback) => {
    ipcRenderer.on('on-chat-generation', callback);

    return () => ipcRenderer.removeListener('on-chat-generation', callback);
  },
  onPopupNotification: (callback: IpcCallback) => {
    return ipcRenderer.on('popup-notification', callback);
  },
  onCaughtErrorPopupNotification: (callback: (_event: IpcRendererEvent, caughtError: CaughtError) => any) => {
    ipcRenderer.on('caught-error-popup-notification', callback);

    return () => ipcRenderer.removeListener('caught-error-popup-notification', callback);
  },
  selectDirectory: () => {
    return ipcRenderer.invoke('dialog:selectDirectory');
  },
  setSetting: (setting: SettingsEnum, value: any) => {
    ipcRenderer.send('set-setting', setting, value);
  },
  resetSetting: (setting: SettingsEnum) => {
    ipcRenderer.send('reset-setting', setting);
  },
  onAuth: (callback: IpcCallback) => {
    ipcRenderer.on('on-auth', callback);

    return () => ipcRenderer.removeListener('on-auth', callback);
  },
  refreshAuth: (callback: IpcCallback) => {
    ipcRenderer.on('refresh-auth', callback);

    return () => ipcRenderer.removeListener('refresh-auth', callback);
  },
  refreshUserAttributes: (callback: IpcCallback) => {
    ipcRenderer.on('refresh-user-attributes', callback);

    return () => ipcRenderer.removeListener('refresh-user-attributes', callback);
  },
  onLinkingPatreon: (callback: IpcCallback) => {
    ipcRenderer.on('on-linking-patreon', callback);

    return () => ipcRenderer.removeListener('on-linking-patreon', callback);
  },
  onSuccessfulAuth: () => {
    ipcRenderer.send('on-successful-auth');
  },
  onSettingChange: (callback: IpcCallback) => {
    ipcRenderer.on('setting-changed', callback);

    return () => ipcRenderer.removeListener('setting-changed', callback);
  },
  openBrowserLink: (link: string) => {
    ipcRenderer.send('open-browser-link', link);
  },
  onNewMemoryAdded: (callback: IpcCallback) => {
    ipcRenderer.on('on-new-memory-added', callback);

    return () => ipcRenderer.removeListener('on-new-memory-added', callback);
  },
  onMemoryDeleted: (callback: IpcCallback) => {
    ipcRenderer.on('on-memory-deleted', callback);

    return () => ipcRenderer.removeListener('on-memory-deleted', callback);
  },
  onMemoryEdited: (callback: IpcCallback) => {
    ipcRenderer.on('on-memory-edited', callback);

    return () => ipcRenderer.removeListener('on-memory-edited', callback);
  },
  onLocationChanged: (callback: IpcCallback) => {
    ipcRenderer.on('on-location-changed', callback);

    return () => ipcRenderer.removeListener('on-location-changed', callback);
  },
  onSimsChanged: (callback: IpcCallback) => {
    ipcRenderer.on('on-sims-changed', callback);

    return () => ipcRenderer.removeListener('on-sims-changed', callback);
  },
  onInteractionsChanged: (callback: IpcCallback) => {
    ipcRenderer.on('on-interactions-changed', callback);

    return () => ipcRenderer.removeListener('on-interactions-changed', callback);
  },
  onDatabaseLoaded: (callback: IpcCallback) => {
    ipcRenderer.on('on-database-loaded', callback);

    return () => ipcRenderer.removeListener('on-database-loaded', callback);
  },
  onDatabaseUnloaded: (callback: IpcCallback) => {
    ipcRenderer.on('on-database-unloaded', callback);

    return () => ipcRenderer.removeListener('on-database-unloaded', callback);
  },
  onMapAnimation: (callback: IpcCallback) => {
    ipcRenderer.on('on-map-animation', callback);

    return () => ipcRenderer.removeListener('on-map-animation', callback);
  },
  apiKeyPasteButtonClick: () => {
    ipcRenderer.send('paste-clipboard-to-api-key-button-click');
  },
  onApiKeyPasteFromClipboard: (callback: IpcCallback) => {
    ipcRenderer.on('on-api-key-paste-from-clipboard', callback);

    return () => ipcRenderer.removeListener('on-api-key-paste-from-clipboard', callback);
  },
  onMapInteraction: (callback: IpcCallback) => {
    ipcRenderer.on('on-map-interaction', callback);

    return () => ipcRenderer.removeListener('on-map-interaction', callback);
  },
  onGoogleAuthComplete: (callback: IpcCallback) => {
    ipcRenderer.on('google-auth-complete', callback);

    return () => ipcRenderer.removeListener('google-auth-complete', callback);
  },
  onVoice: (callback: IpcCallback) => {
    ipcRenderer.on('on-voice', callback);

    return () => ipcRenderer.removeListener('on-voice', callback);
  },
  onWebsocketStatusChange: (callback: IpcCallback) => {
    ipcRenderer.on('websocket-status-change', callback);

    return () => ipcRenderer.removeListener('websocket-status-change', callback);
  },
  setAmplify: async (key: string, value: string): Promise<unknown> => {
    return ipcRenderer.invoke('set-amplify', key, value);
  },
  getAmplify: async (key: string): Promise<string | null> => {
    return ipcRenderer.invoke('get-amplify', key) as Promise<string | null>;
  },
  removeAmplify: async (key: string): Promise<unknown> => {
    return ipcRenderer.invoke('remove-amplify', key);
  },
  clearAmplify: async (): Promise<unknown> => {
    return ipcRenderer.invoke('reset-amplify');
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
