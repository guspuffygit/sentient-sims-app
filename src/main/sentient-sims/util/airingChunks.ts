import { DialogueLine } from '../formatter/PromptFormatter';

// A reply to the player may run to a paragraph (playerReplyMaxTokens). Aired as ONE scene
// line it would be one long TTS fetch, one subtitle the mod cuts at its character cap, and
// one auto-hide timer that runs out before the voice does. So what AIRS is split here into
// sentence-sized chunks that stream like any other paced lines; what is STORED (the memory
// row, the chat window text) keeps the whole reply. Every chunk but the last is flagged
// `continues` so the renderer only breathes between them and the mod keeps the mouth open.

export const AIRING_CHUNK_MAX_CHARS = 160;

// Anything shorter than this is folded into the chunk before it rather than aired alone
// ("Okay." on its own subtitle reads as a stutter)
const TINY_FRAGMENT_CHARS = 24;

// A sentence end: terminal punctuation (with any closing quote or bracket) followed by
// whitespace. Ellipses count; a decimal point or an abbreviation has no space after it.
const SENTENCE_BOUNDARY = /(?<=[.!?…]+["'”’)\]]*)\s+/;

function packSentences(sentences: string[], maxChars: number): string[] {
  const chunks: string[] = [];
  let current = '';
  sentences.forEach((sentence) => {
    if (!current) {
      current = sentence;
      return;
    }
    if (current.length + 1 + sentence.length <= maxChars) {
      current = `${current} ${sentence}`;
    } else {
      chunks.push(current);
      current = sentence;
    }
  });
  if (current) {
    chunks.push(current);
  }
  return chunks;
}

// A single sentence longer than the cap breaks at the last comma or space before it
function breakLongSentence(sentence: string, maxChars: number): string[] {
  const pieces: string[] = [];
  let rest = sentence;
  while (rest.length > maxChars) {
    const window = rest.slice(0, maxChars);
    const comma = window.lastIndexOf(', ');
    const space = window.lastIndexOf(' ');
    let cut = maxChars;
    if (comma >= maxChars / 3) {
      cut = comma + 1;
    } else if (space > 0) {
      cut = space;
    }
    pieces.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) {
    pieces.push(rest);
  }
  return pieces;
}

export function splitTextForAiring(text: string, maxChars = AIRING_CHUNK_MAX_CHARS): string[] {
  const whole = text.replace(/\s+/g, ' ').trim();
  if (!whole) {
    return [];
  }
  if (whole.length <= maxChars) {
    return [whole];
  }
  const sentences = whole
    .split(SENTENCE_BOUNDARY)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .flatMap((sentence) => (sentence.length > maxChars ? breakLongSentence(sentence, maxChars) : [sentence]));
  const chunks = packSentences(sentences, maxChars);
  // A tiny tail joins the chunk before it, even a little over the cap
  const last = chunks[chunks.length - 1];
  if (chunks.length > 1 && last.length < TINY_FRAGMENT_CHARS) {
    chunks.pop();
    chunks[chunks.length - 1] = `${chunks[chunks.length - 1]} ${last}`;
  }
  return chunks;
}

export function splitLineForAiring(line: DialogueLine, maxChars = AIRING_CHUNK_MAX_CHARS): DialogueLine[] {
  // A line whose subtitle was already sent (a Twitch question) is never split: the
  // subtitle and the voice must stay one thing
  if (line.skipSceneLine) {
    return [line];
  }
  const chunks = splitTextForAiring(line.text, maxChars);
  if (chunks.length <= 1) {
    return [line];
  }
  return chunks.map((text, index) => {
    const chunk: DialogueLine = { ...line, text };
    if (index < chunks.length - 1) {
      chunk.continues = true;
    } else {
      delete chunk.continues;
    }
    return chunk;
  });
}

export function splitLinesForAiring(lines: DialogueLine[], maxChars = AIRING_CHUNK_MAX_CHARS): DialogueLine[] {
  return lines.flatMap((line) => splitLineForAiring(line, maxChars));
}
