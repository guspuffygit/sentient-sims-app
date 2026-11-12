import log from 'electron-log';

export type SpeechFailure =
  | { kind: 'status'; status: number; message: string }
  | { kind: 'not-audio' }
  | { kind: 'timeout' }
  | { kind: 'unreachable'; reason: string };

export type FetchedSpeech = { url: string } | { failure: SpeechFailure };

export type SpeechAudioRequest = {
  url: string;
  headers: Record<string, string>;
  body: object;
  // Bounds each attempt, connection and download together
  timeoutMs: number;
  onResponse?: (response: Response) => void;
};

function messageIn(value: unknown): string | undefined {
  if (typeof value === 'string') return value || undefined;
  if (Array.isArray(value)) return messageIn(value[0]);
  if (!value || typeof value !== 'object') return undefined;

  const { message, msg, error, detail } = value as Record<string, unknown>;
  return [message, msg, error, detail].map(messageIn).find(Boolean);
}

// Error bodies are {message} or {error} from the Sentient Sims AI service and {detail}
// from Kokoro-FastAPI. The player sees the words and never the JSON.
export function errorText(body: string): string {
  try {
    return messageIn(JSON.parse(body)) ?? body;
  } catch {
    return body;
  }
}

/**
 * Posts one text-to-speech request and returns an object URL for the clip. Every way the
 * request can fail comes back as a SpeechFailure, so the caller chooses the wording.
 */
export async function fetchSpeechAudio(request: SpeechAudioRequest): Promise<FetchedSpeech> {
  const { url, headers, body, timeoutMs, onResponse } = request;

  const attempt = async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    onResponse?.(response);
    return response;
  };

  try {
    let response = await attempt();

    // A 502 or 503 from a restarting worker is usually momentary, and one retry saves the
    // line from dropping to a silent subtitle
    if (response.status >= 500) {
      log.debug(`TTS returned ${response.status}, retrying once`);
      void response.body?.cancel();
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      response = await attempt();
    }

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '');
      log.error(`TTS returned ${response.status}: ${bodyText.slice(0, 500)}`);
      return { failure: { kind: 'status', status: response.status, message: errorText(bodyText) } };
    }

    // A half-dead gateway can answer 200 with an HTML or JSON error page, which then
    // blows up audio decoding
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('text/html') || contentType.includes('application/json')) {
      const bodyText = await response.text();
      log.error(`TTS returned non-audio response (${contentType}): ${bodyText.slice(0, 200)}`);
      return { failure: { kind: 'not-audio' } };
    }

    return { url: URL.createObjectURL(await response.blob()) };
  } catch (err) {
    if ((err as { name?: string } | undefined)?.name === 'TimeoutError') {
      log.error(`TTS request to ${url} timed out after ${timeoutMs}ms`);
      return { failure: { kind: 'timeout' } };
    }

    const reason = err instanceof Error ? err.message : String(err);
    log.error(`TTS request to ${url} failed: ${reason}`);
    return { failure: { kind: 'unreachable', reason } };
  }
}
