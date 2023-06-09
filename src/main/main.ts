/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import express from 'express';
import path from 'path';
import {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  IpcMainEvent,
  shell,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { encode } from '@nem035/gpt-3-encoder';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {
  generate,
  generateChatCompletion,
  OpenAIKeyNotSetError,
  testOpenAI,
} from './sentient-sims/openai';
import { getSettings, writeSettings } from './sentient-sims/directories';
import { getModVersion, updateMod } from './sentient-sims/updater';
import sendLogs from './sentient-sims/discord';
import { systemPrompt as defaultSystemPrompt } from './contants';
import {
  deleteLastExceptionFiles,
  getParsedLastExceptionFiles,
} from './sentient-sims/lastException';
import {
  getSetting,
  set,
  setSetting,
  SettingsEnum,
} from './sentient-sims/settings';

// Optional, initialize the logger for any renderer processses
log.initialize({ preload: true });

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

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
      forceDownload
    )
    .catch(console.log);
};

async function handleSelectDirectory() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (!canceled) {
    return filePaths[0];
  }

  return null;
}

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
    width: 959,
    height: 770,
    icon: getAssetPath('icon.png'),
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

  const ret = globalShortcut.register('Control+Shift+D', () => {
    console.log('Control+Shift+D is pressed');
    if (mainWindow) {
      mainWindow.webContents.send('debug-mode-toggle');
    }
  });

  if (!ret) {
    console.log('registration failed');
  }

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
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

let openAIModel = 'gpt-3.5-turbo';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleSetOpenAIModel = (event: IpcMainEvent, model: string) => {
  openAIModel = model;
  set(SettingsEnum.OPENAI_MODEL, model);
};

app
  .whenReady()
  .then(() => {
    ipcMain.handle('dialog:selectDirectory', handleSelectDirectory);
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });

    ipcMain.on('set-openai-model', handleSetOpenAIModel);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.on('verify-mod-folder', (event: IpcMainEvent, folder: string) => {
      if (mainWindow) {
        mainWindow.webContents.send('verify-mod-folder', 'message');
      }
    });
  })
  .catch(console.log);

const expressApp = express();
expressApp.use(express.json());
const port = 25148;

expressApp.get('/health', (req, res) => {
  res.send('OK');
});

expressApp.get('/test-open-ai', async (req, res) => {
  try {
    const response = await testOpenAI();
    res.send(response);
  } catch (e: any) {
    if (e instanceof OpenAIKeyNotSetError) {
      res.status(400).send({ status: 'API key not set!' });
    } else {
      res.status(500).send({ error: `${e.name}: ${e.message}` });
    }
  }
});

expressApp.post('/api/v1/count', (req, res) => {
  res.json({ count: encode(req.body.prompt).length });
});

expressApp.post('/api/v1/generate', async (req, res) => {
  const { body } = req;
  const { prompt, model, systemPrompt } = body;
  const maxLength = body.max_length;

  const response = await generate(
    maxLength,
    prompt,
    model || openAIModel,
    mainWindow,
    systemPrompt || defaultSystemPrompt
  );
  res.json(response);
});

expressApp.post('/generate', async (req, res) => {
  const { body } = req;
  const result = await generateChatCompletion(body);
  res.json(result);
});

expressApp.get('/send-logs', async (req, res) => {
  const result = await sendLogs();
  res.json(result);
});

expressApp.get('/files/last-exception', async (req, res) => {
  const lastExceptionFiles = getParsedLastExceptionFiles();
  res.json(lastExceptionFiles);
});

expressApp.delete('/files/last-exception', async (req, res) => {
  deleteLastExceptionFiles();
  res.json({ done: 'done' });
});

expressApp.get('/settings/app/:appSetting', async (req, res) => {
  const { appSetting } = req.params;
  res.json({ value: getSetting(appSetting) });
});

expressApp.post('/settings/app/:appSetting', async (req, res) => {
  const { appSetting } = req.params;
  const { value } = req.body;
  log.info(`Setting app setting: ${appSetting}, to value: ${value}`);
  res.json({ value: setSetting(appSetting, value) });
});

expressApp.get('/settings', async (req, res) => {
  res.json(getSettings());
});

expressApp.get('/versions/mod', async (req, res) => {
  res.json(getModVersion());
});

expressApp.get('/versions/app', async (req, res) => {
  res.json({ version: app.getVersion() });
});

expressApp.post('/settings', async (req, res) => {
  writeSettings(req.body);
  res.json(getSettings());
});

expressApp.post('/update/mod', async (req, res) => {
  try {
    log.info('Starting update.');
    await updateMod(req.body);
    res.json({ done: 'done' });
  } catch (err: any) {
    const response = {
      error: {
        stack: err?.stack,
        message: err?.message,
      },
    };
    log.error(`Error updating: ${response}`);
    res.status(500).json(response);
  }
});

expressApp.listen(port, () => {
  log.debug(`Server is running on port ${port}`);
});
