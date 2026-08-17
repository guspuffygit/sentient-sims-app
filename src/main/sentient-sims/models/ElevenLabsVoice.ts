// A voice from the user's ElevenLabs "My Voices" collection. Only the fields the
// app needs to show a picker are kept; voiceId is what actually gets persisted
// against a sim so a voice keeps working after it leaves My Voices.
export type ElevenLabsVoice = {
  voiceId: string;
  name: string;
  category?: string;
};

// Persisted so the picker has options before (or without) a successful refresh
export type ElevenLabsVoicesCache = {
  voices: ElevenLabsVoice[];
  updatedAt?: string;
};

export const emptyElevenLabsVoicesCache: ElevenLabsVoicesCache = {
  voices: [],
};

type ElevenLabsVoicesApiResponse = {
  voices?: {
    voice_id?: string;
    name?: string;
    category?: string;
  }[];
};

export function toElevenLabsVoices(response: unknown): ElevenLabsVoice[] {
  const { voices } = (response ?? {}) as ElevenLabsVoicesApiResponse;
  if (!Array.isArray(voices)) {
    return [];
  }

  return voices
    .filter((voice) => typeof voice.voice_id === 'string' && voice.voice_id.length > 0)
    .map((voice) => ({
      voiceId: voice.voice_id as string,
      name: voice.name ?? (voice.voice_id as string),
      category: voice.category,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function sanitizeElevenLabsVoicesCache(value: unknown): ElevenLabsVoicesCache {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return emptyElevenLabsVoicesCache;
  }

  const { voices, updatedAt } = value as { voices?: unknown; updatedAt?: unknown };
  if (!Array.isArray(voices)) {
    return emptyElevenLabsVoicesCache;
  }

  return {
    voices: voices
      .filter((voice): voice is ElevenLabsVoice => {
        const candidate = voice as ElevenLabsVoice | null;
        return typeof candidate?.voiceId === 'string' && typeof candidate.name === 'string';
      })
      .map((voice) => ({ voiceId: voice.voiceId, name: voice.name, category: voice.category })),
    updatedAt: typeof updatedAt === 'string' ? updatedAt : undefined,
  };
}
