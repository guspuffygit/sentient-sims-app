// How each life stage sounds in a sentence, in ONE place. The game's word for it ("ELDER",
// "YOUNGADULT") is not one a person says out loud: rendered raw into <KNOWN_FACTS>, "you are
// adult" was read by a Sim as "early twenties" (live 2026-09-03), and graded raw it failed
// every correct answer. The renderer and the battery both read this table, so the prompt and
// the grader cannot disagree about what an age means.
//
// The synonym set is safe in a way one for likes would not be: there are exactly seven life
// stages and they are ordered, so the words for each are a closed list rather than a guess.
// The decades are here because a Sim answers "how old are you" with a number, and "pushing
// past sixty" is a correct answer for an elder that no adjective catches.

export type LifeStageWords = {
  // What the facts block says: "you are <phrase>"
  phrase: string;
  // Words any of which count as the Sim naming this stage
  accept: string[];
};

export const LIFE_STAGE_WORDS: Record<string, LifeStageWords> = {
  BABY: { phrase: 'a baby', accept: ['baby', 'infant'] },
  INFANT: { phrase: 'an infant', accept: ['infant', 'baby'] },
  TODDLER: { phrase: 'a toddler', accept: ['toddler', 'little', 'two', 'three'] },
  CHILD: { phrase: 'a child (school age)', accept: ['child', 'kid', 'little', 'school'] },
  TEEN: {
    phrase: 'a teenager (high school age)',
    accept: ['teen', 'teenager', 'high school', 'seventeen', 'sixteen'],
  },
  YOUNGADULT: {
    phrase: 'a young adult (your twenties)',
    accept: ['young adult', 'twenties', 'young', 'just started out'],
  },
  ADULT: {
    phrase: 'an adult (your thirties or forties)',
    accept: ['adult', 'middle', 'thirties', 'forties', 'grown'],
  },
  ELDER: {
    phrase: 'an elder (retirement age)',
    accept: [
      'elder',
      'older',
      'old',
      'senior',
      'retired',
      'getting on',
      'my age',
      'grandpa',
      'grandma',
      'sixty',
      'sixties',
      'seventy',
      'seventies',
      'eighty',
      'eighties',
      // Fixed idioms for old age, not open-ended synonyms: "Approaching the sunset years"
      // is a correct answer that the grader failed (live 2026-09-04).
      'sunset years',
      'golden years',
      'twilight years',
      'later years',
    ],
  },
};

function lookup(stage?: string): LifeStageWords | undefined {
  return stage ? LIFE_STAGE_WORDS[stage.toUpperCase()] : undefined;
}

// "an elder (retirement age)"; an unknown stage falls back to its own lowercased name so a
// future pack's new stage is still rendered rather than dropped.
export function lifeStagePhrase(stage?: string): string | undefined {
  if (!stage) {
    return undefined;
  }
  return lookup(stage)?.phrase ?? stage.toLowerCase();
}

export function lifeStageAcceptWords(stage?: string): string[] {
  if (!stage) {
    return [];
  }
  return lookup(stage)?.accept ?? [stage.toLowerCase()];
}
