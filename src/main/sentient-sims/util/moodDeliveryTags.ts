// A sim's mood as an ElevenLabs audio tag (v3/v4 read `[tag]` at the start of a line).
// The voice CAST no longer follows the mood (CastableVoice scores traits only, so an
// unpinned sim keeps one voice all day); the mood shapes the delivery instead.
//
// Tag words are voice qualities only. v4 renders a NOUN tag as a sound effect ([dog]
// barks), so nothing here names a thing, and the game's bookkeeping moods (fine,
// asleep, possessed, recharging, hyper) get no tag at all.

const deliveryTagByMood: Record<string, string> = {
  angry: 'angry',
  anxious: 'nervous',
  ashamed: 'embarrassed',
  bored: 'bored, flat',
  confident: 'confident',
  dazed: 'dazed',
  drowsy: 'sleepy',
  embarrassed: 'embarrassed',
  energized: 'energetic',
  excited: 'excited',
  flirty: 'flirtatious',
  focused: 'calm, focused',
  happy: 'cheerful',
  inspired: 'warm, inspired',
  mopey: 'quietly sad',
  playful: 'playful',
  sad: 'quietly sad',
  scared: 'nervous',
  stressed: 'tense',
  tense: 'tense',
  uncomfortable: 'uneasy',
};

/**
 * Normalises a game mood key to the word the table is keyed by. The game's keys are
 * inconsistent: `Mood_Angry`, `mood_Angry_Cat`, `mood_Horse_Angry`, `mood_Hyper_Pets`.
 */
export function normalizeMoodKey(mood: string): string {
  return mood
    .toLowerCase()
    .replace(/^mood_/, '')
    .replace(/^horse_/, '')
    .replace(/_(cat|dog|pets|horse)$/, '');
}

/**
 * The delivery tag for the first tagged mood in the list (a sim reports one mood), or
 * undefined when the mood has no voice quality worth asking for.
 */
export function moodDeliveryTag(moods: string[] | undefined): string | undefined {
  if (!moods) {
    return undefined;
  }
  for (const mood of moods) {
    const tag = deliveryTagByMood[normalizeMoodKey(mood)];
    if (tag) {
      return tag;
    }
  }
  return undefined;
}
