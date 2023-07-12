// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';
import { systemPrompt } from './contants';

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
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  systemPrompt,
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
