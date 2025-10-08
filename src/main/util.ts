import log from 'electron-log';
import path from 'path';
import { URL } from 'url';

export function resolveHtmlPath(htmlFileName: string): string {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }

  const resolvedPath = path.join(process.resourcesPath, 'app.asar/dist/renderer', htmlFileName);
  log.info(`RESOLVED_PATH: ${resolvedPath}`);

  return `file://${resolvedPath}`;
}
