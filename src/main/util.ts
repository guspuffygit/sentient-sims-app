import log from 'electron-log';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string): string {
  // In dev, electron-vite injects ELECTRON_RENDERER_URL pointing at the Vite dev server.
  if (process.env.ELECTRON_RENDERER_URL) {
    return `${process.env.ELECTRON_RENDERER_URL}/${htmlFileName}`;
  }

  // In production the renderer is built next to the main bundle:
  // release/app/dist/main/main.js -> release/app/dist/renderer/index.html
  const resolvedPath = path.join(__dirname, '../renderer', htmlFileName);
  log.info(`RESOLVED_PATH: ${resolvedPath}`);

  return `file://${resolvedPath}`;
}
