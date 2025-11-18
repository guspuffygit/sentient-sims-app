import electron, { IpcMainEvent, clipboard, dialog, ipcMain, shell } from 'electron';
import log from 'electron-log';
import { SettingsEnum } from './models/SettingsEnum';
import { notifySettingChanged } from './util/notifyRenderer';
import { resolveHtmlPath } from '../util';
import { ApiContext } from './services/ApiContext';
import { InteractionDTO } from './db/dto/InteractionDTO';
import { Animation } from './models/Animation';

async function handleSelectDirectory() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (!canceled) {
    return filePaths[0];
  }

  return null;
}

export default function ipcHandlers(ctx: ApiContext) {
  ipcMain.handle('dialog:selectDirectory', handleSelectDirectory);
  ipcMain.on('set-setting', (_event: IpcMainEvent, setting: SettingsEnum, value: any) => {
    if (setting !== SettingsEnum.ACCESS_TOKEN) {
      log.debug(`set-setting: ${setting.toString()}, value: ${value}`);
    }
    ctx.settings.set(setting, value);

    notifySettingChanged(setting, value);
  });
  ipcMain.on('reset-setting', (_event: IpcMainEvent, setting: SettingsEnum) => {
    const value = ctx.settings.resetSetting(setting.toString());
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
  ipcMain.handle('save-interaction-locally', async (event, interaction: InteractionDTO) => {
    const interactionRepo = ctx.interactionRepository;
    return interactionRepo.saveLocalInteraction(interaction);
  });

  ipcMain.handle('save-animation-locally', async (event, animation: Animation) => {
    const animationService = ctx.animations;
    return animationService.saveLocalAnimation(animation);
  });
}
