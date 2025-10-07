import log from 'electron-log';
import { URL } from 'url';

export function resolveHtmlPath(getAssetPath: (...paths: string[]) => string, htmlFileName: string): string {
  const resolvedPath = getAssetPath('../app.asar/dist/renderer', htmlFileName);
  log.info(`new-path: ${resolvedPath}`);
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }

  return `file://${resolvedPath}`;
}
