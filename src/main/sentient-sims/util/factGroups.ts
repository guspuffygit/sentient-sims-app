// The Facts window's view of one sim: a summary line of the things a player looks for
// first, the player's own facts, then the game's categories in alphabetical order with
// their rows in alphabetical order.
// Pure, so the grouping is unit-tested and the dialog only renders.
//
// The store groups nothing (it is a flat table of claims), and the dialog used to show
// it as the game sent it: traits beside turn-ons beside forty people met. A player
// wants "what is this sim like" at a glance; this is the shape that answers it. The
// prompt (renderKnownFacts) reads the same facts its own way; nothing here changes what
// a sim is told.

import { FactPredicate } from '../pipeline/facts/predicates';
import {
  aspirationWords,
  businessParts,
  careerParts,
  enumWords,
  factValueWords,
  familyBitWords,
  isChildPhase,
  preferenceKind,
  preferenceParts,
} from './factWords';

// The dialog's record shape: what the facts route returns, minus the fields the view
// never reads. Typed loosely so the renderer's SimFactRecord fits without a cast.
export type GroupableFact = {
  id?: number;
  predicate: string;
  objectText?: string;
  objectSimId?: string;
  source: string;
  validFromDay?: number;
  validToDay?: number;
};

// The live relationship with one other sim, from the stored dossier: the scores and the
// game's relationship bits ('friendship-good_friends', 'romantic-Broken_Up'). Not facts,
// because scores drift every few minutes, but the Facts window sorts the people met by
// them.
export type GroupableRelationship = { friendship?: number; romance?: number; bits?: string[] };

export type FactRow<F extends GroupableFact = GroupableFact> = {
  // The main words: a trait, a person's name, a note
  label: string;
  // Qualifier after the label: "child", "dog", "level 6"
  detail?: string;
  // The predicate of the row, for the help tooltip ("what does household mean")
  predicate: string;
  source: string;
  retired: boolean;
  // Every fact this row stands for: a family row merges the genealogy edge and the
  // family bit for the same person, so Retire needs them all
  facts: F[];
  // Sub-heading inside the category ("Colors" under Likes), when the category has them
  group?: string;
  // Sorts before the alphabet: a current partner above an ex, a high skill above a low
  rank?: number;
};

export type FactGroup<F extends GroupableFact = GroupableFact> = { title: string; rows: FactRow<F>[] };

export type FactCategory<F extends GroupableFact = GroupableFact> = {
  title: string;
  // What goes in this category, for the header's help icon
  help: string;
  // Every row, in order, for the count and for categories with no sub-headings
  rows: FactRow<F>[];
  // Rows split by their sub-heading, when the category uses them (Likes, Sims Met)
  groups?: FactGroup<F>[];
  // Long lists the player rarely needs start folded
  collapsedByDefault?: boolean;
};

// One tag on the summary line, with the heading printed above it ("Career" over
// "Bodybuilder (Athletic, level 10)") so the tag says what it is
export type FactSummaryItem = { title: string; label: string; predicate: string };

export type GroupedFacts<F extends GroupableFact = GroupableFact> = {
  summary: FactSummaryItem[];
  categories: FactCategory<F>[];
};

export const CUSTOM_CATEGORY = 'Custom (Player Added)';
export const SIMS_MET_CATEGORY = 'Sims Met';

export const CATEGORY_HELP: Record<string, string> = {
  'Business': 'The businesses this Sim owns.',
  'Career': 'The career, its branch once chosen, and the level.',
  'Dislikes': 'What the Sim dislikes, from Create a Sim and from playing.',
  'Family': 'Family from the family tree, including step and in-law relations.',
  'Fears': 'Fears the Sim has picked up.',
  'Heard in conversation': 'Things this Sim was told or wrote in a diary, which may not be true.',
  'Household Members': 'The Sims and pets who live in the same home as this Sim.',
  'Likes': 'What the Sim likes, from Create a Sim and from playing.',
  'Partners': 'Who the Sim is married to, engaged to or going steady with, and their exes.',
  [SIMS_MET_CATEGORY]: 'Everyone this Sim has met, closest friends first.',
  'Personality': 'Traits from Create a Sim, reward traits the Sim earned, and what a child is going through right now.',
  'Skills': 'The skills the game reports for this Sim, highest first.',
  'Turn-offs': 'What puts this Sim off in a partner.',
  'Turn-ons': 'What this Sim finds attractive in a partner.',
  [CUSTOM_CATEGORY]: 'Facts you added yourself, which the Sim always knows.',
};

const HEARSAY_SOURCES = new Set(['told', 'inferred', 'reflection']);

const FAMILY_EDGES: Record<string, string> = {
  [FactPredicate.PARENT]: 'parent',
  [FactPredicate.CHILD]: 'child',
  [FactPredicate.SIBLING]: 'sibling',
  [FactPredicate.GRANDPARENT]: 'grandparent',
};

const PARTNER_EDGES: Record<string, string> = {
  [FactPredicate.SPOUSE]: 'married',
  [FactPredicate.FIANCE]: 'engaged',
  [FactPredicate.STEADY]: 'going steady',
};

// The relationship bits that mean "used to be": romantic-Divorced and romantic-Broken_Up
// in the live table, plus the game's ex bits should the mod send one
const EX_BIT = /divorc|broken_up|breakup|\bex\b|exes/i;

// The friendship bits, in the order the player wants them read: closest first. The
// game writes exactly one of these per pair.
const FRIENDSHIP_GROUPS: [RegExp, string, number][] = [
  [/friendship-bff/i, 'Best Friends', 0],
  [/friendship-good_friends/i, 'Good Friends', 1],
  [/friendship-friend\b/i, 'Friends', 2],
  [/friendship-(disliked|despised|enem)/i, 'On Bad Terms', 4],
];
const ACQUAINTANCES = ['Acquaintances', 3] as const;

function compare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

function byLabel<F extends GroupableFact>(a: FactRow<F>, b: FactRow<F>): number {
  return (a.rank ?? 0) - (b.rank ?? 0) || compare(a.label, b.label) || compare(a.detail ?? '', b.detail ?? '');
}

function isRetired(fact: GroupableFact): boolean {
  return fact.validToDay !== undefined;
}

// The plain-words value of one fact, the way the Facts window prints it
export function factLabel(
  fact: GroupableFact,
  names: Record<string, string | undefined>,
  species: Record<string, string | undefined>,
): string {
  if (fact.objectSimId) {
    const name = names[fact.objectSimId] ?? `sim ${fact.objectSimId}`;
    const kind = species[fact.objectSimId];
    return kind ? `${name} (${enumWords(kind)})` : name;
  }
  return fact.objectText ? factValueWords(fact.predicate, fact.objectText) : '';
}

// Which friendship heading a met sim belongs under, and its order
function friendshipGroup(relationship?: GroupableRelationship): { title: string; rank: number } {
  const bits = relationship?.bits ?? [];
  for (const [pattern, title, rank] of FRIENDSHIP_GROUPS) {
    if (bits.some((bit) => pattern.test(bit))) {
      return { title, rank };
    }
  }
  return { title: ACQUAINTANCES[0], rank: ACQUAINTANCES[1] };
}

export function groupFacts<F extends GroupableFact>(input: {
  facts: F[];
  names: Record<string, string | undefined>;
  species: Record<string, string | undefined>;
  relationships?: Record<string, GroupableRelationship | undefined>;
}): GroupedFacts<F> {
  const { facts, names, species } = input;
  const relationships = input.relationships ?? {};
  const nameOf = (id: string) => names[id] ?? `sim ${id}`;
  const buckets = new Map<string, FactRow<F>[]>();
  const groupRank = new Map<string, number>();
  const put = (title: string, row: FactRow<F>) => {
    const rows = buckets.get(title) ?? [];
    rows.push(row);
    buckets.set(title, rows);
  };
  const simple = (title: string, fact: F, label: string, detail?: string, group?: string) => {
    put(title, {
      label,
      detail,
      group,
      predicate: fact.predicate,
      source: fact.source,
      retired: isRetired(fact),
      facts: [fact],
    });
  };

  // ---- the summary: current game or player facts only, never hearsay
  const current = facts.filter((fact) => !isRetired(fact) && !HEARSAY_SOURCES.has(fact.source));
  const one = (predicate: string) => current.find((fact) => fact.predicate === predicate)?.objectText;
  const summary: FactSummaryItem[] = [];
  const add = (title: string, label: string | undefined, predicate: string) => {
    if (label) {
      summary.push({ title, label, predicate });
    }
  };
  const speciesText = one(FactPredicate.SPECIES);
  const age = one(FactPredicate.AGE_STAGE);
  if (age) {
    add('Age', enumWords(age), FactPredicate.AGE_STAGE);
  }
  const gender = one(FactPredicate.GENDER);
  const pronouns = one(FactPredicate.PRONOUNS);
  if (gender) {
    add('Gender', pronouns ? `${enumWords(gender)} (${pronouns})` : enumWords(gender), FactPredicate.GENDER);
  } else if (pronouns) {
    add('Pronouns', pronouns, FactPredicate.PRONOUNS);
  }
  if (speciesText) {
    add('Species', enumWords(speciesText), FactPredicate.SPECIES);
  } else {
    const occult = one(FactPredicate.OCCULT_CURRENT) ?? one(FactPredicate.OCCULT);
    if (occult && occult.toUpperCase() !== 'HUMAN') {
      add('Occult', enumWords(occult), FactPredicate.OCCULT_CURRENT);
    }
  }
  if (one(FactPredicate.ALIVE)?.toLowerCase() === 'no') {
    const death = one(FactPredicate.DEATH_TYPE);
    add('Status', death ? `ghost (${factValueWords(FactPredicate.DEATH_TYPE, death)})` : 'ghost', FactPredicate.ALIVE);
  }
  const household = one(FactPredicate.HOUSEHOLD);
  if (household) {
    add('Household', household, FactPredicate.HOUSEHOLD);
  }
  const job = one(FactPredicate.JOB);
  if (job) {
    // "Bodybuilder (Athletic, level 10)" once the sim has branched, "Athletic, level 3" before
    const { track, branch, level } = careerParts(job);
    const inside = [branch ? track : undefined, level ? `level ${level}` : undefined].filter(Boolean).join(', ');
    add('Career', branch ? `${branch} (${inside})` : inside ? `${track}, ${inside}` : track, FactPredicate.JOB);
  }
  const businesses = current
    .filter((fact) => fact.predicate === FactPredicate.BUSINESS && fact.objectText)
    .map((fact) => businessParts(fact.objectText as string).name);
  if (businesses.length > 0) {
    add('Business', businesses.join(', '), FactPredicate.BUSINESS);
  }
  const aspiration = one(FactPredicate.ASPIRATION);
  if (aspiration) {
    add('Aspiration', aspirationWords(aspiration), FactPredicate.ASPIRATION);
  }

  // ---- the categories
  const pets = new Set(facts.filter((fact) => fact.predicate === FactPredicate.PET).map((fact) => fact.objectSimId));
  // Rows about one other sim merge the edges for that sim: the genealogy edge with the
  // family bit, the spouse edge with the romantic bit, the dog's member edge with its
  // pet edge.
  const family = new Map<string, FactRow<F>>();
  const partners = new Map<string, FactRow<F>>();
  const members = new Map<string, FactRow<F>>();
  const merge = (map: Map<string, FactRow<F>>, fact: F, detail: string): FactRow<F> => {
    const id = fact.objectSimId as string;
    const key = `${id}:${isRetired(fact) ? 'old' : 'now'}`;
    const row = map.get(key);
    if (row) {
      row.facts.push(fact);
      if (!row.detail?.split(', ').includes(detail)) {
        row.detail = row.detail ? `${row.detail}, ${detail}` : detail;
      }
      return row;
    }
    const made: FactRow<F> = {
      label: nameOf(id),
      detail,
      predicate: fact.predicate,
      source: fact.source,
      retired: isRetired(fact),
      facts: [fact],
    };
    map.set(key, made);
    return made;
  };
  // An ex sits below the current partners and is marked on the name
  const markEx = (row: FactRow<F>, id: string) => {
    row.label = `${nameOf(id)} (ex)`;
    row.rank = 1;
  };

  for (const fact of facts) {
    if (HEARSAY_SOURCES.has(fact.source)) {
      // Whatever it claims, hearsay is its own category: a told "spouse" is not a partner
      simple('Heard in conversation', fact, `${fact.predicate.replace(/_/g, ' ')}: ${factLabel(fact, names, species)}`);
      continue;
    }
    switch (fact.predicate) {
      case FactPredicate.NOTE:
        simple(CUSTOM_CATEGORY, fact, fact.objectText ?? '');
        break;
      case FactPredicate.TRAIT:
      case FactPredicate.REWARD_TRAIT:
        // A reward trait is a trait: no tag, the player asked for the bare word
        simple('Personality', fact, factLabel(fact, names, species));
        break;
      case FactPredicate.PHASE: {
        // A grown sim's "phase" (WickedWhims' Hypofertile) is just a trait: no tag
        const text = fact.objectText ?? '';
        const detail = /ChildhoodPhase_/i.test(text) ? 'childhood phase' : isChildPhase(text) ? 'right now' : undefined;
        simple('Personality', fact, factLabel(fact, names, species), detail);
        break;
      }
      case FactPredicate.FEAR:
        simple('Fears', fact, factLabel(fact, names, species));
        break;
      case FactPredicate.LIKES:
      case FactPredicate.DISLIKES: {
        const text = fact.objectText ?? '';
        const kind = preferenceKind(text, fact.predicate === FactPredicate.LIKES ? 'likes' : 'dislikes');
        const title = { 'likes': 'Likes', 'dislikes': 'Dislikes', 'turn-on': 'Turn-ons', 'turn-off': 'Turn-offs' }[
          kind
        ];
        const parts = preferenceParts(text);
        simple(title, fact, parts.label, undefined, parts.group);
        break;
      }
      case FactPredicate.SKILL: {
        const match = /^(.*?)\s*\(level (\d+)\)\s*$/.exec(factLabel(fact, names, species));
        put('Skills', {
          label: match ? match[1] : factLabel(fact, names, species),
          detail: match ? `level ${match[2]}` : undefined,
          predicate: fact.predicate,
          source: fact.source,
          retired: isRetired(fact),
          facts: [fact],
          // Highest first, the way the game's skill panel reads
          rank: match ? -Number(match[2]) : 0,
        });
        break;
      }
      case FactPredicate.JOB: {
        const { track, branch, level } = careerParts(fact.objectText ?? '');
        const detail = [branch ? track : undefined, level ? `level ${level}` : undefined].filter(Boolean).join(', ');
        simple('Career', fact, branch ?? track, detail || undefined);
        break;
      }
      case FactPredicate.BUSINESS: {
        const { name: businessName, kind } = businessParts(fact.objectText ?? '');
        simple('Business', fact, businessName, kind);
        break;
      }
      case FactPredicate.ASPIRATION:
      case FactPredicate.HOUSEHOLD:
        // The aspiration and the household's name are on the summary line; the
        // household category is who lives there
        break;
      case FactPredicate.HOUSEHOLD_MEMBER:
      case FactPredicate.PET:
        if (fact.objectSimId) {
          const kind = species[fact.objectSimId];
          const isPet = fact.predicate === FactPredicate.PET || pets.has(fact.objectSimId);
          merge(members, fact, kind ? enumWords(kind) : isPet ? 'pet' : 'Sim');
        }
        break;
      case FactPredicate.KNOWS:
        if (fact.objectSimId) {
          // Closest friends first: the game's friendship bit picks the sub-heading
          const { title, rank } = friendshipGroup(relationships[fact.objectSimId]);
          groupRank.set(title, rank);
          simple(SIMS_MET_CATEGORY, fact, factLabel(fact, names, species), undefined, title);
        }
        break;
      case FactPredicate.PARENT:
      case FactPredicate.CHILD:
      case FactPredicate.SIBLING:
      case FactPredicate.GRANDPARENT:
        if (fact.objectSimId) {
          merge(family, fact, FAMILY_EDGES[fact.predicate]);
        }
        break;
      case FactPredicate.SPOUSE:
      case FactPredicate.FIANCE:
      case FactPredicate.STEADY:
        if (fact.objectSimId) {
          merge(partners, fact, PARTNER_EDGES[fact.predicate]);
        }
        break;
      case FactPredicate.EX_PARTNER:
        if (fact.objectSimId) {
          markEx(
            merge(partners, fact, factValueWords(FactPredicate.EX_PARTNER, fact.objectText ?? '')),
            fact.objectSimId,
          );
        }
        break;
      case FactPredicate.FAMILY_BIT: {
        if (!fact.objectSimId || !fact.objectText) {
          break;
        }
        const bitWords = familyBitWords(fact.objectText).replace(/^their /, '');
        if (/^romantic-/i.test(fact.objectText)) {
          const row = merge(partners, fact, bitWords);
          if (EX_BIT.test(fact.objectText)) {
            markEx(row, fact.objectSimId);
          }
        } else {
          merge(family, fact, bitWords);
        }
        break;
      }
      default:
        // The identity facts (age, gender, pronouns, occult, alive, death, species) are
        // the summary line; a row for each would say it twice.
        break;
    }
  }
  // A family bit beside its genealogy edge says the same thing twice ("child, child") -
  // the merge de-duplicates - but "child, stepchild" would be wrong, so when the bit is
  // the more precise word it replaces the edge word.
  for (const row of family.values()) {
    const parts = (row.detail ?? '').split(', ');
    const precise = parts.filter((part) => /^step|^half|in-law|cousin|aunt|niece|grand/.test(part));
    if (precise.length > 0 && parts.length > precise.length) {
      row.detail = precise.join(', ');
    }
  }
  for (const row of family.values()) {
    put('Family', row);
  }
  for (const row of partners.values()) {
    put('Partners', row);
  }
  for (const row of members.values()) {
    put('Household Members', row);
  }

  const categories: FactCategory<F>[] = [...buckets.entries()]
    .map(([title, rows]) => {
      const sorted = rows.sort(byLabel);
      let groups: FactGroup<F>[] | undefined;
      if (sorted.some((row) => row.group)) {
        const byGroup = new Map<string, FactRow<F>[]>();
        for (const row of sorted) {
          const key = row.group ?? 'Other';
          byGroup.set(key, [...(byGroup.get(key) ?? []), row]);
        }
        groups = [...byGroup.entries()]
          .map(([groupTitle, groupRows]) => ({ title: groupTitle, rows: groupRows }))
          // Likes read A to Z; the Sims met read closest first
          .sort((a, b) => (groupRank.get(a.title) ?? 0) - (groupRank.get(b.title) ?? 0) || compare(a.title, b.title));
      }
      return {
        title,
        help: CATEGORY_HELP[title] ?? '',
        rows: sorted,
        groups,
        collapsedByDefault: title === SIMS_MET_CATEGORY,
      };
    })
    // The player's own facts lead; the game's categories follow A to Z
    .sort(
      (a, b) => Number(b.title === CUSTOM_CATEGORY) - Number(a.title === CUSTOM_CATEGORY) || compare(a.title, b.title),
    );

  return { summary, categories };
}
