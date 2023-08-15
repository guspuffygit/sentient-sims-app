// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';

const electronHandler = {
  onDebugModeToggle: (callback: any) => {
    return ipcRenderer.on('debug-mode-toggle', callback);
  },
  setOpenAIModel: (openAIModel: string) => {
    ipcRenderer.send('set-openai-model', openAIModel);
  },
  onChatGeneration: (callback: any) => {
    return ipcRenderer.on('on-chat-generation', callback);
  },
  onPopupNotification: (callback: any) => {
    return ipcRenderer.on('popup-notification', callback);
  },
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  setAccessToken: (accessToken: string) => {
    ipcRenderer.send('set-access-token', accessToken);
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
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
