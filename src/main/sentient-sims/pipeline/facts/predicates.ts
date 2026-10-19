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
  // Free text the player wants the sim to always know ("Bosun is your dog"). Rendered
  // into <KNOWN_FACTS> exactly as written, so it is the one predicate with no vocabulary
  // of its own. First in the list because it is the one a player reaches for most.
  NOTE: 'note',
  AGE_STAGE: 'age_stage',
  GENDER: 'gender',
  PRONOUNS: 'pronouns',
  OCCULT: 'occult',
  OCCULT_CURRENT: 'occult_current',
  ALIVE: 'alive',
  DEATH_TYPE: 'death_type',
  // The game's Species name for a pet (DOG, CAT, SMALLDOG, FOX, HORSE). Learned from the
  // state report, not the dossier, which never says what kind of creature a sim is.
  SPECIES: 'species',
  HOUSEHOLD: 'household',
  TRAIT: 'trait',
  // A reward trait: earned from an aspiration (Business Savvy), a childhood (Top-Notch
  // Infant) or a child's skills (Headstrong). Stays with the sim for life.
  REWARD_TRAIT: 'reward_trait',
  // A childhood phase (Clingy, Rebellious) or a child's confidence level: what a child
  // is going through right now rather than who they are
  PHASE: 'phase',
  FEAR: 'fear',
  LIKES: 'likes',
  DISLIKES: 'dislikes',
  ASPIRATION: 'aspiration',
  JOB: 'job',
  // A business the sim owns: the name, with the kind after it unless it is a small
  // business ('Vale Curios', 'Chez Vale (restaurant)')
  BUSINESS: 'business',
  SKILL: 'skill',
  // edges
  HOUSEHOLD_MEMBER: 'household_member',
  // A household member with a species: the sim's dog, cat, fox or horse. Derived, never
  // reported - the dossier lists a pet as just another member id, which is how a sim
  // came to treat the family dog as a person (Anker and Bosun, 2026-10-12).
  PET: 'pet',
  PARENT: 'parent',
  CHILD: 'child',
  SIBLING: 'sibling',
  GRANDPARENT: 'grandparent',
  SPOUSE: 'spouse',
  FIANCE: 'fiance',
  STEADY: 'steady',
  // A former partner: the game's romantic-Broken_Up / romantic-Divorced bit on the
  // relationship. objectText carries which ('broke up', 'divorced').
  EX_PARTNER: 'ex_partner',
  FAMILY_BIT: 'family_bit',
  KNOWS: 'knows',
} as const;

export type FactPredicate = (typeof FactPredicate)[keyof typeof FactPredicate];

export const EDGE_PREDICATES: ReadonlySet<string> = new Set([
  FactPredicate.HOUSEHOLD_MEMBER,
  FactPredicate.PET,
  FactPredicate.PARENT,
  FactPredicate.CHILD,
  FactPredicate.SIBLING,
  FactPredicate.GRANDPARENT,
  FactPredicate.SPOUSE,
  FactPredicate.FIANCE,
  FactPredicate.STEADY,
  FactPredicate.EX_PARTNER,
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
  FactPredicate.SPECIES,
  FactPredicate.HOUSEHOLD,
  FactPredicate.ASPIRATION,
  FactPredicate.SPOUSE,
  FactPredicate.FIANCE,
]);

const KNOWN_PREDICATES: ReadonlySet<string> = new Set(Object.values(FactPredicate));

// What each predicate means, in the player's words. Served with the vocabulary so the
// Facts dialog can explain a row without hardcoding the list, and kept here because the
// meaning of "household" is a fact about how the mod reads the game, not about the UI.
export const FACT_PREDICATE_HELP: Record<FactPredicate, string> = {
  note:
    'Anything you want this Sim to always know. Write it to the Sim, like "Bosun is your dog" or ' +
    '"You grew up in Brindleton Bay". It goes into every prompt exactly as written.',
  age_stage: 'The life stage the game has the Sim in: infant, toddler, child, teen, young adult, adult or elder.',
  gender: 'Male or female, as set in Create a Sim.',
  pronouns: 'How the Sim is referred to (he/him, she/her, they/them). Other Sims use these when talking about them.',
  occult:
    'Every occult type this Sim is: vampire, spellcaster, werewolf, mermaid, alien, fairy... Human is listed too.',
  occult_current: 'The form the Sim is in right now. A vampire in human form shows HUMAN here.',
  alive: 'yes, or no for a ghost.',
  death_type: 'How the Sim died, if they are a ghost.',
  species:
    'Which animal this Sim is: dog, cat, small dog, fox or horse. People have no species entry. ' +
    'Learned from the game while the pet is on the lot.',
  household:
    'The name of the household this Sim belongs to, as shown in Manage Worlds (for example "Calloway"). ' +
    'It is the family name on the mailbox, not a list of who lives there - see "household member" for the people.',
  trait: 'A personality trait from Create a Sim, like Cheerful or Loner.',
  reward_trait:
    "A trait the Sim earned and keeps: from an aspiration, from a well-raised childhood, or from a child's skills.",
  phase: 'What a child is going through right now: a childhood phase like Clingy, or their confidence level.',
  fear: 'A fear the Sim has picked up, like a fear of fire.',
  likes: 'Something the Sim likes: a colour, a music genre, an activity or a decor style.',
  dislikes: 'Something the Sim dislikes: a colour, a music genre, an activity or a decor style.',
  aspiration: 'The life goal the Sim is working towards.',
  job: 'The career the Sim is in, its branch once they have picked one, and their level. Not the job title.',
  business: 'A business the Sim owns: a small business, retail store, restaurant or vet clinic.',
  skill: 'A skill the Sim is good at (level 3 or higher).',
  household_member: 'Someone who lives in the same home as this Sim, people and pets alike.',
  pet: 'An animal that lives with this Sim. The Sim knows it as their dog, cat, fox or horse, not as a person.',
  parent: 'A parent of this Sim, from the family tree.',
  child: 'A child of this Sim, from the family tree.',
  sibling: 'A brother or sister of this Sim, from the family tree.',
  grandparent: 'A grandparent of this Sim, from the family tree.',
  spouse: 'The Sim this Sim is married to.',
  fiance: 'The Sim this Sim is engaged to.',
  steady: 'The Sim this Sim is in a committed relationship with (boyfriend or girlfriend).',
  ex_partner: 'A Sim this Sim used to be with: broken up or divorced.',
  family_bit:
    "The game's exact label for a family relationship. This is where step-, half- and in-law relations show up.",
  knows: 'Someone this Sim has met at least once.',
};

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
