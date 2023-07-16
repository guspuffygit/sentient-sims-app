import { IpcMainEvent, dialog, ipcMain } from 'electron';
import { SettingsEnum, set } from './settings';

async function handleSelectDirectory() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (!canceled) {
    return filePaths[0];
  }

  return null;
}

export default function ipcHandlers() {
  ipcMain.handle('dialog:selectDirectory', handleSelectDirectory);
  ipcMain.on('set-openai-model', (_event: IpcMainEvent, model: string) => {
    set(SettingsEnum.OPENAI_MODEL, model);
  });
}
