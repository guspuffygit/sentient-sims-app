import electron, { globalShortcut } from 'electron';
import log from 'electron-log';

export default function registerDebugToggleHotkey() {
  const ret = globalShortcut.register('Control+Shift+D', () => {
    log.info('Control+Shift+D is pressed');

    electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
      if (wnd.webContents?.isDestroyed() === false) {
        wnd.webContents.send('debug-mode-toggle');
      }
    });
  });

  if (!ret) {
    log.error('registration failed');
  }
}
