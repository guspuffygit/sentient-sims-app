// V-3: who the player is when they speak into the game. The label is the speaker string
// on the player line and MUST stay byte-identical between the app (playerLine.speaker) and
// the mod (PLAYER_SPEAKER, pushed via update_setting) or the mod's 30s subtitle dedupe
// breaks and lines double.
export const PLAYER_VOICE_PERSONAS = ['voice', 'guardian_angel', 'conscience', 'imaginary_friend', 'player'] as const;
export type PlayerVoicePersona = (typeof PLAYER_VOICE_PERSONAS)[number];

export const PLAYER_VOICE_PERSONA_LABELS: Record<PlayerVoicePersona, string> = {
  voice: 'The Voice',
  guardian_angel: 'Guardian Angel',
  conscience: 'Conscience',
  imaginary_friend: 'Imaginary Friend',
  player: 'Player',
};

// The one semantic line the sim is told about what is speaking to them
export const PLAYER_VOICE_PERSONA_FLAVOR: Record<PlayerVoicePersona, string> = {
  voice: 'a disembodied voice only they can hear — calm, familiar, impossible to place',
  guardian_angel: 'their guardian angel: warm, protective, on their side no matter what',
  conscience: 'their own conscience: the quiet inner voice that knows what they should do',
  imaginary_friend: 'their imaginary friend from childhood, back for a chat — playful and loyal',
  player: 'a person who is not in the room but somehow knows them',
};

// The player can speak under their own name instead of the persona's label. The mod's
// speaker-tag regex takes at most 40 non-paren chars and a failed match demotes the whole
// line to narration, so the typed name is stripped of anything that could break the tag
// (a colon would also split the "speaker: line" prefix everything downstream parses).
const PLAYER_VOICE_NAME_MAX = 40;

export function sanitizePlayerVoiceName(raw: string | undefined | null): string {
  return String(raw ?? '')
    .replace(/[:()[\]{}<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, PLAYER_VOICE_NAME_MAX)
    .trim();
}

// A custom name wins over the persona's label; an empty one falls back to it. Single-word
// names render best in the mod's memories window, which titles each section with the FIRST
// word of the speaker prefix ("The Voice: ..." makes a section called "The").
export function playerSpeakerLabel(persona: PlayerVoicePersona, customName?: string): string {
  const custom = sanitizePlayerVoiceName(customName);
  if (custom) {
    return custom;
  }
  return PLAYER_VOICE_PERSONA_LABELS[persona] ?? PLAYER_VOICE_PERSONA_LABELS.voice;
}

// What the sim is told is speaking to them: the persona's nature, plus the player's own
// bio when they wrote one. The bio applies to every persona — the player is still a
// guardian angel or a conscience, just one the sim knows something about.
export function playerPersonaFlavor(persona: PlayerVoicePersona, bio?: string): string {
  const flavor = PLAYER_VOICE_PERSONA_FLAVOR[persona] ?? PLAYER_VOICE_PERSONA_FLAVOR.voice;
  const trimmed = (bio ?? '').trim();
  return trimmed ? `${flavor} — ${trimmed}` : flavor;
}
