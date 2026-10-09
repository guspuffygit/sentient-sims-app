// A diary entry must be prose. Core since release 4.5: every sleep reflection runs these
// (AIService.runSceneReflection), and the tier-0 bench (dev) grades saved diaries with the
// same check. The planner's own JSON parsing stays with the autonomy planner; the salvage
// below is a self-contained copy of its prose extractor so core never imports it.

export type Tier0Violation = {
  assertion: 'diary_is_prose' | 'outcome_is_truthful';
  detail: string;
  memoryId?: string;
  outcomeId?: number;
};

// Machinery a diary must never contain. The planner returns a five-field JSON object and a
// parse failure used to store the whole raw completion as the diary — which then rode into
// 216 later prompt blocks as <PAST_REFLECTIONS> (live 2026-08-15, Summer Holiday).
const PLANNER_KEY = /"(diary|goals|goal_review|persona|loadout)"\s*:/;
const CODE_FENCE = /```/;
const PROMPT_TAG = /<\/?[A-Z_]{3,}>/;

/**
 * A diary entry must be prose. repairDiary is the repair, never the check: running the
 * repair as the test would pass anything, because it always returns something.
 */
export function assertDiaryIsProse(text: string | undefined, memoryId?: string): Tier0Violation | null {
  const violation = (detail: string): Tier0Violation => ({ assertion: 'diary_is_prose', detail, memoryId });
  const trimmed = (text ?? '').trim();
  if (trimmed.length <= 1) {
    return violation('diary is empty');
  }
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return violation('diary starts with a JSON object or array');
  }
  if (PLANNER_KEY.test(trimmed)) {
    return violation('diary contains planner JSON keys');
  }
  if (CODE_FENCE.test(trimmed)) {
    return violation('diary contains a code fence');
  }
  if (PROMPT_TAG.test(trimmed)) {
    return violation('diary contains prompt scaffolding tags');
  }
  return null;
}

// Same parse as the planner's parsePlannerJson (DailyPlanService), kept byte-for-byte in
// behaviour so repairDiary returns exactly what extractDiaryProse did
function parseDiaryObject(raw: string): Record<string, unknown> | undefined {
  const match = /\{[\s\S]*\}/.exec(raw);
  if (!match) {
    return undefined;
  }
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    // Observed live 2026-08-15: the model wrote its goals array as bare pairs —
    // "goals": ["id": "want_MakeFriend", "id": "want_GoForJog"] — which is invalid JSON
    // and threw away an otherwise complete plan. Repair that one shape and retry once.
    const repaired = match[0].replace(
      /("(?:goals|loadout)"\s*:\s*\[)([^\]]*)\]/g,
      (whole, head: string, body: string) => {
        if (!/"\s*(?:id|key|action|action_key)"\s*:/.test(body)) {
          return whole;
        }
        const found = [...body.matchAll(/"(?:id|key|action|action_key)"\s*:\s*"([^"]*)"/g)];
        const ids = found.map((pair) => JSON.stringify(pair[1]));
        return ids.length > 0 ? `${head}${ids.join(', ')}]` : whole;
      },
    );
    if (repaired !== match[0]) {
      try {
        return JSON.parse(repaired) as Record<string, unknown>;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
}

// The prose a diary should have carried, for the caller that has to store something anyway.
// A diary entry must never carry raw JSON into permanent memory. Found live 2026-08-15:
// one sleep-plan completion prefixed prose before its JSON object AND broke the goals
// array, so parsing failed and the WHOLE raw completion — prose plus schema — was stored
// as Summer Holiday's diary, then recalled into 216 later prompt blocks. Whatever the
// model returns, only prose is allowed through.
export function repairDiary(raw: string): string {
  const text = raw.trim();
  if (!text) {
    return '';
  }
  const parsed = parseDiaryObject(text);
  if (parsed && typeof parsed.diary === 'string' && parsed.diary.trim().length > 1) {
    return parsed.diary.trim();
  }
  // Salvage the diary field out of a JSON object too broken to parse
  const field = /"diary"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(text);
  if (field) {
    try {
      const unescaped = JSON.parse(`"${field[1]}"`) as string;
      if (unescaped.trim().length > 1) {
        return unescaped.trim();
      }
    } catch {
      // fall through to the prose paths
    }
  }
  // Prose the model wrote before opening its JSON object
  const brace = text.indexOf('{');
  if (brace > 0) {
    const prose = text.slice(0, brace).trim();
    if (prose.length > 1) {
      return prose;
    }
  }
  if (brace === -1) {
    return text;
  }
  // Only JSON, and no usable diary in it — strip the object and keep whatever is left
  return text.replace(/\{[\s\S]*\}/, '').trim();
}
