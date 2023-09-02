import electron from 'electron';

export function sendPopUpNotification(message?: string) {
  if (message) {
    electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
      if (wnd.webContents?.isDestroyed() === false) {
        wnd.webContents.send('popup-notification', message);
      }
    });
  }
}
