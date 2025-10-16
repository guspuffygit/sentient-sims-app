import * as fs from 'fs';
import { ApiContext } from './ApiContext';

export class LogsService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  /**
   * Reads logs from the specified directory and file.
   * If the file does not exist, returns an empty array.
   * @param dirPath The directory path.
   * @returns Promise that resolves to an array of log lines.
   */
  async readLogs(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.ctx.directory.getLogsFile(), 'utf-8', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            // File not found
            resolve([]);
            return;
          }
          reject(err);
          return;
        }

        const lines = data.split('\n').filter((line) => line.trim() !== ''); // Filter out any empty lines
        resolve(lines);
      });
    });
  }

  /**
   * Appends the specified lines to the log file.
   * If the file does not exist, it will be created.
   * @param dirPath The directory path.
   * @param lines The lines to append.
   * @returns Promise that resolves when the operation is complete.
   */
  async appendLog(lines: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const dataToAppend = `${lines.join('\n')}\n`;

      fs.appendFile(this.ctx.directory.getLogsFile(), dataToAppend, 'utf-8', (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }
}
