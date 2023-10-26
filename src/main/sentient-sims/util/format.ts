import { LogMessage } from '../models/LogMessage';

export function epochToFormattedDate(epochStr: string): string {
  const epoch = parseInt(epochStr, 10);
  if (Number.isNaN(epoch)) {
    throw new Error('Invalid epoch string');
  }

  const date = new Date(epoch);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getUTCDate()).padStart(2, '0');

  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds},${milliseconds}`;
}

export function formatLog(logMessage: LogMessage) {
  const timestamp = epochToFormattedDate(logMessage.timestamp);
  return `${timestamp} - ${logMessage.level} - ${logMessage.message}`;
}
