import { MemoryEntity } from '../db/entities/MemoryEntity';

// A row made by a line the player (or Twitch chat) said to a sim stores the sim's reply as
// `content` and the line that prompted it as `action`, attributed ("Chat: would you get
// full custody?"). Every recall path used to read `content` alone, so a sim remembered
// "Vesper Hogan: That's not an issue, Ehren's always with me" with no trace of what was
// asked — a private thought carries its whole self in `content`, and these did not.
// Measured on the 09-21 save: 451 Twitch rows, every one a reply with the question
// stranded in `action`.
//
// An attributed action is "<speaker>: <words>" on one line. Interaction rows carry the
// bare verb ("chat"), outcome rows the verb too, so neither matches.
const ATTRIBUTED_LINE = /^[^\n:]{1,60}: \S/;

export function isAttributedLine(text: string | undefined): boolean {
  return Boolean(text && ATTRIBUTED_LINE.test(text));
}

// The text a sim recalls for a memory: the exchange for a reply-to-the-player row, the
// observation or content for everything else. Shared by the tick's <RELEVANT_MEMORIES>,
// the scene's, and the embedding text, so a question is searchable by what was asked.
export function memoryRecallText(memory: MemoryEntity): string {
  const body = memory.observation || memory.content || '';
  const prompt = memory.action;
  if (body && isAttributedLine(prompt) && !body.startsWith(prompt as string)) {
    return `${prompt}\n${body}`;
  }
  return body || memory.action || memory.pre_action || '';
}
