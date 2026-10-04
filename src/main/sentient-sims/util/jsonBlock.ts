// The first {...} object in a model completion, parsed. Shared by the core reply and
// reflection paths and by the autonomy stages (moved out of formatCognitionPrompt so a
// build without autonomy keeps them; release 4.5).

export function firstJsonBlock(raw: string): unknown {
  const match = /\{[\s\S]*\}/.exec(raw);
  if (!match) {
    return undefined;
  }
  try {
    return JSON.parse(match[0]) as unknown;
  } catch {
    return undefined;
  }
}

// A bare value runs from the colon to the next "key": pair or the closing brace — commas
// and apostrophes inside prose are content, not delimiters, so neither may terminate it
const BARE_VALUE = /("(?:[^"\\]|\\.)*"\s*:\s*)([^"\s{[][\s\S]*?)(?=\s*,\s*"(?:[^"\\]|\\.)*"\s*:|\s*\}\s*$)/g;

// Asked for a JSON object with a prose field, a model routinely answers
// {"willing": true, "thought": I need to get ready anyway} — the prose unquoted. Strict
// JSON.parse throws on that and the caller silently loses an answer the model did give
// (live 2026-08-27: 21 of 22 matched ask-actions died here). Quote the bare values and
// try again; real scalars are left alone, and anything still unparseable stays a miss.
function quoteBareValues(block: string): string {
  return block.replace(BARE_VALUE, (whole, key: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed || /^(true|false|null|-?\d+(\.\d+)?([eE][+-]?\d+)?)$/.test(trimmed)) {
      return whole;
    }
    return `${key}${JSON.stringify(trimmed)}`;
  });
}

export function firstJsonBlockLoose(raw: string): unknown {
  const strict = firstJsonBlock(raw);
  if (strict !== undefined) {
    return strict;
  }
  const match = /\{[\s\S]*\}/.exec(raw);
  if (!match) {
    return undefined;
  }
  try {
    return JSON.parse(quoteBareValues(match[0])) as unknown;
  } catch {
    return undefined;
  }
}
