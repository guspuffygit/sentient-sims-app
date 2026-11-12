export type KokoroSpeechRequest = {
  url: string;
  headers: Record<string, string>;
  body: {
    model: string;
    input: string;
    voice: string;
    response_format: string;
    speed: number;
    stream: boolean;
  };
};

export type KokoroSpeechRequestParams = {
  // Base address of a self-hosted Kokoro server, e.g. http://localhost:8880
  endpoint: string;
  text: string;
  // One voice, or several to blend (sent as 'af_heart+af_sky')
  voice: string[];
  model: string;
  responseFormat: string;
  speed: number;
};

/**
 * The address of a self-hosted Kokoro server (Kokoro-FastAPI and friends), whatever the
 * player typed. Tolerates a trailing slash and a trailing /v1 on the configured endpoint.
 */
export function kokoroBaseUrl(endpoint: string): string {
  const trimmed = endpoint.trim().replace(/\/+$/, '');
  return trimmed.replace(/\/v1$/, '');
}

// The OpenAI-compatible speech route
export function kokoroSpeechUrl(endpoint: string): string {
  return `${kokoroBaseUrl(endpoint)}/v1/audio/speech`;
}

// Kokoro-FastAPI lists its voices here; asking is how the app finds out a server is running
export function kokoroVoicesUrl(endpoint: string): string {
  return `${kokoroBaseUrl(endpoint)}/v1/audio/voices`;
}

/**
 * Builds one self-hosted Kokoro text-to-speech call. `stream` is false on purpose: the app
 * plays whole clips from a blob, and a streamed WAV has no final length in its header.
 */
export function buildKokoroSpeechRequest(params: KokoroSpeechRequestParams): KokoroSpeechRequest {
  const { endpoint, text, voice, model, responseFormat, speed } = params;

  return {
    url: kokoroSpeechUrl(endpoint),
    headers: { 'Content-Type': 'application/json' },
    body: {
      model,
      input: text,
      voice: voice.join('+'),
      response_format: responseFormat,
      speed,
      stream: false,
    },
  };
}

/**
 * Splits text into sentences so the first one can start playing while the rest is still
 * being generated. Text with no sentence punctuation comes back as a single piece.
 */
export function splitSentences(text: string): string[] {
  const pieces = text.match(/[^.!?…]+(?:[.!?…]+["'”’)\]]*|$)/g) ?? [];
  return pieces.map((piece) => piece.trim()).filter((piece) => piece.length > 0);
}
