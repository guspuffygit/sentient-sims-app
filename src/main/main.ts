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
import sourceMapSupport from 'source-map-support';
import { app, BrowserWindow, shell, session, WebRequestFilter, dialog } from 'electron';
import log from 'electron-log';
import MenuBuilder from './menu';
import registerDebugToggleHotkey from './sentient-sims/registerDebugToggleHotkey';
import ipcHandlers from './sentient-sims/ipcHandlers';
import { runApi, runWebSocketServer } from './sentient-sims/api';
import { SettingsService } from './sentient-sims/services/SettingsService';
import { DirectoryService } from './sentient-sims/services/DirectoryService';
import { appApiPort } from './sentient-sims/constants';
import { SettingsEnum } from './sentient-sims/models/SettingsEnum';
import { installExtension, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { disableDebugLogging, enableDebugLogging } from './sentient-sims/util/debugLog';
import debug from 'electron-debug';
import { resolveHtmlPath } from './util';
import { ApiContext } from './sentient-sims/services/ApiContext';

log.initialize({ preload: true });

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  sourceMapSupport.install();
}

const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  debug();
}

const installExtensions = async () => {
  return installExtension([REACT_DEVELOPER_TOOLS]).catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  let RESOURCES_PATH = path.join(process.cwd(), 'assets');
  let preloadPath = path.join(process.cwd(), '.erb/dll/preload.js');
  if (app.isPackaged) {
    RESOURCES_PATH = path.join(process.resourcesPath, 'assets');
    preloadPath = path.join(process.resourcesPath, 'app.asar/dist/main/preload.js');
  }

  log.info(`RESOURCES_PATH: ${RESOURCES_PATH}`);
  log.info(`PRELOAD: ${preloadPath}`);
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
      preload: preloadPath,
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

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('https://sentientsimulations.auth.us-east-1.amazoncognito.com/oauth2/authorize')) {
      event.preventDefault();
      shell.openExternal(url);
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

  const settingsService = new SettingsService();
  const directoryService = new DirectoryService(settingsService);
  const ctx = new ApiContext({
    getAssetPath,
    port: appApiPort,
    settingsService,
    directoryService,
  });
  ipcHandlers(ctx);

  if (ctx.settings.get(SettingsEnum.DEBUG_LOGS)) {
    enableDebugLogging();
  } else {
    disableDebugLogging();
  }

  runWebSocketServer(ctx);
  runApi(ctx);

  log.transports.file.level = 'info';

  const { autoUpdater } = await import('electron-updater');

  autoUpdater.logger = log;
  try {
    autoUpdater.checkForUpdatesAndNotify();
    if (mainWindow) {
      autoUpdater.on('update-downloaded', async (info) => {
        await dialog.showMessageBox({
          type: 'question',
          buttons: ['Install and Restart'],
          defaultId: 0,
          message: `Update ${info.version} has been downloaded and is ready to install, please restart to install the update.`,
        });

        autoUpdater.quitAndInstall();
      });
    }
  } catch (err) {
    log.error(`Unable to check for updates and notify`, err);
  }

  const filter: WebRequestFilter = {
    urls: [`http://localhost:${appApiPort}/login/*`],
  };

  session.defaultSession.webRequest.onBeforeRequest(filter, (details) => {
    const { url } = details;
    log.debug(`url hit: ${url}`);
    if (url.includes('/login/signout')) {
      log.debug('/login/signout initiated');
      session.defaultSession.clearAuthCache();
      session.defaultSession.clearCache();
      session.defaultSession.clearStorageData();
      mainWindow?.loadURL(resolveHtmlPath('index.html'));
    }
  });
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
  })
  .catch(log.error);
