import { URL } from 'url';
import path from 'path';
import log from 'electron-log';

export function resolveHtmlPath(htmlFileName: string): string {
  const resolvedPath = path.join(process.cwd(), '../renderer', htmlFileName);
  log.info(`New path: ${resolvedPath}`);
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }

  return `file://${resolvedPath}`;
}
