// Refuse-to-persist gate for memory content. Every pattern here was observed verbatim in
// the 2026-08 playtest DB: 38 LLM refusals stored as memories, 57 'article' artifact
// prefixes (two rated importance 9, so retrieval preferred them), and prompt scaffolding
// leaked into content. Shared with scripts/repairMemories.ts so the live gate and the
// offline repair judge content identically.

export const REFUSAL_PATTERNS: RegExp[] = [
  /^i can'?t (help|assist|continue|do that|write|describe)/i,
  /^i cannot (help|assist|continue|comply|describe|write|do that)/i,
  /^i'?m sorry,? but/i,
  /^i'?m not (going to|able to|comfortable) (describe|describing|write|writing|continue|continuing|help)/i,
  /^i (will not|won'?t|refuse to) (describe|write|continue|be)/i,
  /^i do not feel comfortable/i,
  /^as an ai\b/i,
  // Reviewer/formatter meta-output leaked into memories (playtest ids 3290, 4609, 4612)
  /^i'?m not seeing any dialogue/i,
  /^i'?ll review the scene/i,
];

// Models emit curly apostrophes ("I can’t help") that dodge ASCII patterns; a curly
// apostrophe that went through a wrong-codepage hop arrives as U+FFFD ("I can�t help",
// playtest DB id 3275) and must normalize the same way
export function normalizeApostrophes(text: string): string {
  return text.replace(/[‘’\uFFFD]/g, "'");
}

export const SCAFFOLD_SENTINELS: string[] = [
  '[AI:',
  '<PERCEPTION>',
  '<RELEVANT_MEMORIES>',
  '<PAST_REFLECTIONS>',
  'Each speaker gets their OWN separate line',
  "complete another speaker's sentence",
  // Scene-director instruction leaked verbatim into a stored line (playtest 08-04..08-14)
  'PLEASE SKIP describing',
];

// Bare "article" token the formatter leaks ahead of real prose — sometimes fused
// straight into it ("articleSweat beaded..."). (?![a-z]) spares real words like
// "articles"/"articulate"; strip rather than reject: the rest is a real memory.
// No /i flag: it would make the (?![a-z]) guard reject fused-uppercase continuations
// ("articleSweat"), which are exactly the artifact shape
const ARTICLE_ARTIFACT = /^\s*[Aa]rticle(?![a-z])[\s:,.-]*/;

export type MemoryValidation = { ok: true } | { ok: false; reason: string };

export function stripArtifacts(text: string): string {
  return text.replace(ARTICLE_ARTIFACT, '');
}

export function validateMemoryContent(text: string | null | undefined): MemoryValidation {
  if (text === null || text === undefined || text.trim() === '') {
    return { ok: false, reason: 'empty content' };
  }
  const trimmed = normalizeApostrophes(text.trim());
  const refusal = REFUSAL_PATTERNS.find((pattern) => pattern.test(trimmed));
  if (refusal) {
    return { ok: false, reason: `LLM refusal: "${trimmed.slice(0, 80)}"` };
  }
  const sentinel = SCAFFOLD_SENTINELS.find((needle) => trimmed.includes(needle));
  if (sentinel) {
    return { ok: false, reason: `prompt scaffolding leaked ("${sentinel}")` };
  }
  return { ok: true };
}

// N-6: near-duplicate detection for the echo chamber. Character trigrams over the
// lowercased, punctuation-stripped text; Jaccard >= NEAR_DUP_JACCARD means the same
// thought re-stored. Fixed twice at retrieval and back twice from new sources — so it is
// caught at STORE time now, for thought/monologue/reflection rows only.
export const NEAR_DUP_JACCARD = 0.85;
export const NEAR_DUP_EVENT_TYPES = new Set(['thought', 'monologue', 'reflection']);

export function trigrams(text: string): Set<string> {
  const normalized = normalizeApostrophes(text)
    .toLowerCase()
    .replace(/^[^:]{1,40}\((?:thinking|diary|thought|to self)\):\s*/i, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const grams = new Set<string>();
  for (let index = 0; index + 3 <= normalized.length; index += 1) {
    grams.add(normalized.slice(index, index + 3));
  }
  return grams;
}

export function trigramJaccard(a: string, b: string): number {
  const left = trigrams(a);
  const right = trigrams(b);
  if (left.size === 0 || right.size === 0) {
    return 0;
  }
  let shared = 0;
  left.forEach((gram) => {
    if (right.has(gram)) {
      shared += 1;
    }
  });
  return shared / (left.size + right.size - shared);
}
