// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';
import { SettingsEnum } from './sentient-sims/models/SettingsEnum';

const electronHandler = {
  onDebugModeToggle: (callback: any) => {
    return ipcRenderer.on('debug-mode-toggle', callback);
  },
  onChatGeneration: (callback: any) => {
    return ipcRenderer.on('on-chat-generation', callback);
  },
  onPopupNotification: (callback: any) => {
    return ipcRenderer.on('popup-notification', callback);
  },
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  setSetting: (setting: SettingsEnum, value: any) => {
    ipcRenderer.send('set-setting', setting, value);
  },
  resetSetting: (setting: SettingsEnum) => {
    ipcRenderer.send('reset-setting', setting);
  },
  onAuth: (callback: any) => {
    ipcRenderer.on('on-auth', callback);
    function removeListener() {
      ipcRenderer.removeListener('on-auth', callback);
    }
    return removeListener;
  },
  onSuccessfulAuth: () => {
    ipcRenderer.send('on-successful-auth');
  },
  onSettingChange: (callback: any) => {
    ipcRenderer.on('setting-changed', callback);

    function removeListener() {
      ipcRenderer.removeListener('setting-changed', callback);
    }
    return removeListener;
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
