import log from 'electron-log';

export async function fetchWithTimeout(url: string, options: any) {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);

    return response;
  } catch (error: any) {
    if (error.cause) {
      log.error(error.cause);
    }

    throw error;
  }
}
