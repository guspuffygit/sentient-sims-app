import { IpcMainEvent, dialog, ipcMain, BrowserWindow } from 'electron';
import { SettingsEnum } from './models/SettingsEnum';
import { SettingsService } from './services/SettingsService';
import { resolveHtmlPath } from '../util';

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

export default function ipcHandlers(mainWindow: BrowserWindow) {
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
  ipcMain.on('on-successful-auth', () => {
    mainWindow.loadURL(resolveHtmlPath('index.html'));
  });
}
