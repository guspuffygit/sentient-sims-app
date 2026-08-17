// Guard against malformed interaction mappings poisoning generations. A bad online
// mapping row once rendered to just "Marisol Vega are " — that dangling fragment became
// the whole user turn, the model improvised "your message got cut off", and the reply was
// stored as a memory the next scene then treated as canon. Degenerate pre_actions are
// treated as unmapped instead of being sent to the model.

// Endings that mean the sentence never got its object/complement
const DANGLING_ENDINGS = new Set([
  'a',
  'am',
  'an',
  'and',
  'are',
  'at',
  'by',
  'for',
  'in',
  'is',
  'of',
  'on',
  'or',
  'the',
  'to',
  'was',
  'were',
  'with',
]);

const MIN_WORDS = 3;

export function isDegeneratePreAction(rendered: string | undefined): boolean {
  if (!rendered) {
    return true;
  }
  const trimmed = rendered.trim();
  if (!trimmed) {
    return true;
  }
  // Unsubstituted template tokens like {location} or {actor.0}
  if (/\{[^}]*\}/.test(trimmed)) {
    return true;
  }
  const words = trimmed.split(/\s+/);
  if (words.length < MIN_WORDS) {
    return true;
  }
  const lastWord = words[words.length - 1].toLowerCase().replace(/[^a-z']/g, '');
  return DANGLING_ENDINGS.has(lastWord);
}
