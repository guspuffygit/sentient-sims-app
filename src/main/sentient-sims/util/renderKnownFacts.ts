// Turns fact rows into the <KNOWN_FACTS> block. Pure: no database, no context, so the
// wording is unit-testable and the same renderer serves the tick, the scene, the ask
// decision and the reflection.
//
// The block is deliberately small. A sim who has met forty people cannot carry forty
// relationship lines into every tick, and the failure mode of a bloated facts block is
// the one F2 was written for: the user message gets truncated away. Self facts first
// (they are short and always relevant), then the people actually present or mentioned,
// then the people who matter to this sim wherever they are, then hearsay.
//
// Three things this block says that it did not before 2026-09-03, each of them a live
// battery failure (FIX-PLAN-2026-09-03.md §A):
// - ABSENCE. An empty genealogy is an answer, not a gap: a sim whose dossier records no
//   parents has no parents, and saying nothing left "do you have siblings" to be answered
//   from vibes. Absence is only stated when a dossier was actually ingested, so a sim the
//   store knows nothing about still says nothing.
// - NAMES. A sim alone in a scene had no name anywhere in its prompt, so "who do you live
//   with" was answered with the household's name ("BFF") because that was the only name
//   it had. The household line names the housemates and "People in your life" carries
//   family and closest friends whoever is present.
// - ENGLISH. "you are elder" and "you work as Culinary (level 4)" are the game's words,
//   not a person's: one sim read "adult" as "early twenties" and another turned a Culinary
//   career into mixing drinks at a bar.

import { FactPredicate } from '../pipeline/facts/predicates';
import { lifeStagePhrase } from './lifeStageWords';
import { relationshipWords } from './relationshipWords';

export type RenderableFact = {
  predicate: string;
  objectText?: string;
  objectSimId?: string;
  source: string;
  confidence: number;
  validFromDay?: number;
};

export type RenderablePerson = {
  simId: string;
  name?: string;
  facts: RenderableFact[];
  relationship?: { hasMet?: boolean; friendship?: number; romance?: number; bits?: string[] };
  // How to refer to them ("he/him"). The block names people but said nothing about which
  // of them is a he or a she, so a sim guessed from the name: Summer called Mackenzie
  // "she" while the game had him as male (live 2026-09-03, found by Scott).
  pronouns?: string;
};

export type RenderKnownFactsInput = {
  // EVERY current fact about the sim, edges included. The renderer needs the whole set to
  // measure absence: "no siblings on record" cannot be read off a list that was filtered.
  selfFacts: RenderableFact[];
  // one entry per person worth describing, already narrowed to who is here or mentioned
  people: RenderablePerson[];
  // The people in this sim's life regardless of who is present: family, partners and the
  // closest friends. Never overlaps `people` - the caller puts each person in one list.
  lifePeople?: RenderablePerson[];
  told: { text: string; saidBy?: string; confidence: number }[];
  // A name can genuinely be missing (an unmet sim mentioned by id), so the fallbacks
  // below are real - the type has to admit it or the checker calls them dead code.
  names: Record<string, string | undefined>;
  // Whether a dossier for this sim has been ingested. Absence lines are rendered only when
  // it has: "no parents on record" is a claim about the game's records, and a sim with no
  // dossier row has no records rather than empty ones.
  hasDossier?: boolean;
  maxChars?: number;
};

// Raised from 1000 when the block gained the absence lines and the people-in-your-life
// section: at 1000 a sim with a large family lost the section that was added to help it.
export const DEFAULT_FACTS_MAX_CHARS = 2200;

// The people section is a prompt, not a census. The caller does the picking (family, up
// to ten friends, the strongest romance); this is the ceiling. Raised from six on
// 2026-09-23: a sim with seven friends at 100 lost her romantic interest off the list.
export const MAX_LIFE_PEOPLE = 16;

function pretty(value: string): string {
  return value
    .replace(/^trait_SimPreference_(Likes|Dislikes)_/, '')
    .replace(/^trait_Fear_/, '')
    .replace(/^trait_/, '')
    .replace(/^career_(Adult|Teen)_/, '')
    .replace(/^aspiration_/, '')
    .replace(/^Track_/, '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

// "Travis Scott, Mackenzie Scott and Ariel Scott"
function joinWords(values: string[], conjunction: 'and' | 'or'): string {
  if (values.length <= 1) {
    return values[0] ?? '';
  }
  return `${values.slice(0, -1).join(', ')} ${conjunction} ${values[values.length - 1]}`;
}

// 'family_Target_IsSonOrDaughterOf_Actor' -> 'their child'. The bit is written from the
// ACTOR's side (the subject of the fact), so Target_Is<X>Of_Actor means the other sim is
// the subject's <X>. Anything unrecognized falls back to a readable form of the raw name
// rather than being dropped: a wrong-looking label is debuggable, a missing one is not.
export function familyBitWords(bit: string): string {
  const match = /family_Target_Is(.+?)Of_Actor/i.exec(bit);
  const role = match ? match[1] : undefined;
  if (!role) {
    return pretty(bit.replace(/^family_/, ''));
  }
  const lowered = role.toLowerCase();
  const table: Record<string, string> = {
    sonordaughter: 'their child',
    parent: 'their parent',
    siblings: 'their sibling',
    sibling: 'their sibling',
    // The game's actual sibling bit is family_Target_IsBrotherSisterOf_Actor; it rendered
    // as "your brother sister" in every live facts block until 2026-09-04
    brothersister: 'their sibling',
    brotherorsister: 'their sibling',
    grandparent: 'their grandparent',
    grandchild: 'their grandchild',
    auntuncle: 'their aunt or uncle',
    niecenephew: 'their niece or nephew',
    cousin: 'their cousin',
    spouse: 'their spouse',
    // The game keeps step relations OUT of genealogy - a stepparent appears in nobody's
    // family tree but their own - so the bit is the only record of one that exists. Live
    // 2026-09-05: Alex Moyer read to her stepson Ehren as "you live together" and nothing
    // more, while both his birth parents read as parents, and he spent the day guessing
    // what she was to him ("my dads", "two moms", "Daddy Jonah and Alex").
    stepparent: 'their stepparent',
    stepchild: 'their stepchild',
    stepsibling: 'their stepsibling',
  };
  return table[lowered] ?? `their ${pretty(role).toLowerCase()}`;
}

// The game stores a career as a tuning name plus the level the diff cares about
// ('career_Adult_Culinary (level 4)'). The level's actual job title (Line Cook, Mixologist)
// is a LocalizedString the mod cannot read without the string table, so the track is the
// best available - said as a career rather than as a job title, which is what stopped a
// Culinary sim from inventing a bartending job.
export function jobWords(objectText: string): string {
  const match = /^(.*?)\s*\(level (\d+)\)\s*$/.exec(objectText);
  const track = pretty(match ? match[1] : objectText);
  return match ? `you work in the ${track} career, level ${match[2]}` : `you work in the ${track} career`;
}

function selfLine(fact: RenderableFact, names: Record<string, string | undefined>): string | undefined {
  const name = (id?: string) => (id ? (names[id] ?? `sim ${id}`) : undefined);
  switch (fact.predicate) {
    case FactPredicate.AGE_STAGE:
      return fact.objectText ? `you are ${lifeStagePhrase(fact.objectText)}` : undefined;
    case FactPredicate.GENDER:
      return fact.objectText ? `you are ${fact.objectText.toLowerCase()}` : undefined;
    case FactPredicate.PRONOUNS:
      return fact.objectText ? `your pronouns are ${fact.objectText}` : undefined;
    case FactPredicate.OCCULT_CURRENT:
      return fact.objectText && fact.objectText !== 'HUMAN' ? `you are a ${fact.objectText.toLowerCase()}` : undefined;
    case FactPredicate.DEATH_TYPE:
      return `you are dead (${pretty(fact.objectText ?? '')})`;
    case FactPredicate.ASPIRATION:
      return fact.objectText ? `your aspiration is ${pretty(fact.objectText)}` : undefined;
    case FactPredicate.JOB:
      return fact.objectText ? jobWords(fact.objectText) : undefined;
    case FactPredicate.PARENT:
      return `${name(fact.objectSimId)} is your parent`;
    case FactPredicate.CHILD:
      return `${name(fact.objectSimId)} is your child`;
    case FactPredicate.SIBLING:
      return `${name(fact.objectSimId)} is your sibling`;
    case FactPredicate.GRANDPARENT:
      return `${name(fact.objectSimId)} is your grandparent`;
    case FactPredicate.SPOUSE:
      return `${name(fact.objectSimId)} is your husband or wife`;
    case FactPredicate.FIANCE:
      return `you are engaged to ${name(fact.objectSimId)}`;
    case FactPredicate.STEADY:
      return `${name(fact.objectSimId)} is your partner`;
    default:
      return undefined;
  }
}

// Household and its members are one sentence, not a name plus a silent list of ids: the
// members were rendered nowhere at all before, which is how a sim living with three named
// people answered "who do you live with" with the household's name.
function householdLine(facts: RenderableFact[], names: Record<string, string | undefined>): string | undefined {
  const household = facts.find((fact) => fact.predicate === FactPredicate.HOUSEHOLD)?.objectText;
  const members = facts
    .filter((fact) => fact.predicate === FactPredicate.HOUSEHOLD_MEMBER && fact.objectSimId)
    .map((fact) => names[fact.objectSimId as string] ?? `sim ${fact.objectSimId as string}`);
  if (members.length > 0) {
    return household
      ? `you live with ${joinWords(members, 'and')} (the ${household} household)`
      : `you live with ${joinWords(members, 'and')}`;
  }
  if (household) {
    // A one-sim household is a real answer, and so is a household whose members the
    // dossier could not name
    return `you live with the ${household} household`;
  }
  return undefined;
}

const FAMILY_ROLE_LABELS: [string, string][] = [
  [FactPredicate.PARENT, 'parents'],
  [FactPredicate.SIBLING, 'siblings'],
  [FactPredicate.CHILD, 'children'],
];

const PARTNER_PREDICATES = [FactPredicate.SPOUSE, FactPredicate.FIANCE, FactPredicate.STEADY];

// What the game records that this sim does NOT have. Only called when a dossier has been
// ingested, so every line here is "the records say no", never "we have no records".
function absenceLines(facts: RenderableFact[]): string[] {
  const lines: string[] = [];
  const has = (predicate: string) => facts.some((fact) => fact.predicate === predicate);

  const missing = FAMILY_ROLE_LABELS.filter(([predicate]) => !has(predicate)).map(([, label]) => label);
  if (missing.length > 0) {
    lines.push(`you have no ${joinWords(missing, 'or')} on record`);
  }
  if (!PARTNER_PREDICATES.some(has)) {
    lines.push('you are not married or seeing anyone');
  }
  if (!has(FactPredicate.JOB)) {
    // An elder with no career has retired rather than never worked, and that is the word
    // a person uses for it
    const stage = facts.find((fact) => fact.predicate === FactPredicate.AGE_STAGE)?.objectText?.toUpperCase();
    lines.push(stage === 'ELDER' ? 'you are retired' : 'you have no job');
  }
  return lines;
}

// Traits, likes, dislikes and fears are lists, so they read far better collapsed into one
// line each than as one bullet per value.
function collectList(facts: RenderableFact[], predicate: string): string[] {
  return facts
    .filter((fact) => fact.predicate === predicate && fact.objectText)
    .map((fact) => pretty(fact.objectText as string));
}

function joinList(values: string[], limit = 6): string {
  const kept = values.slice(0, limit);
  const suffix = values.length > limit ? ', ...' : '';
  return kept.join(', ') + suffix;
}

// "your sibling" said the way a person says it once the pronouns are known. Anything else
// (unknown pronouns, a role with no gendered word) comes back unchanged.
const GENDERED_ROLES: Partial<Record<string, [string, string]>> = {
  'your sibling': ['your brother', 'your sister'],
  'your child': ['your son', 'your daughter'],
  'your parent': ['your father', 'your mother'],
  'your grandparent': ['your grandfather', 'your grandmother'],
  'your grandchild': ['your grandson', 'your granddaughter'],
  'your stepparent': ['your stepfather', 'your stepmother'],
  'your stepchild': ['your stepson', 'your stepdaughter'],
  'your stepsibling': ['your stepbrother', 'your stepsister'],
};

function genderedRole(role: string, pronouns?: string): string {
  const pair = GENDERED_ROLES[role];
  if (!pair) {
    return role;
  }
  if (pronouns === 'he/him') {
    return pair[0];
  }
  if (pronouns === 'she/her') {
    return pair[1];
  }
  return role;
}

function personLine(person: RenderablePerson, names: Record<string, string | undefined>): string | undefined {
  const name = person.name ?? names[person.simId] ?? `sim ${person.simId}`;
  const parts: string[] = [];
  // The family bit is the precise word ("their child"), so it beats the score band
  const familyBit = person.facts.find((fact) => fact.predicate === FactPredicate.FAMILY_BIT)?.objectText;
  // With pronouns known the role gets its everyday word ("your brother"), which also
  // makes the generic id-list line ("your sibling") redundant
  const familyWords = familyBit
    ? genderedRole(familyBitWords(familyBit).replace('their ', 'your '), person.pronouns)
    : undefined;
  if (familyWords) {
    parts.push(familyWords);
  }
  for (const fact of person.facts) {
    const line = selfLine(fact, names);
    // reuse the self wording but from the other direction: "X is your parent"
    if (line && line.includes('your') && fact.predicate !== FactPredicate.FAMILY_BIT) {
      const role = line.replace(`${name} is `, '').replace('you are engaged to ', 'engaged to ');
      if (role !== line && genderedRole(role, person.pronouns) !== familyWords) {
        parts.push(role);
      }
    }
  }
  if (person.facts.some((fact) => fact.predicate === FactPredicate.HOUSEHOLD_MEMBER)) {
    parts.push('you live together');
  }
  if (person.relationship) {
    parts.push(...relationshipWords(person.relationship));
  }
  const unique = [...new Set(parts.filter(Boolean))];
  if (unique.length === 0) {
    return undefined;
  }
  // Pronouns ride with the name rather than in the list of relationship words: they are
  // how to SAY the name, not a fact about the relationship.
  const label = person.pronouns ? `${name} (${person.pronouns})` : name;
  return `- ${label}: ${unique.join(', ')}`;
}

export function renderKnownFacts(input: RenderKnownFactsInput): string {
  const lines: string[] = [];
  const lifePeople = (input.lifePeople ?? []).slice(0, MAX_LIFE_PEOPLE);
  // Anyone described in a people section is not also described as a bare self edge: the
  // section line says "your child, a good friend", the self line would say it again
  const describedElsewhere = new Set([...input.people, ...lifePeople].map((person) => person.simId));

  const selfLines: string[] = [];
  for (const fact of input.selfFacts) {
    if (fact.objectSimId && describedElsewhere.has(fact.objectSimId)) {
      continue;
    }
    const line = selfLine(fact, input.names);
    if (line) {
      selfLines.push(line);
    }
  }
  const household = householdLine(input.selfFacts, input.names);
  if (household) {
    selfLines.push(household);
  }
  if (input.hasDossier) {
    selfLines.push(...absenceLines(input.selfFacts));
  }
  for (const [predicate, label] of [
    [FactPredicate.TRAIT, 'your personality'],
    [FactPredicate.FEAR, 'you are afraid of'],
    [FactPredicate.LIKES, 'you like'],
    [FactPredicate.DISLIKES, 'you dislike'],
  ] as const) {
    const values = collectList(input.selfFacts, predicate);
    if (values.length > 0) {
      selfLines.push(`${label}: ${joinList(values)}`);
    }
  }
  if (selfLines.length > 0) {
    lines.push('About you:');
    lines.push(...selfLines.map((line) => `- ${line}`));
  }

  const peopleLines = input.people
    .map((person) => personLine(person, input.names))
    .filter((line): line is string => Boolean(line));
  if (peopleLines.length > 0) {
    lines.push('About people here or mentioned:');
    lines.push(...peopleLines);
  }

  const lifeLines = lifePeople
    .map((person) => personLine(person, input.names))
    .filter((line): line is string => Boolean(line));
  if (lifeLines.length > 0) {
    lines.push('People in your life:');
    lines.push(...lifeLines);
  }

  if (input.told.length > 0) {
    lines.push('Recently learned (may not be true):');
    for (const item of input.told) {
      const attribution = item.saidBy ? ` (said by ${item.saidBy})` : '';
      lines.push(`- ${item.text}${attribution}`);
    }
  }

  if (lines.length === 0) {
    return '';
  }

  // Trim from the end: self facts matter most and hearsay least, and the sections are
  // already in that order.
  const maxChars = input.maxChars ?? DEFAULT_FACTS_MAX_CHARS;
  const kept: string[] = [];
  let used = 0;
  for (const line of lines) {
    if (used + line.length + 1 > maxChars) {
      break;
    }
    kept.push(line);
    used += line.length + 1;
  }
  if (kept.length === 0) {
    return '';
  }
  return `<KNOWN_FACTS>\n${kept.join('\n')}\n</KNOWN_FACTS>`;
}
