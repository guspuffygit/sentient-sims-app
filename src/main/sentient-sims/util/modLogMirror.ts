import log from 'electron-log';
import { LogLevel } from '../models/LogLevel';
import { LogMessage } from '../models/LogMessage';

// Mod log lines used to live only in Mods/sentient-sims/logs.txt, stamped in UTC by
// formatLog, while everything the app itself logs ([Scene], PUSHDIAG, cognition) sits
// in electron-log's main.log with local timestamps. Reading a stream session meant
// two files and a timezone conversion; on 2026-09-22 the mod's lines were declared
// missing when they were merely four hours away. INFO and above are mirrored into
// main.log so the mod's own stall watchdog lines ("game thread stall: ...") land next
// to what the app was doing. DEBUG stays out: the interaction log alone is ~30 lines/s.
export const MOD_LOG_PREFIX = '[Mod]';

export function modLogMirrorLine(message: LogMessage): string | undefined {
  if (message.level === (LogLevel.DEBUG as string)) {
    return undefined;
  }
  return `${MOD_LOG_PREFIX} ${message.level} ${message.message}`;
}

export function mirrorModLog(message: LogMessage): void {
  const line = modLogMirrorLine(message);
  if (line === undefined) {
    return;
  }
  if (message.level === (LogLevel.ERROR as string)) {
    log.error(line);
  } else if (message.level === 'WARN') {
    log.warn(line);
  } else {
    log.info(line);
  }
}
