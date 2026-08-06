// Tuning names carry the pie menu words plus structural noise, e.g.
// mixer_social_PassionateKiss_targeted_romance_emotionSpecific -> "Passionate Kiss".
// The real localized pie menu text lives in the game's string tables, which are not
// readable at runtime, so this derived name is what the browser displays and searches.
const NOISE_TOKENS = new Set([
  'mixer',
  'mixers',
  'socialmixer',
  'social',
  'socials',
  'si',
  'sim',
  'targeted',
  'group',
  'stc',
  'alwayson',
  'emotionspecific',
  'emotionspeficic', // typo that exists in real tuning names
  'skills',
  'skill',
  'traits',
  'trait',
  'friendly',
  'mean',
  'mischief',
  'funny',
  'romance',
]);

function splitCamelCase(token: string): string {
  return token
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2');
}

function toWords(tokens: string[]): string {
  return tokens
    .map(splitCamelCase)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function interactionDisplayName(interactionName: string): string {
  const tokens = interactionName.split(/[_:]+/).filter(Boolean);
  const meaningful = tokens.filter((token) => !NOISE_TOKENS.has(token.toLowerCase()));

  // If stripping noise removed everything, fall back to the full name so the
  // display name is never blank
  const displayName = toWords(meaningful.length > 0 ? meaningful : tokens);
  return displayName || interactionName;
}
