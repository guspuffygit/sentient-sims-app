type ElevenLabsErrorResponse = {
  detail?: { message?: string } | string | null;
};

/**
 * ElevenLabs reports failures as a JSON envelope. Surfacing the whole body puts a wall of JSON in
 * front of the user, so pull out the human-readable message and keep the status as a last resort.
 */
export function elevenLabsErrorMessage(status: number, body: string): string {
  const fallback = status === 401 ? 'Invalid ElevenLabs key' : `ElevenLabs returned ${status}`;

  try {
    const { detail } = JSON.parse(body) as ElevenLabsErrorResponse;
    if (typeof detail === 'string') {
      return detail.trim() || fallback;
    }

    return detail?.message?.trim() || fallback;
  } catch {
    return body.trim() || fallback;
  }
}
