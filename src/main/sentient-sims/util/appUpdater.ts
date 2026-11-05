import { app, dialog } from 'electron';
import log from 'electron-log';
// electron-updater is CommonJS; import the default (whole module) and destructure
// locally. A bare dynamic import() would be left external by the bundler and break
// the packaged app (electron-updater ships only in the bundle, not release/app/node_modules).
import electronUpdater from 'electron-updater';

let listening = false;
let inFlight: Promise<void> | undefined;
let downloaded = false;

function getAutoUpdater() {
  // eslint-disable-next-line import-x/no-named-as-default-member
  const { autoUpdater } = electronUpdater;
  if (!listening) {
    listening = true;
    autoUpdater.logger = log;
    autoUpdater.on('update-downloaded', (info) => {
      downloaded = true;
      void dialog
        .showMessageBox({
          type: 'question',
          buttons: ['Install and Restart'],
          defaultId: 0,
          message: `Update ${info.version} has been downloaded and is ready to install, please restart to install the update.`,
        })
        .then(() => {
          autoUpdater.quitAndInstall();
          return undefined;
        });
    });
  }
  return autoUpdater;
}

/**
 * Checks GitHub for a newer app and downloads it; the install dialog opens when the
 * download lands. A call made while another check or download runs joins it, and once
 * an update is downloaded further calls do nothing, so one install happens at most.
 * `notify` adds electron-updater's OS notification (the startup check).
 */
export function checkForAppUpdate(options: { notify: boolean }): Promise<void> {
  if (downloaded) {
    return Promise.resolve();
  }
  if (inFlight) {
    return inFlight;
  }
  const run = (async () => {
    try {
      const autoUpdater = getAutoUpdater();
      const result = options.notify
        ? await autoUpdater.checkForUpdatesAndNotify()
        : await autoUpdater.checkForUpdates();
      await result?.downloadPromise;
    } catch (err) {
      log.error('Unable to check for app updates', err);
    } finally {
      inFlight = undefined;
    }
  })();
  inFlight = run;
  return run;
}

// Dotted numeric versions like 4.6.11; undefined when either side is not one
function compareVersions(a: string, b: string): number | undefined {
  const parse = (version: string) => (/^\d+(\.\d+)*$/.test(version) ? version.split('.').map(Number) : undefined);
  const left = parse(a);
  const right = parse(b);
  if (!left || !right) {
    return undefined;
  }
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

// The mod sends the app version it needs in mod_info on every websocket open
export function updateAppIfModRequiresNewer(requiredAppVersion: string) {
  const appVersion = app.getVersion();
  const comparison = compareVersions(appVersion, requiredAppVersion);
  if (comparison === undefined) {
    log.warn(`Cannot compare app version ${appVersion} with the mod's required ${requiredAppVersion}`);
    return;
  }
  if (comparison >= 0) {
    return;
  }
  log.info(`Mod requires app ${requiredAppVersion} but this is ${appVersion}, checking for an app update`);
  void checkForAppUpdate({ notify: false });
}
