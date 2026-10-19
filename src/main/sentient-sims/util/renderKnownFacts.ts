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
import { speciesWord } from './alsoPresent';
import {
  aspirationWords,
  attractionWords,
  businessParts,
  careerParts,
  factValueWords,
  familyBitWords,
  isChildPhase,
  preferenceKind,
} from './factWords';
import { lifeStagePhrase } from './lifeStageWords';

// The family-bit words live with the rest of the vocabulary now; re-exported because the
// battery graders and the tests reach them through this module.
export { familyBitWords };
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
  // The game's Species name (DOG, CAT, ...) for every pet among the ids above. A sim
  // with no entry is a person. The dossier never says this, so "you live with Bosun"
  // read as a person until the state report's species reached the block (2026-10-12).
  species?: Record<string, string | undefined>;
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

// "Travis Scott, Mackenzie Scott and Ariel Scott"
function joinWords(values: string[], conjunction: 'and' | 'or'): string {
  if (values.length <= 1) {
    return values[0] ?? '';
  }
  return `${values.slice(0, -1).join(', ')} ${conjunction} ${values[values.length - 1]}`;
}

// The game stores a career as a tuning name plus the level the diff cares about
// ('career_Adult_Culinary (level 4)'). The level's actual job title (Line Cook, Mixologist)
// is a LocalizedString the mod cannot read without the string table, so the track is the
// best available - said as a career rather than as a job title, which is what stopped a
// Culinary sim from inventing a bartending job.
export function jobWords(objectText: string): string {
  const { track, branch, level } = careerParts(objectText);
  if (track === objectText && !level) {
    // Not a career tuning name: a job the player typed ("Pub Owner at The Gnome's Arms")
    return `you work as ${track}`;
  }
  const career = branch ? `the ${track} career (${branch} branch)` : `the ${track} career`;
  return level ? `you work in ${career}, level ${level}` : `you work in ${career}`;
}

// 'Vale Curios' -> 'you own a small business, Vale Curios';
// 'Chez Vale (restaurant)' -> 'you own a restaurant, Chez Vale'
export function businessWords(objectText: string): string {
  const { name, kind } = businessParts(objectText);
  return `you own a ${kind}, ${name}`;
}

type Species = Record<string, string | undefined>;

// "dog", "cat", "small dog" - or "pet" when the species is unknown
function petWord(simId: string | undefined, species: Species): string {
  return (simId && speciesWord(species[simId])) || 'pet';
}

function selfLine(
  fact: RenderableFact,
  names: Record<string, string | undefined>,
  species: Species = {},
): string | undefined {
  const name = (id?: string) => (id ? (names[id] ?? `sim ${id}`) : undefined);
  switch (fact.predicate) {
    case FactPredicate.NOTE:
      // The player's own words, verbatim: this is the "always know this" field
      return fact.objectText?.trim() || undefined;
    case FactPredicate.SPECIES: {
      const word = speciesWord(fact.objectText);
      return word ? `you are a ${word}` : undefined;
    }
    case FactPredicate.PET:
      return `${name(fact.objectSimId)} is your ${petWord(fact.objectSimId, species)}`;
    case FactPredicate.AGE_STAGE:
      return fact.objectText ? `you are ${lifeStagePhrase(fact.objectText)}` : undefined;
    case FactPredicate.GENDER:
      return fact.objectText ? `you are ${fact.objectText.toLowerCase()}` : undefined;
    case FactPredicate.PRONOUNS:
      return fact.objectText ? `your pronouns are ${fact.objectText}` : undefined;
    case FactPredicate.OCCULT_CURRENT:
      return fact.objectText && fact.objectText !== 'HUMAN' ? `you are a ${fact.objectText.toLowerCase()}` : undefined;
    case FactPredicate.DEATH_TYPE:
      return `you are dead (${factValueWords(FactPredicate.DEATH_TYPE, fact.objectText ?? '')})`;
    case FactPredicate.ASPIRATION:
      return fact.objectText ? `your aspiration is ${aspirationWords(fact.objectText)}` : undefined;
    case FactPredicate.JOB:
      return fact.objectText ? jobWords(fact.objectText) : undefined;
    case FactPredicate.BUSINESS:
      return fact.objectText ? businessWords(fact.objectText) : undefined;
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
    case FactPredicate.EX_PARTNER:
      return `${name(fact.objectSimId)} is your ex (you ${fact.objectText ?? 'broke up'})`;
    default:
      return undefined;
  }
}

// Household and its members are one sentence, not a name plus a silent list of ids: the
// members were rendered nowhere at all before, which is how a sim living with three named
// people answered "who do you live with" with the household's name.
function householdLine(facts: RenderableFact[], names: Record<string, string | undefined>): string | undefined {
  const household = facts.find((fact) => fact.predicate === FactPredicate.HOUSEHOLD)?.objectText;
  // Pets are housemates too, but they get their own line: listed beside the people they
  // were taken for people (Anker introduced his dog Bosun as a man, live 2026-10-12)
  const pets = new Set(facts.filter((fact) => fact.predicate === FactPredicate.PET).map((fact) => fact.objectSimId));
  const members = facts
    .filter(
      (fact) => fact.predicate === FactPredicate.HOUSEHOLD_MEMBER && fact.objectSimId && !pets.has(fact.objectSimId),
    )
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

// "your pets: Bosun the dog and Luna the cat". One line for all of them, after the
// household line, so the people and the animals are never one list.
function petsLine(
  facts: RenderableFact[],
  names: Record<string, string | undefined>,
  species: Species,
): string | undefined {
  const pets = facts
    .filter((fact) => fact.predicate === FactPredicate.PET && fact.objectSimId)
    .map((fact) => {
      const id = fact.objectSimId as string;
      return `${names[id] ?? `sim ${id}`} the ${petWord(id, species)}`;
    });
  if (pets.length === 0) {
    return undefined;
  }
  return pets.length === 1 ? `your pet: ${pets[0]}` : `your pets: ${joinWords(pets, 'and')}`;
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
  if (!has(FactPredicate.JOB) && !has(FactPredicate.BUSINESS)) {
    // An elder with no career has retired rather than never worked, and that is the word
    // a person uses for it. A sim who owns a business is not jobless either.
    const stage = facts.find((fact) => fact.predicate === FactPredicate.AGE_STAGE)?.objectText?.toUpperCase();
    lines.push(stage === 'ELDER' ? 'you are retired' : 'you have no job');
  }
  return lines;
}

// 'trait_ChildhoodPhase_Clingy' -> 'you are going through a clingy phase';
// 'trait_ChildConfidence_High' -> 'your confidence is high'
export function phaseWords(raw: string): string {
  const confidence = /ChildConfidence_(.+)$/i.exec(raw);
  if (confidence) {
    return `your confidence is ${factValueWords(FactPredicate.PHASE, raw)
      .replace(/ Confidence$/, '')
      .toLowerCase()}`;
  }
  if (/ChildhoodPhase_/i.test(raw)) {
    return `you are going through a ${factValueWords(FactPredicate.PHASE, raw).toLowerCase()} phase`;
  }
  return factValueWords(FactPredicate.PHASE, raw);
}

// Traits, likes, dislikes and fears are lists, so they read far better collapsed into one
// line each than as one bullet per value.
function collectList(facts: RenderableFact[], predicate: string): string[] {
  return facts
    .filter((fact) => fact.predicate === predicate && fact.objectText)
    .map((fact) => factValueWords(predicate, fact.objectText as string));
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

function personLine(
  person: RenderablePerson,
  names: Record<string, string | undefined>,
  species: Species = {},
): string | undefined {
  const name = person.name ?? names[person.simId] ?? `sim ${person.simId}`;
  const parts: string[] = [];
  const isPet = person.facts.some((fact) => fact.predicate === FactPredicate.PET);
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
    const line = selfLine(fact, names, species);
    // reuse the self wording but from the other direction: "X is your parent"
    if (line && line.includes('your') && fact.predicate !== FactPredicate.FAMILY_BIT) {
      const role = line.replace(`${name} is `, '').replace('you are engaged to ', 'engaged to ');
      if (role !== line && genderedRole(role, person.pronouns) !== familyWords) {
        parts.push(role);
      }
    }
  }
  // "your dog" already says the dog lives here
  if (!isPet && person.facts.some((fact) => fact.predicate === FactPredicate.HOUSEHOLD_MEMBER)) {
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
  // how to SAY the name, not a fact about the relationship. So does the species: "Bosun
  // (dog, he/him)" is what keeps a pet from being written as a man.
  const tags = [speciesWord(species[person.simId]), person.pronouns].filter(Boolean);
  const label = tags.length > 0 ? `${name} (${tags.join(', ')})` : name;
  return `- ${label}: ${unique.join(', ')}`;
}

export function renderKnownFacts(input: RenderKnownFactsInput): string {
  const lines: string[] = [];
  const lifePeople = (input.lifePeople ?? []).slice(0, MAX_LIFE_PEOPLE);
  // Anyone described in a people section is not also described as a bare self edge: the
  // section line says "your child, a good friend", the self line would say it again
  const describedElsewhere = new Set([...input.people, ...lifePeople].map((person) => person.simId));

  const species = input.species ?? {};
  const selfLines: string[] = [];
  const notes: string[] = [];
  for (const fact of input.selfFacts) {
    if (fact.objectSimId && describedElsewhere.has(fact.objectSimId)) {
      continue;
    }
    // Pets are the pets line, whoever else describes them; notes go after the household
    if (fact.predicate === FactPredicate.PET) {
      continue;
    }
    const line = selfLine(fact, input.names, species);
    if (!line) {
      continue;
    }
    if (fact.predicate === FactPredicate.NOTE) {
      notes.push(line);
    } else {
      selfLines.push(line);
    }
  }
  const household = householdLine(input.selfFacts, input.names);
  if (household) {
    selfLines.push(household);
  }
  const pets = petsLine(input.selfFacts, input.names, species);
  if (pets) {
    selfLines.push(pets);
  }
  // What the player wrote for this sim to always know, in the player's words, right
  // after who they live with: that is where "Bosun is your dog" belongs.
  selfLines.push(...notes);
  if (input.hasDossier) {
    selfLines.push(...absenceLines(input.selfFacts));
  }
  // Reward traits ride with the personality: Business Savvy is as much who Alex is as
  // Materialistic. A child's phase is its own line because it is what they are going
  // through now, not who they are.
  const phaseFacts = input.selfFacts.filter((fact) => fact.predicate === FactPredicate.PHASE && fact.objectText);
  const personality = [
    ...collectList(input.selfFacts, FactPredicate.TRAIT),
    ...collectList(input.selfFacts, FactPredicate.REWARD_TRAIT),
    // A grown sim's "phase" (WickedWhims' Hypofertile) is a trait, not something passing
    ...phaseFacts
      .filter((fact) => !isChildPhase(fact.objectText as string))
      .map((fact) => factValueWords(FactPredicate.PHASE, fact.objectText as string)),
  ];
  if (personality.length > 0) {
    selfLines.push(`your personality: ${joinList(personality, 10)}`);
  }
  const phases = phaseFacts
    .filter((fact) => isChildPhase(fact.objectText as string))
    .map((fact) => phaseWords(fact.objectText as string));
  if (phases.length > 0) {
    selfLines.push(`right now: ${joinList(phases)}`);
  }
  const fears = collectList(input.selfFacts, FactPredicate.FEAR);
  if (fears.length > 0) {
    selfLines.push(`you are afraid of: ${joinList(fears)}`);
  }
  // Skills, highest first. Never rendered before 2026-10-13; a sim with Charisma 9 and
  // Cooking 1 should know which is which.
  const skills = input.selfFacts
    .filter((fact) => fact.predicate === FactPredicate.SKILL && fact.objectText)
    .map((fact) => ({
      text: factValueWords(FactPredicate.SKILL, fact.objectText as string),
      level: Number(/\(level (\d+)\)/.exec(fact.objectText as string)?.[1] ?? 0),
    }))
    .sort((a, b) => b.level - a.level)
    .map((skill) => skill.text);
  if (skills.length > 0) {
    selfLines.push(`your skills: ${joinList(skills, 8)}`);
  }
  // Likes and dislikes split from turn-ons and turn-offs: the store files Lovestruck
  // attraction under the same predicates, and "you like: Cooking, Broke (turn-on)" read
  // as if the sim liked being broke.
  const preferences: Record<string, string[]> = { 'likes': [], 'dislikes': [], 'turn-on': [], 'turn-off': [] };
  for (const fact of input.selfFacts) {
    if ((fact.predicate === FactPredicate.LIKES || fact.predicate === FactPredicate.DISLIKES) && fact.objectText) {
      const kind = preferenceKind(fact.objectText, fact.predicate === FactPredicate.LIKES ? 'likes' : 'dislikes');
      const isAttraction = kind === 'turn-on' || kind === 'turn-off';
      preferences[kind].push(
        isAttraction ? attractionWords(fact.objectText) : factValueWords(fact.predicate, fact.objectText),
      );
    }
  }
  for (const [kind, label] of [
    ['likes', 'you like'],
    ['dislikes', 'you dislike'],
    ['turn-on', 'your turn-ons'],
    ['turn-off', 'your turn-offs'],
  ] as const) {
    if (preferences[kind].length > 0) {
      selfLines.push(`${label}: ${joinList(preferences[kind])}`);
    }
  }
  if (selfLines.length > 0) {
    lines.push('About you:');
    lines.push(...selfLines.map((line) => `- ${line}`));
  }

  const peopleLines = input.people
    .map((person) => personLine(person, input.names, species))
    .filter((line): line is string => Boolean(line));
  if (peopleLines.length > 0) {
    lines.push('About people here or mentioned:');
    lines.push(...peopleLines);
  }

  const lifeLines = lifePeople
    .map((person) => personLine(person, input.names, species))
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
