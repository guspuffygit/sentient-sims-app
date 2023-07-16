import { BrowserWindow, globalShortcut } from 'electron';
import log from 'electron-log';

export default function registerDebugToggleHotkey(mainWindow: BrowserWindow) {
  const ret = globalShortcut.register('Control+Shift+D', () => {
    log.info('Control+Shift+D is pressed');
    if (mainWindow) {
      mainWindow.webContents.send('debug-mode-toggle');
    }
  });

  if (!ret) {
    log.error('registration failed');
  }
}
