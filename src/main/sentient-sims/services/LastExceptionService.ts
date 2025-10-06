import log from 'electron-log';
import path from 'path';
import * as fs from 'fs';
import xml2js from 'xml2js';
import { DirectoryService } from './DirectoryService';

export type LastExceptionFile = {
  filename: string;
  text: string;
  created: Date;
};

export class LastExceptionService {
  private directoryService: DirectoryService;

  constructor(directoryService: DirectoryService) {
    this.directoryService = directoryService;
  }

  getLastExceptionFiles() {
    const files = ['lastException', 'lastCleanException', 'lastUIException'];
    return this.directoryService.findFilesWithKeywords(this.directoryService.getSims4Folder(), files);
  }

  getParsedLastExceptionFiles() {
    const lastExceptionFiles = this.getLastExceptionFiles();
    const files: LastExceptionFile[] = [];
    lastExceptionFiles.forEach((lastExceptionFile) => {
      const filename = path.basename(lastExceptionFile);
      const lastExceptionData = fs.readFileSync(lastExceptionFile, 'utf-8');
      let lastExceptionString = lastExceptionData;
      try {
        const parser = new xml2js.Parser();
        parser.parseString(lastExceptionData, (err: any, result: any) => {
          const stackTrace = result.root.report[0].desyncdata[0];
          lastExceptionString = `${stackTrace}`.replace(/\r\n/g, '\n');
        });
      } catch (parseError: any) {
        const message = `Error parsing lastException file: ${filename}`;
        log.error(message, parseError);
      }

      const stats = fs.statSync(lastExceptionFile);

      files.push({
        filename,
        text: lastExceptionString,
        created: stats.ctime,
      });
    });

    return files;
  }

  async deleteLastExceptionFiles() {
    log.info('Clearing last exception files:');

    const files = this.getLastExceptionFiles();
    files.forEach((lastExceptionFile) => {
      log.info(`Removing last exception file: ${path.basename(lastExceptionFile)}`);
      fs.rmSync(lastExceptionFile);
    });

    log.info('Completed clearing last exception files.');
  }
}
