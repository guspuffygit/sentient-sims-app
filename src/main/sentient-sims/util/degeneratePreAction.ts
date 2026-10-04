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

export function isDegeneratePreAction(rendered: string | undefined, template?: string): boolean {
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
  // Empty-slot shapes: an actor name that rendered as '' leaves the sentence starting
  // on its verb (" is telling Milo a joke"), a double space mid-sentence ("Milo  is"),
  // a possessive with no owner ("'s hand"), or a dangling object before punctuation
  // ("is talking to ."). Ten such preambles reached the model in the 08-04..08-14
  // playtest log and each became a scene about nobody.
  if (/^(is|are|am|was|were|and|with|to|'s)\b/i.test(trimmed)) {
    return true;
  }
  // A double space is only evidence of a blank name if the template did not already
  // carry it — community mappings author '],  traits' and rendered fine (2026-08-18).
  if (/\S  +\S/.test(trimmed) && !(template && /\S  +\S/.test(template))) {
    return true;
  }
  if (/\s's\b/.test(trimmed)) {
    return true;
  }
  if (/\b(to|with|at|and|for|of|on|by)\s*[.,;!?]/i.test(trimmed)) {
    return true;
  }
  const words = trimmed.split(/\s+/);
  if (words.length < MIN_WORDS) {
    return true;
  }
  const lastWord = words[words.length - 1].toLowerCase().replace(/[^a-z']/g, '');
  return DANGLING_ENDINGS.has(lastWord);
}
