// The fact vocabulary. One predicate = one kind of claim about a sim, and the same
// string is what the store, the routes, the MCP provenance tools and the UI all use.
//
// A fact with an objectSimId is an EDGE (the table is a property graph); a fact with
// only objectText is an attribute. Which predicates are edges is fixed here rather than
// inferred from the row, so a malformed insert is a bug at the boundary and not a
// silently orphaned edge.

// A const object rather than a TS enum: predicates travel as plain strings through the
// database, the HTTP routes and the MCP tools, and an enum would make every comparison
// against one of those strings a lint error (or worse, a silent type-only distinction).
export const FactPredicate = {
  // attributes
  AGE_STAGE: 'age_stage',
  GENDER: 'gender',
  PRONOUNS: 'pronouns',
  OCCULT: 'occult',
  OCCULT_CURRENT: 'occult_current',
  ALIVE: 'alive',
  DEATH_TYPE: 'death_type',
  HOUSEHOLD: 'household',
  TRAIT: 'trait',
  FEAR: 'fear',
  LIKES: 'likes',
  DISLIKES: 'dislikes',
  ASPIRATION: 'aspiration',
  JOB: 'job',
  SKILL: 'skill',
  // edges
  HOUSEHOLD_MEMBER: 'household_member',
  PARENT: 'parent',
  CHILD: 'child',
  SIBLING: 'sibling',
  GRANDPARENT: 'grandparent',
  SPOUSE: 'spouse',
  FIANCE: 'fiance',
  STEADY: 'steady',
  FAMILY_BIT: 'family_bit',
  KNOWS: 'knows',
} as const;

export type FactPredicate = (typeof FactPredicate)[keyof typeof FactPredicate];

export const EDGE_PREDICATES: ReadonlySet<string> = new Set([
  FactPredicate.HOUSEHOLD_MEMBER,
  FactPredicate.PARENT,
  FactPredicate.CHILD,
  FactPredicate.SIBLING,
  FactPredicate.GRANDPARENT,
  FactPredicate.SPOUSE,
  FactPredicate.FIANCE,
  FactPredicate.STEADY,
  FactPredicate.FAMILY_BIT,
  FactPredicate.KNOWS,
]);

// A sim has exactly one of each of these at a time, so a new value RETIRES the old one
// rather than sitting beside it. Everything else is multi-valued: a sim has many traits,
// many likes, many siblings, and learning a new one says nothing about the others.
//
// spouse and fiance are single-valued in the base game. Steady is not (the game models it
// as a set), and neither is parent: two parents is the normal case, not a contradiction.
export const SINGLE_VALUED_PREDICATES: ReadonlySet<string> = new Set([
  FactPredicate.AGE_STAGE,
  FactPredicate.GENDER,
  FactPredicate.PRONOUNS,
  FactPredicate.OCCULT_CURRENT,
  FactPredicate.ALIVE,
  FactPredicate.DEATH_TYPE,
  FactPredicate.HOUSEHOLD,
  FactPredicate.ASPIRATION,
  FactPredicate.SPOUSE,
  FactPredicate.FIANCE,
]);

const KNOWN_PREDICATES: ReadonlySet<string> = new Set(Object.values(FactPredicate));

export function isKnownPredicate(value: unknown): value is FactPredicate {
  return typeof value === 'string' && KNOWN_PREDICATES.has(value);
}

export function isEdgePredicate(predicate: string): boolean {
  return EDGE_PREDICATES.has(predicate);
}

export function isSingleValued(predicate: string): boolean {
  return SINGLE_VALUED_PREDICATES.has(predicate);
}

// Where a fact came from, in descending order of how much it is trusted. `game` is the
// game's own API by way of the dossier and always wins; `player` is a human typing into
// the Facts dialog; `told` is something a sim was told in conversation (which may be a
// lie, and is stored as such); `inferred` and `reflection` are the model's own reading of
// a memory.
export const FACT_SOURCES = ['game', 'player', 'told', 'inferred', 'reflection'] as const;
export type FactSource = (typeof FACT_SOURCES)[number];

const SOURCE_RANK: Record<FactSource, number> = {
  game: 4,
  player: 3,
  reflection: 2,
  told: 1,
  inferred: 1,
};

// Can a fact from `incoming` retire a current fact from `existing`? Nothing a sim was
// told or a model inferred may ever retire a game fact - that rule is the whole point of
// the store, and it is enforced here rather than at each call site.
export function canSupersede(incoming: FactSource, existing: FactSource): boolean {
  return SOURCE_RANK[incoming] >= SOURCE_RANK[existing];
}

export function isKnownSource(value: unknown): value is FactSource {
  return typeof value === 'string' && (FACT_SOURCES as readonly string[]).includes(value);
}
