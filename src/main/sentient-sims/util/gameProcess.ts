import { execFile } from 'child_process';
import { promisify } from 'util';
import log from 'electron-log';

const execFileAsync = promisify(execFile);

// TS4 keeps its loaded .package files locked while running, so extracting the
// mod update over them fails partway and leaves an inconsistent install.
const WINDOWS_GAME_PROCESSES = ['ts4_x64.exe', 'ts4.exe'];

export async function isGameRunning(): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execFileAsync('tasklist', ['/NH', '/FO', 'CSV']);
      const processList = stdout.toLowerCase();
      return WINDOWS_GAME_PROCESSES.some((name) => processList.includes(`"${name}"`));
    }
    if (process.platform === 'darwin') {
      await execFileAsync('pgrep', ['-x', 'The Sims 4']);
      return true;
    }
  } catch (err) {
    // pgrep exits non-zero when nothing matches; a tasklist failure shouldn't
    // block updating, so treat both as "not running"
    log.debug(`Game process check fell through: ${String(err)}`);
  }
  return false;
}
