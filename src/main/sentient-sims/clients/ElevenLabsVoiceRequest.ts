export type ElevenLabsVoiceLabel = {
  name: string;
  value: string;
};

export type ElevenLabsVoiceInfo = {
  voiceId: string;
  // Set when ElevenLabs answered with a different voice than the one asked for
  redirectedTo?: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  previewUrl?: string;
  labels: ElevenLabsVoiceLabel[];
};

export type ElevenLabsVoiceResponse = {
  voice_id?: string;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  preview_url?: string | null;
  labels?: Record<string, string | null> | null;
  sharing?: {
    name?: string | null;
    description?: string | null;
    image_url?: string | null;
    labels?: Record<string, string | null> | null;
  } | null;
};

export type ElevenLabsVoiceRequest = {
  url: string;
  headers: Record<string, string>;
};

export function buildElevenLabsVoiceRequest(params: {
  voiceId: string;
  endpoint: string;
  apiKey: string;
}): ElevenLabsVoiceRequest {
  const { voiceId, endpoint, apiKey } = params;

  return {
    url: `${endpoint}/voices/${encodeURIComponent(voiceId)}`,
    headers: {
      'xi-api-key': apiKey,
    },
  };
}

function firstNonEmpty(...values: (string | null | undefined)[]): string | undefined {
  return values.find((value) => value && value.trim().length > 0)?.trim();
}

function humanizeLabelName(name: string): string {
  const spaced = name.replace(/_/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function toLabels(labels?: Record<string, string | null> | null): ElevenLabsVoiceLabel[] {
  return Object.entries(labels ?? {})
    .filter(([, value]) => value && value.trim().length > 0)
    .map(([name, value]) => ({ name: humanizeLabelName(name), value: (value as string).trim() }));
}

/**
 * Voices copied out of the voice library carry their details on the `sharing` block rather than
 * at the top level, so each field falls back to its shared counterpart before giving up.
 *
 * Retired voice ids answer with a replacement voice under a new id. The requested id stays the
 * identity here because that is what the user typed and what speech requests keep using.
 */
export function toElevenLabsVoiceInfo(voiceId: string, response: ElevenLabsVoiceResponse): ElevenLabsVoiceInfo {
  const sharing = response.sharing ?? undefined;
  const labels = toLabels(response.labels);
  const respondedWith = firstNonEmpty(response.voice_id);

  return {
    voiceId,
    redirectedTo: respondedWith !== voiceId ? respondedWith : undefined,
    name: firstNonEmpty(response.name, sharing?.name) ?? voiceId,
    description: firstNonEmpty(response.description, sharing?.description),
    category: firstNonEmpty(response.category),
    imageUrl: firstNonEmpty(sharing?.image_url),
    previewUrl: firstNonEmpty(response.preview_url),
    labels: labels.length > 0 ? labels : toLabels(sharing?.labels),
  };
}
