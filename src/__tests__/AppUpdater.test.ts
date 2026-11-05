import { EventEmitter } from 'events';

type DownloadedInfo = { version: string };

const electron = vi.hoisted(() => ({
  appVersion: '4.6.10',
  showMessageBox: vi.fn(() => Promise.resolve({ response: 0 })),
}));

const updater = vi.hoisted(() => {
  const state = {
    emitter: undefined as unknown as EventEmitter,
    finishDownload: undefined as undefined | (() => void),
    checkForUpdates: vi.fn(),
    checkForUpdatesAndNotify: vi.fn(),
    quitAndInstall: vi.fn(),
  };
  return state;
});

vi.mock('electron', () => ({
  app: { getVersion: () => electron.appVersion },
  dialog: { showMessageBox: electron.showMessageBox },
}));

vi.mock('electron-updater', () => ({
  default: {
    get autoUpdater() {
      return {
        logger: undefined,
        on: (event: string, listener: (info: DownloadedInfo) => void) => updater.emitter.on(event, listener),
        checkForUpdates: updater.checkForUpdates,
        checkForUpdatesAndNotify: updater.checkForUpdatesAndNotify,
        quitAndInstall: updater.quitAndInstall,
      };
    },
  },
}));

// A check that finds an update and holds its download open until finishDownload runs
function pendingDownloadResult() {
  const downloadPromise = new Promise<string[]>((resolve) => {
    updater.finishDownload = () => {
      updater.emitter.emit('update-downloaded', { version: '4.6.11' });
      resolve([]);
    };
  });
  return Promise.resolve({ downloadPromise });
}

async function loadUpdater() {
  vi.resetModules();
  return import('main/sentient-sims/util/appUpdater');
}

describe('appUpdater', () => {
  beforeEach(() => {
    electron.appVersion = '4.6.10';
    electron.showMessageBox.mockClear();
    updater.emitter = new EventEmitter();
    updater.finishDownload = undefined;
    updater.checkForUpdates.mockReset().mockImplementation(pendingDownloadResult);
    updater.checkForUpdatesAndNotify.mockReset().mockImplementation(pendingDownloadResult);
    updater.quitAndInstall.mockReset();
  });

  test('a mod that needs a newer app starts a plain update check', async () => {
    const { updateAppIfModRequiresNewer } = await loadUpdater();

    updateAppIfModRequiresNewer('4.6.11');

    expect(updater.checkForUpdates).toHaveBeenCalledTimes(1);
    expect(updater.checkForUpdatesAndNotify).not.toHaveBeenCalled();
  });

  test('versions compare by number, not by text', async () => {
    electron.appVersion = '4.6.9';
    const { updateAppIfModRequiresNewer } = await loadUpdater();

    updateAppIfModRequiresNewer('4.6.10');

    expect(updater.checkForUpdates).toHaveBeenCalledTimes(1);
  });

  test('a mod that the running app satisfies starts no check', async () => {
    const { updateAppIfModRequiresNewer } = await loadUpdater();

    updateAppIfModRequiresNewer('4.6.10');
    updateAppIfModRequiresNewer('4.5.0');
    updateAppIfModRequiresNewer('4.6.9');

    expect(updater.checkForUpdates).not.toHaveBeenCalled();
  });

  test('a version that is not dotted numbers starts no check', async () => {
    const { updateAppIfModRequiresNewer } = await loadUpdater();

    updateAppIfModRequiresNewer('unknown');
    electron.appVersion = 'none';
    updateAppIfModRequiresNewer('4.6.11');

    expect(updater.checkForUpdates).not.toHaveBeenCalled();
  });

  test('a mod check during the startup download joins it', async () => {
    const { checkForAppUpdate, updateAppIfModRequiresNewer } = await loadUpdater();

    const startup = checkForAppUpdate({ notify: true });
    updateAppIfModRequiresNewer('4.6.11');
    updateAppIfModRequiresNewer('4.6.11');
    await vi.waitFor(() => {
      expect(updater.finishDownload).toBeDefined();
    });
    updater.finishDownload?.();
    await startup;

    expect(updater.checkForUpdatesAndNotify).toHaveBeenCalledTimes(1);
    expect(updater.checkForUpdates).not.toHaveBeenCalled();
    expect(electron.showMessageBox).toHaveBeenCalledTimes(1);
  });

  test('a downloaded update shows one Install and Restart dialog and blocks later checks', async () => {
    const { checkForAppUpdate, updateAppIfModRequiresNewer } = await loadUpdater();

    const check = checkForAppUpdate({ notify: false });
    await vi.waitFor(() => {
      expect(updater.finishDownload).toBeDefined();
    });
    updater.finishDownload?.();
    await check;
    await vi.waitFor(() => {
      expect(updater.quitAndInstall).toHaveBeenCalledTimes(1);
    });

    expect(electron.showMessageBox).toHaveBeenCalledWith(expect.objectContaining({ buttons: ['Install and Restart'] }));

    updateAppIfModRequiresNewer('4.6.11');
    await checkForAppUpdate({ notify: true });

    expect(updater.checkForUpdates).toHaveBeenCalledTimes(1);
    expect(updater.checkForUpdatesAndNotify).not.toHaveBeenCalled();
    expect(electron.showMessageBox).toHaveBeenCalledTimes(1);
  });

  test('a failed check lets the next one run', async () => {
    const { checkForAppUpdate } = await loadUpdater();
    updater.checkForUpdates.mockReset().mockRejectedValueOnce(new Error('offline'));

    await checkForAppUpdate({ notify: false });
    updater.checkForUpdates.mockImplementation(() => Promise.resolve(null));
    await checkForAppUpdate({ notify: false });

    expect(updater.checkForUpdates).toHaveBeenCalledTimes(2);
  });
});
