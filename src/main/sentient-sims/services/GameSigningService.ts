import * as fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import log from 'electron-log';
import { ApiContext } from './ApiContext';

const execFileAsync = promisify(execFile);

// The entitlement that lets the hardened-runtime game load dylibs not signed by
// EA (the dev ImGui overlay and _ctypes.dylib). Its presence means signed.
const LIBRARY_VALIDATION_ENTITLEMENT = 'com.apple.security.cs.disable-library-validation';

// Fallback install locations searched when the configured path is missing.
const CANDIDATE_APP_PATHS = ['/Applications/EA Games/The Sims 4.app', '/Applications/The Sims 4.app'];

export class GameSigningService {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  get supported(): boolean {
    return process.platform === 'darwin';
  }

  // The configured app bundle if it exists, otherwise the first candidate that
  // does, otherwise the configured path.
  private resolveGameExePath(): string {
    const configured = this.ctx.settings.gameAppPath;
    if (configured && fs.existsSync(exePathFor(configured))) {
      return exePathFor(configured);
    }
    const candidate = CANDIDATE_APP_PATHS.find((appPath) => fs.existsSync(exePathFor(appPath)));
    return exePathFor(candidate ?? configured);
  }

  // Verify the game is signed for overlay support and re-sign it if not. Meant
  // for app startup, so it never kills a game the user may be playing: if the
  // signature is missing while the game is running, it logs and leaves it for
  // the next mod update (which runs with the game closed).
  async ensureSigned(): Promise<void> {
    if (!this.supported) {
      return;
    }

    const gameExePath = this.resolveGameExePath();
    if (!fs.existsSync(gameExePath)) {
      log.info(`Skipping game signature check, The Sims 4 executable not found at ${gameExePath}`);
      return;
    }

    if (await this.isSigned(gameExePath)) {
      log.info('Game is already signed for overlay support');
      return;
    }

    if (await this.isGameRunning()) {
      log.warn(
        'Game is not signed for overlay support, but The Sims 4 is running. Skipping re-sign until next update.',
      );
      return;
    }

    log.info('Game is not signed for overlay support, re-signing');
    await this.writeSignature(gameExePath);
  }

  // Re-sign the game exe ad-hoc with the overlay entitlements. No-op off macOS.
  // Idempotent. Kills a running game first, so this is meant for the mod
  // install/update flow (which expects the game to be closed).
  async signGame(): Promise<void> {
    if (!this.supported) {
      return;
    }

    const gameExePath = this.resolveGameExePath();
    if (!fs.existsSync(gameExePath)) {
      log.info(`Skipping game re-sign, The Sims 4 executable not found at ${gameExePath}`);
      return;
    }

    await this.killGameIfRunning();
    await this.writeSignature(gameExePath);
  }

  private async writeSignature(gameExePath: string): Promise<void> {
    const backupPath = `${gameExePath}.original`;
    if (!fs.existsSync(backupPath)) {
      log.info(`Backing up original game exe to ${backupPath}`);
      fs.copyFileSync(gameExePath, backupPath);
    }

    const entitlementsPath = this.ctx.getAssetPath('game-entitlements.mac.plist');
    log.info(`Re-signing ${gameExePath} ad-hoc with entitlements ${entitlementsPath}`);
    await execFileAsync('codesign', [
      '--force',
      '--sign',
      '-',
      '--entitlements',
      entitlementsPath,
      '--options',
      'runtime',
      gameExePath,
    ]);
    log.info('Game re-signed for overlay support');
  }

  private async isSigned(gameExePath: string): Promise<boolean> {
    try {
      // codesign writes the entitlements dump to stderr; -entitlements - streams
      // the XML plist so we can string-match the entitlement key.
      const { stdout, stderr } = await execFileAsync('codesign', ['-d', '--entitlements', '-', gameExePath]);
      return `${stdout}${stderr}`.includes(LIBRARY_VALIDATION_ENTITLEMENT);
    } catch (error) {
      log.error(`Failed to read game exe entitlements: ${String(error)}`);
      return false;
    }
  }

  private async isGameRunning(): Promise<boolean> {
    try {
      await execFileAsync('pgrep', ['-x', 'The Sims 4']);
      return true;
    } catch {
      // pgrep exits non-zero when no matching process is running.
      return false;
    }
  }

  private async killGameIfRunning(): Promise<void> {
    try {
      await execFileAsync('pkill', ['-x', 'The Sims 4']);
      log.info('Killed running The Sims 4 process before re-signing');
    } catch (error) {
      // pkill exits non-zero when no matching process is running; that's fine.
      log.debug(`No running The Sims 4 process to kill (${String(error)})`);
    }
  }
}

function exePathFor(gameAppPath: string): string {
  return path.join(gameAppPath, 'Contents', 'MacOS', 'The Sims 4');
}
