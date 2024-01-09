import electron from 'electron';

export default function notifySettingChanged(setting: any, value: any) {
  electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
    if (wnd.webContents?.isDestroyed() === false) {
      wnd.webContents.send('setting-changed', setting, value);
    }
  });
}
