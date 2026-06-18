import { globalShortcut } from 'electron';
import log from 'electron-log';
import { getAllBrowserWindows } from './util/browserWindows';

export default function registerDebugToggleHotkey() {
  const ret = globalShortcut.register('Control+Shift+D', () => {
    log.info('Control+Shift+D is pressed');

    getAllBrowserWindows().forEach((wnd) => {
      if (!wnd.webContents.isDestroyed()) {
        wnd.webContents.send('debug-mode-toggle');
      }
    });
  });

  if (!ret) {
    log.error('registration failed');
  }
}
