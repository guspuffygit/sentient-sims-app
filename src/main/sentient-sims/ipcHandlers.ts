import { IpcMainEvent, clipboard, dialog, ipcMain, shell } from 'electron';
import log from 'electron-log';
import { SettingsEnum } from './models/SettingsEnum';
import { notifySettingChanged, sendSceneLineToMod } from './util/notifyRenderer';
import { unmarkScenePaced } from './util/pacedScenes';
import { DialogueLine } from './formatter/PromptFormatter';
import { getAllBrowserWindows } from './util/browserWindows';
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

async function handleSelectGameApp() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    defaultPath: '/Applications',
    properties: ['openFile'],
    filters: [{ name: 'Applications', extensions: ['app'] }],
  });
  if (!canceled) {
    return filePaths[0];
  }

  return null;
}

export default function ipcHandlers(ctx: ApiContext) {
  ipcMain.handle('dialog:selectDirectory', handleSelectDirectory);
  ipcMain.handle('dialog:selectGameApp', handleSelectGameApp);
  ipcMain.on('set-setting', (_event: IpcMainEvent, setting: SettingsEnum, value: unknown) => {
    if (setting !== SettingsEnum.ACCESS_TOKEN) {
      log.debug(`set-setting: ${setting}, value: ${String(value)}`);
    }
    ctx.settings.set(setting, value);

    notifySettingChanged(setting, value);
  });
  ipcMain.on('reset-setting', (_event: IpcMainEvent, setting: SettingsEnum) => {
    const value = ctx.settings.resetSetting(setting.toString());
    notifySettingChanged(setting, value);
  });
  ipcMain.on('on-successful-auth', () => {
    getAllBrowserWindows().forEach((wnd) => {
      if (!wnd.webContents.isDestroyed()) {
        void wnd.loadURL(resolveHtmlPath('index.html'));
      }
    });
  });
  ipcMain.on('open-browser-link', (_event: IpcMainEvent, link: string) => {
    void shell.openExternal(link);
  });
  // The renderer owns playback timing: it reports each scene line as it starts playing
  // so the in-game subtitle stays in step with the voices
  ipcMain.on('scene-line-shown', (_event: IpcMainEvent, line: DialogueLine & { preamble?: string }) => {
    sendSceneLineToMod(line);
  });
  // A paced scene the renderer never played would otherwise display nowhere in-game: its
  // block subtitle was suppressed on the promise that lines would stream. Un-mark it so the
  // memory_created broadcast falls back to the normal subtitle block.
  ipcMain.on('scene-dropped', (_event: IpcMainEvent, pacedText: string) => {
    unmarkScenePaced(pacedText);
  });
  ipcMain.on('paste-clipboard-to-api-key-button-click', () => {
    const clipboardResults = clipboard.readText();
    getAllBrowserWindows().forEach((wnd) => {
      if (!wnd.webContents.isDestroyed()) {
        wnd.webContents.send('on-api-key-paste-from-clipboard', clipboardResults);
      }
    });
  });
  ipcMain.handle('save-interaction-locally', (event, interaction: InteractionDTO) => {
    const interactionRepo = ctx.interactionRepository;
    interactionRepo.saveLocalInteraction(interaction);
  });

  ipcMain.handle('save-animation-locally', (event, animation: Animation) => {
    const animationService = ctx.animations;
    animationService.saveLocalAnimation(animation);
  });
}
