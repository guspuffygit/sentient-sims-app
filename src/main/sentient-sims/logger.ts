/* eslint no-console: off */
import { isDebugMode } from 'main/util';

const isDebug = isDebugMode();

export default class Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  debug(message: string) {
    if (isDebug) {
      console.debug(`[${this.prefix}] ${message}`);
    }
  }

  log(message: string) {
    if (isDebug) {
      console.log(`[${this.prefix}] ${message}`);
    }
  }

  error(message: string) {
    console.error(`[${this.prefix}] ${message}`);
  }

  warn(message: string) {
    console.warn(`[${this.prefix}] ${message}`);
  }
}
