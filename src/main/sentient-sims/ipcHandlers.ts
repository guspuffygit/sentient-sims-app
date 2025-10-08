import electron, { IpcMainEvent, clipboard, dialog, ipcMain, shell } from 'electron';
import log from 'electron-log';
import { SettingsEnum } from './models/SettingsEnum';
import { SettingsService } from './services/SettingsService';
import { notifySettingChanged } from './util/notifyRenderer';
import { resolveHtmlPath } from '../util';

async function handleSelectDirectory() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (!canceled) {
    return filePaths[0];
  }

  return null;
}

export default function ipcHandlers(settingsService: SettingsService) {
  ipcMain.handle('dialog:selectDirectory', handleSelectDirectory);
  ipcMain.on('set-setting', (_event: IpcMainEvent, setting: SettingsEnum, value: any) => {
    if (setting !== SettingsEnum.ACCESS_TOKEN) {
      log.debug(`set-setting: ${setting.toString()}, value: ${value}`);
    }
    settingsService.set(setting, value);

    notifySettingChanged(setting, value);
  });
  ipcMain.on('reset-setting', (_event: IpcMainEvent, setting: SettingsEnum) => {
    const value = settingsService.resetSetting(setting.toString());
    notifySettingChanged(setting, value);
  });
  ipcMain.on('on-successful-auth', () => {
    electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
      if (wnd.webContents?.isDestroyed() === false) {
        wnd.loadURL(resolveHtmlPath('index.html'));
      }
    });
  });
  ipcMain.on('open-browser-link', (_event: IpcMainEvent, link: string) => {
    shell.openExternal(link);
  });
  ipcMain.on('paste-clipboard-to-api-key-button-click', () => {
    const clipboardResults = clipboard.readText();
    electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
      if (wnd.webContents?.isDestroyed() === false) {
        wnd.webContents.send('on-api-key-paste-from-clipboard', clipboardResults);
      }
    });
  });
}
