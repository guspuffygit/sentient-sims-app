import log from 'electron-log';

export function disableDebugLogging() {
  log.transports.file.level = 'info';
  log.transports.console.level = 'info';
}

export function enableDebugLogging() {
  log.transports.file.level = 'debug';
  log.transports.console.level = 'debug';
}
