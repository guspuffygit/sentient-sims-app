import log from 'electron-log';
import path from 'path';
import * as fs from 'fs';
import { Parser } from 'xml2js';
import { ApiContext } from './ApiContext';

type LastExceptionXml = {
  root: {
    report: {
      desyncdata: string[];
    }[];
  };
};

export type LastExceptionFile = {
  filename: string;
  text: string;
  created: Date;
};

export class LastExceptionService {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  getLastExceptionFiles() {
    const files = ['lastException', 'lastCleanException', 'lastUIException'];
    return this.ctx.directory.findFilesWithKeywords(this.ctx.directory.getSims4Folder(), files);
  }

  getParsedLastExceptionFiles() {
    const lastExceptionFiles = this.getLastExceptionFiles();
    const files: LastExceptionFile[] = [];
    lastExceptionFiles.forEach((lastExceptionFile) => {
      const filename = path.basename(lastExceptionFile);
      const lastExceptionData = fs.readFileSync(lastExceptionFile, 'utf-8');
      let lastExceptionString = lastExceptionData;
      try {
        const parser = new Parser();
        parser.parseString(lastExceptionData, (err: Error | null, result: LastExceptionXml) => {
          const stackTrace = result.root.report[0].desyncdata[0];
          lastExceptionString = stackTrace.replace(/\r\n/g, '\n');
        });
      } catch (parseError) {
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

  deleteLastExceptionFiles() {
    log.info('Clearing last exception files:');

    const files = this.getLastExceptionFiles();
    files.forEach((lastExceptionFile) => {
      log.info(`Removing last exception file: ${path.basename(lastExceptionFile)}`);
      fs.rmSync(lastExceptionFile);
    });

    log.info('Completed clearing last exception files.');
  }
}
