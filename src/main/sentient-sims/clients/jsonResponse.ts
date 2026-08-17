/**
 * Parses a fetch Response body as JSON, producing a readable error instead of a JSON parser
 * stack trace when the body is not JSON — e.g. the HTML "Cannot POST ..." 404 page served by
 * an app instance whose Express server predates the requested route.
 */
export async function parseJsonResponse<T>(response: Response, description: string): Promise<T> {
  const raw = await response.text();
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`${description}: server responded with status ${response.status} and a non-JSON body`);
  }
}
