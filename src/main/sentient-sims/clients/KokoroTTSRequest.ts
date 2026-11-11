export type KokoroSpeechRequest = {
  url: string;
  headers: Record<string, string>;
  body: {
    model: string;
    input: string;
    voice: string;
    response_format: string;
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
};

/**
 * The OpenAI-compatible speech route of a self-hosted Kokoro server (Kokoro-FastAPI and
 * friends). Tolerates a trailing slash and a trailing /v1 on the configured endpoint.
 */
export function kokoroSpeechUrl(endpoint: string): string {
  const trimmed = endpoint.trim().replace(/\/+$/, '');
  const base = trimmed.replace(/\/v1$/, '');
  return `${base}/v1/audio/speech`;
}

/**
 * Builds one self-hosted Kokoro text-to-speech call. `stream` is false on purpose: the app
 * plays whole clips from a blob, and a streamed WAV has no final length in its header.
 */
export function buildKokoroSpeechRequest(params: KokoroSpeechRequestParams): KokoroSpeechRequest {
  const { endpoint, text, voice, model, responseFormat } = params;

  return {
    url: kokoroSpeechUrl(endpoint),
    headers: { 'Content-Type': 'application/json' },
    body: {
      model,
      input: text,
      voice: voice.join('+'),
      response_format: responseFormat,
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
