import log from 'electron-log';
import path from 'path';
import * as fs from 'fs';
import xml2js from 'xml2js';
import { getLastExceptionFiles } from './directories';

export type LastExceptionFile = {
  filename: string;
  text: string;
};

export function getParsedLastExceptionFiles() {
  const lastExceptionFiles = getLastExceptionFiles();
  const files: LastExceptionFile[] = [];
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
    }
    files.push({
      filename,
      text: lastExceptionString,
    });
  });
  return files;
}

export function deleteLastExceptionFiles() {
  log.info('Clearing last exception files:');
  getLastExceptionFiles().forEach((lastExceptionFile) => {
    log.info(
      `Removing last exception file: ${path.basename(lastExceptionFile)}`
    );
    fs.rmSync(lastExceptionFile);
  });
  log.info('Completed clearing last exception files.');
}
