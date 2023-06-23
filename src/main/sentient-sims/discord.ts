import path from 'path';
import * as fs from 'fs';
import log from 'electron-log';
import os from 'os';
import xml2js from 'xml2js';
import {
  getLastExceptionFiles,
  getLogsFile,
  getModsFolder,
  listFilesRecursively,
} from './directories';

const webhookUrl = [
  'https://d',
  'is',
  'cor',
  'd.co',
  'm/api/web',
  'hooks/111726887',
  '1007703041/7FZtuRpab',
  'IQ6SqQ_-Wsl',
  '0UfW1akAlbgnNVLW10',
  'eA5x_XDyyt6MTK36i',
  '1Ee5jO7kVJkyo',
].join('');

export default async function sendLogs() {
  const logId = Array.from({ length: 10 }, () =>
    Math.random().toString(36).charAt(2)
  ).join('');

  const errors = [];

  try {
    const formData = new FormData();
    try {
      formData.append(
        'content',
        [
          `Log id: ${logId}`,
          `Platform: ${os.platform()}`,
          `Architecture: ${os.arch()}`,
          `OS Release: ${os.release()}`,
        ].join('\n')
      );
    } catch (err: any) {
      const message = 'Error attaching log information';
      log.error(message, err);
      errors.push(message, err);
    }

    try {
      const filesList = listFilesRecursively(getModsFolder());
      const fileListBlob = new Blob([filesList.join('\n')], {
        type: 'text/plain',
      });
      formData.append('fileList', fileListBlob, 'fileList.txt');
    } catch (err: any) {
      const message = 'Error attaching file list';
      log.error(message, err);
      errors.push(message, err);
    }

    try {
      const logFile = getLogsFile();
      const blob = new Blob([logFile], { type: 'application/octet-stream' });
      formData.append('logs', blob, 'logs.txt');
    } catch (err: any) {
      const message = 'Error attaching mod log file';
      log.error(message, err);
      errors.push(message, err);
    }

    try {
      const lastExceptionFiles = getLastExceptionFiles();
      lastExceptionFiles.forEach((lastExceptionFile) => {
        const filename = path.basename(lastExceptionFile);
        const lastExceptionData = fs.readFileSync(lastExceptionFile, 'utf-8');
        let lastExceptionString = lastExceptionData;
        try {
          const parser = new xml2js.Parser();
          parser.parseString(lastExceptionData, (err: any, result: any) => {
            const stackTrace = result.root.report[0].desyncdata[0];
            lastExceptionString = `${stackTrace}`;
          });
        } catch (parseError: any) {
          const message = 'Error parsing lastException file';
          log.error(message, parseError);
          errors.push(message, parseError);
        }
        const lastExceptionBlob = new Blob([lastExceptionString], {
          type: 'text/plain',
        });
        formData.append(filename, lastExceptionBlob, filename);
      });
    } catch (err: any) {
      const message = 'Error attaching lastException files';
      log.error(message, err);
      errors.push(message, err);
    }

    try {
      const appLogFile = log.transports.file.getFile();
      const appLogs = fs.readFileSync(appLogFile.path, 'utf-8');
      const appLogsBlob = new Blob([appLogs], {
        type: 'text/plain',
      });
      formData.append('app-logs.log', appLogsBlob, 'app-logs.log');
    } catch (err: any) {
      const message = 'Error attaching app log file';
      log.error(message, err);
      errors.push(message, err);
    }

    try {
      const appLogFile = log.transports.file.getFile();
      const appLogs = fs.readFileSync(appLogFile.path, 'utf-8');
      const appLogsBlob = new Blob([appLogs], {
        type: 'text/plain',
      });
      formData.append('app-logs.log', appLogsBlob, 'app-logs.log');
    } catch (err: any) {
      const message = 'Error attaching app log file';
      log.error(message, err);
      errors.push(message, err);
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    });

    log.log(JSON.stringify(response, null, 2));

    if (!response.ok) {
      errors.push(
        `Failed to post message: ${response.status} ${response.statusText}.`
      );
      errors.push(await response.json());
    }
  } catch (err: any) {
    const message = 'Error sending logs';
    log.error(message, err);
    errors.push(message, err);
  }

  return {
    logId,
    errors,
  };
}
