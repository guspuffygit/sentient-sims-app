// The score-to-words bands, in one place. These were inline in describeTarget (the tick
// prompt's <PERCEPTION> targets) and Phase 3.1 needs the same words in <KNOWN_FACTS>: a
// sim told "Nancy is a good friend" by one prompt and "Nancy is an acquaintance" by the
// next is exactly the incoherence the fact store exists to remove. describeTarget calls
// these now, so there is one definition and a test asserts the tick output is unchanged.

// Relationship bits the game names in ways worth repeating verbatim (married, engaged,
// enemies...) read badly raw — keep only the recognizable word
export function prettyBit(bit: string): string | undefined {
  const lowered = bit.toLowerCase();
  // SocialContext_* bits are transient conversation-tone states (every casual
  // acquaintance carries Awkwardness_Casual), not relationship lore — never render them
  if (lowered.includes('socialcontext')) {
    return undefined;
  }
  for (const word of ['married', 'engaged', 'enem', 'unfaithful', 'awkward']) {
    if (lowered.includes(word)) {
      return word === 'enem' ? 'enemies' : word;
    }
  }
  return undefined;
}

export function friendshipWord(friendship: number): string {
  if (friendship >= 50) {
    return 'a good friend';
  }
  if (friendship >= 15) {
    return 'a friend';
  }
  if (friendship <= -15) {
    return 'on bad terms with you';
  }
  return 'an acquaintance';
}

// Undefined below the spark threshold: "not romantic" is not worth a line in a prompt.
export function romanceWord(romance: number): string | undefined {
  if (romance >= 40) {
    return 'romantic';
  }
  if (romance >= 10) {
    return 'a romantic spark';
  }
  return undefined;
}

// The whole relationship in words, shared by describeTarget and the facts block.
export function relationshipWords(target: {
  hasMet?: boolean;
  friendship?: number;
  romance?: number;
  bits?: string[];
}): string[] {
  if (!target.hasMet) {
    return ['a stranger — chat to break the ice'];
  }
  const parts = [friendshipWord(target.friendship ?? 0)];
  const romance = romanceWord(target.romance ?? 0);
  if (romance) {
    parts.push(romance);
  }
  const bits = (target.bits ?? []).map(prettyBit).filter((bit): bit is string => Boolean(bit));
  parts.push(...new Set(bits));
  return parts;
}
