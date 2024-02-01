// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';
import { SettingsEnum } from './sentient-sims/models/SettingsEnum';

const electronHandler = {
  onDebugModeToggle: (callback: any) => {
    return ipcRenderer.on('debug-mode-toggle', callback);
  },
  onChatGeneration: (callback: any) => {
    ipcRenderer.on('on-chat-generation', callback);

    return () => ipcRenderer.removeListener('on-chat-generation', callback);
  },
  onPopupNotification: (callback: any) => {
    return ipcRenderer.on('popup-notification', callback);
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
  onAuth: (callback: any) => {
    ipcRenderer.on('on-auth', callback);

    return () => ipcRenderer.removeListener('on-auth', callback);
  },
  onSuccessfulAuth: () => {
    ipcRenderer.send('on-successful-auth');
  },
  onSettingChange: (callback: any) => {
    ipcRenderer.on('setting-changed', callback);

    return () => ipcRenderer.removeListener('setting-changed', callback);
  },
  openBrowserLink: (link: string) => {
    ipcRenderer.send('open-browser-link', link);
  },
  onNewMemoryAdded: (callback: any) => {
    ipcRenderer.on('on-new-memory-added', callback);

    return () => ipcRenderer.removeListener('on-new-memory-added', callback);
  },
  onLocationChanged: (callback: any) => {
    ipcRenderer.on('on-location-changed', callback);

    return () => ipcRenderer.removeListener('on-location-changed', callback);
  },
  onSimsChanged: (callback: any) => {
    ipcRenderer.on('on-sims-changed', callback);

    return () => ipcRenderer.removeListener('on-sims-changed', callback);
  },
  onInteractionsChanged: (callback: any) => {
    ipcRenderer.on('on-interactions-changed', callback);

    return () =>
      ipcRenderer.removeListener('on-interactions-changed', callback);
  },
  onDatabaseLoaded: (callback: any) => {
    ipcRenderer.on('on-database-loaded', callback);

    return () => ipcRenderer.removeListener('on-database-loaded', callback);
  },
  onDatabaseUnloaded: (callback: any) => {
    ipcRenderer.on('on-database-unloaded', callback);

    return () => ipcRenderer.removeListener('on-database-unloaded', callback);
  },
  onMapAnimation: (callback: any) => {
    ipcRenderer.on('on-map-animation', callback);

    return () => ipcRenderer.removeListener('on-map-animation', callback);
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
