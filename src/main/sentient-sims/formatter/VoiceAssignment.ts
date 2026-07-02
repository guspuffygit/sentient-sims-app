function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Assigns a voice to each distinct speaker from a shared voice pool.
 * With a single speaker (e.g. plain narration), the whole pool is returned so callers
 * preserve the legacy blended-voice behavior (`pool.join('+')`).
 * With multiple speakers, each is deterministically hashed to one voice from the pool
 * so the same character always gets the same voice.
 */
export function assignVoicesToSpeakers(speakers: string[], pool: string[]): Map<string, string[]> {
  const uniqueSpeakers = Array.from(new Set(speakers));
  const assignments = new Map<string, string[]>();

  if (pool.length === 0) {
    uniqueSpeakers.forEach((speaker) => assignments.set(speaker, []));
    return assignments;
  }

  if (uniqueSpeakers.length <= 1) {
    uniqueSpeakers.forEach((speaker) => assignments.set(speaker, [...pool]));
    return assignments;
  }

  uniqueSpeakers.forEach((speaker) => {
    const index = hashString(speaker) % pool.length;
    assignments.set(speaker, [pool[index]]);
  });

  return assignments;
}
