import electron, { BrowserWindow } from 'electron';

// In tests (ELECTRON_RUN_AS_NODE) BrowserWindow is not initialized; return [] so callers no-op.
export function getAllBrowserWindows(): BrowserWindow[] {
  const BrowserWindowCtor = (electron as Partial<typeof electron>).BrowserWindow;
  if (!BrowserWindowCtor) return [];
  return BrowserWindowCtor.getAllWindows();
}
