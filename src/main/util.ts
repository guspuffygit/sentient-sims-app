import { URL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';
import log from 'electron-log';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function resolveHtmlPath(htmlFileName: string): string {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }

  const resolvedPath = path.resolve(__dirname, '../renderer/', htmlFileName);
  const fileUrl = `file://${resolvedPath}`;

  log.info(`Resolved HTML Path: ${fileUrl}`);
  return fileUrl;
}
