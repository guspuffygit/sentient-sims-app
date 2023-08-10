import { IpcMainEvent, dialog, ipcMain } from 'electron';
import { SettingsEnum, SettingsService } from './services/SettingsService';

const settingsService = new SettingsService();

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
    settingsService.set(SettingsEnum.OPENAI_MODEL, model);
  });
  ipcMain.on(
    'set-access-token',
    (_event: IpcMainEvent, accessToken: string) => {
      settingsService.set(SettingsEnum.ACCESS_TOKEN, accessToken);
    }
  );
}
