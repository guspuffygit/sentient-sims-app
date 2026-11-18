import type { DialogueLine } from '../formatter/PromptFormatter';

// ElevenLabs audio tags like `[laughs]` or `[sighs]` are for the voice only. A line keeps
// one rule: `text` is always the plain words (subtitle, bubble, memory row, chat window,
// prompt history, Kokoro), and `ttsText` is what the voice reads, tags included. A model
// that cannot read tags (Eleven v2 / flash / multilingual) gets them stripped at the
// request (elevenLabsLineText).

// A short bracketed run on one line. An unclosed `[` is never a tag.
export const VOICE_TAG_RE = /\[[^[\]\n]{1,40}\]/g;

// One or more tags in a row with the horizontal whitespace around them, so `a [x] [y] b`
// is one removal
const TAG_RUN_RE = /[^\S\n]*(?:\[[^[\]\n]{1,40}\][^\S\n]*)+/g;

// A tag between two words still separates them; before closing punctuation it leaves nothing
const CLOSING_PUNCTUATION = /[.,!?;:…)"'”’\]]/u;

export function hasVoiceTags(text: string): boolean {
  return new RegExp(VOICE_TAG_RE.source).test(text);
}

/**
 * The text with every voice tag removed: a tag between two words becomes one space, a tag
 * at the start or end of a line, or before closing punctuation, leaves nothing. Whitespace
 * away from the tags is untouched.
 */
export function stripVoiceTags(text: string): string {
  if (!hasVoiceTags(text)) {
    return text;
  }
  return text
    .replace(TAG_RUN_RE, (run: string, offset: number, whole: string) => {
      const end = offset + run.length;
      if (offset === 0 || end >= whole.length || whole[offset - 1] === '\n' || whole[end] === '\n') {
        return '';
      }
      const after = whole[end];
      return CLOSING_PUNCTUATION.test(after) ? '' : ' ';
    })
    .trim();
}

/**
 * The line with its tags moved off the subtitle: `text` plain, `ttsText` the tagged words.
 * A line whose `text` has no tags comes back as the same object; a `ttsText` already set
 * is kept.
 */
export function splitVoiceTags(line: DialogueLine): DialogueLine {
  if (!hasVoiceTags(line.text)) {
    return line;
  }
  return { ...line, text: stripVoiceTags(line.text), ttsText: line.ttsText ?? line.text };
}
