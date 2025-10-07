import { URL } from 'url';
import path from 'path';
import log from 'electron-log';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  log.info(`HTML PATH: ${`file://${path.resolve(process.cwd(), '../renderer/', htmlFileName)}`}`);
  return `file://${path.resolve(process.cwd(), '../renderer/', htmlFileName)}`;
}
