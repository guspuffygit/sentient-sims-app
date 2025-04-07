/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import electron, {
  app,
  BrowserWindow,
  shell,
  session,
  WebRequestFilter,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import registerDebugToggleHotkey from './sentient-sims/registerDebugToggleHotkey';
import ipcHandlers from './sentient-sims/ipcHandlers';
import { runApi, runWebSocketServer } from './sentient-sims/api';
import { SettingsService } from './sentient-sims/services/SettingsService';
import { DirectoryService } from './sentient-sims/services/DirectoryService';
import { appApiPort } from './sentient-sims/constants';
import { SettingsEnum } from './sentient-sims/models/SettingsEnum';
import {
  disableDebugLogging,
  enableDebugLogging,
} from './sentient-sims/util/debugLog';

log.initialize({ preload: true });
let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

app.commandLine.appendSwitch('enable-unsafe-webgpu');
app.commandLine.appendSwitch('enable-features', 'Vulkan');

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1400,
    height: 850,
    autoHideMenuBar: true,
    icon: getAssetPath('icon.png'),
    thickFrame: false,
    webPreferences: {
      webSecurity: false, // Disable web security
      allowRunningInsecureContent: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  registerDebugToggleHotkey();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  ipcHandlers();

  const settingsService = new SettingsService();
  const directoryService = new DirectoryService(settingsService);

  if (settingsService.get(SettingsEnum.DEBUG_LOGS)) {
    enableDebugLogging();
  } else {
    disableDebugLogging();
  }

  runWebSocketServer(settingsService, directoryService);
  runApi({
    getAssetPath,
    port: appApiPort,
    settingsService,
    directoryService,
  });

  // Auto update
  log.transports.file.level = 'info';
  autoUpdater.logger = log;
  // Remove this after testing
  autoUpdater.allowPrerelease = true;
  autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.signals.updateDownloaded((info) => {
    log.info(`Quitting and installing forcefully: ${info.version}`);
    autoUpdater.quitAndInstall(false, true);
  });
  autoUpdater
    .checkForUpdates()
    .then((updateResult) => {
      if (updateResult && updateResult.updateInfo) {
        log.info(`New update is ready: ${updateResult.updateInfo.version}`);
        electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
          if (wnd.webContents?.isDestroyed() === false) {
            wnd.webContents.send('new-update-ready');
          }
        });
      }
    })
    .catch((err) => log.error(`Error checking for updates`, err));
};

/**
 * Add event listeners...
 */
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });

    const filter: WebRequestFilter = {
      urls: [`http://localhost:${appApiPort}/login/*`],
    };

    session.defaultSession.webRequest.onBeforeRequest(
      filter,
      // eslint-disable-next-line func-names
      function (details) {
        const { url } = details;
        log.debug(`url hit: ${url}`);
        if (url.includes('/login/callback')) {
          log.debug(`/login/callback initiated for url: ${url}`);
          mainWindow?.webContents.loadURL(resolveHtmlPath('index.html'));
          setTimeout(() => {
            electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
              if (wnd.webContents?.isDestroyed() === false) {
                log.debug('Sending onAuth');
                wnd.webContents.send('on-auth', url);
              }
            });
          }, 3000);
        }
        if (url.includes('/login/signout')) {
          log.debug('/login/signout initiated');
          session.defaultSession.clearAuthCache();
          session.defaultSession.clearCache();
          session.defaultSession.clearStorageData();
          mainWindow?.loadURL(resolveHtmlPath('index.html'));
        }
      },
    );
  })
  .catch(console.log);
