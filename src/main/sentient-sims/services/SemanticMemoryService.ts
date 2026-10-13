import log from 'electron-log';
import { SimFactRecord, SimFactRepository } from '../db/SimFactRepository';
import { SimDossier } from '../models/SimDossier';
import { SimStateReport } from '../models/SimStateReport';
import { dossierNames, dossierToFacts, factKey } from '../pipeline/facts/dossierFacts';
import { canSupersede, FactPredicate, FactSource, isSingleValued } from '../pipeline/facts/predicates';
import { MAX_LIFE_PEOPLE, renderKnownFacts } from '../util/renderKnownFacts';

export type AddFactInput = {
  subjectSimId: string;
  predicate: string;
  objectText?: string;
  objectSimId?: string;
  source: FactSource;
  confidence?: number;
  provenanceMemoryId?: string;
  day?: number;
};

export type RecallOptions = {
  mentionedSimIds?: string[];
  // Free text the sim is about to read (its briefing, the lines so far): anyone the
  // dossier knows by name who appears in it is treated as mentioned. A briefing named
  // Adrian, the life list had no room for him, and the block's "the facts are right"
  // rule made the sim conclude there was no Adrian in her life (live 2026-09-23).
  mentionedText?: string;
  today?: number;
  maxChars?: number;
};

// The ids of every dossier relationship whose full name appears in the text, whole words
// only so "Al" does not match "Alice". Nothing fancy: the text is a prompt this sim is
// about to read, and a person named in it deserves their fact line more than a friend
// picked by score.
export function namesInText(dossier: SimDossier | undefined, text?: string): string[] {
  if (!text || !dossier) {
    return [];
  }
  const found: string[] = [];
  for (const edge of dossier.relationships ?? []) {
    if (!edge.name || edge.name.trim().length < 2) {
      continue;
    }
    const escaped = edge.name
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\s+/g, '\\s+');
    if (new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, 'iu').test(text)) {
      found.push(edge.sim_id);
    }
  }
  return found;
}

// Everyone the game ties this sim to by blood or partnership. These never need a score to
// earn their place in the facts block.
const FAMILY_AND_PARTNER_PREDICATES: ReadonlySet<string> = new Set([
  FactPredicate.PARENT,
  FactPredicate.CHILD,
  FactPredicate.SIBLING,
  FactPredicate.GRANDPARENT,
  FactPredicate.SPOUSE,
  FactPredicate.FIANCE,
  FactPredicate.STEADY,
  // The family dog belongs in a sim's life as surely as a sibling does
  FactPredicate.PET,
]);

// Single-valued facts about WHO a sim is. A new value for one of these is not a detail
// changing, it is the character changing: an age-up, a gender change, a transformation, a
// death. The stored character description was written from the old answer and is now
// wrong, which is what fix B watches these for.
const IDENTITY_PREDICATES: ReadonlySet<string> = new Set([
  FactPredicate.AGE_STAGE,
  FactPredicate.GENDER,
  FactPredicate.OCCULT_CURRENT,
  FactPredicate.ALIVE,
]);

// The bands relationshipWords already uses: 15 is "a friend", 10 is a romantic spark.
const LIFE_FRIENDSHIP_FLOOR = 15;
const LIFE_ROMANCE_FLOOR = 10;
const LIFE_FRIEND_COUNT = 10;

const DEFAULT_CONFIDENCE: Record<FactSource, number> = {
  game: 1,
  player: 0.9,
  reflection: 0.6,
  told: 0.4,
  inferred: 0.4,
};

/**
 * The hippocampus (Phase 3.1). Owns the semantic fact store: ingests the mod's dossier as
 * ground truth, accepts facts from elsewhere at lower trust, and renders what a sim knows
 * into <KNOWN_FACTS> for the prompt.
 *
 * The rule that gives the whole thing its value: a fact the sim was TOLD never overrides
 * what the game says. A player can walk up and claim to be someone's mother; that gets
 * stored, with its source and low confidence, and the real mother still appears in the
 * facts block.
 */
export class SemanticMemoryService {
  private readonly facts: SimFactRepository;

  private readonly namesFor: (simIds: string[]) => Record<string, string>;

  constructor(facts: SimFactRepository, namesFor: (simIds: string[]) => Record<string, string>) {
    this.facts = facts;
    this.namesFor = namesFor;
  }

  isLoaded(): boolean {
    return this.facts.isLoaded();
  }

  /**
   * Reconcile one sim's `game` facts against a fresh dossier. Returns what changed.
   *
   * The diff runs on every dossier. A zone load and a sleep push re-send unconditionally,
   * and the diff over the fact keys is what keeps an unchanged dossier from adding rows.
   */
  ingestDossier(
    dossier: SimDossier,
    options: { day?: number } = {},
  ): {
    inserted: number;
    retired: number;
    // True when no fact was added or retired.
    skipped: boolean;
    // Single-valued facts about WHO the sim is that replaced a previous game fact: an
    // age-up, a gender change, a transformation, a death. A first ingest changes nothing,
    // however much it inserts - there was no previous answer to contradict.
    identityChanged: string[];
  } {
    if (!this.isLoaded() || !dossier.sim_id) {
      return { inserted: 0, retired: 0, skipped: true, identityChanged: [] };
    }
    const simId = dossier.sim_id;
    const day = options.day;

    const derived = dossierToFacts(dossier, { speciesOf: (id) => this.speciesFor(id) });
    const derivedKeys = new Set(derived.map(factKey));
    const current = this.facts.getCurrentFacts(simId).filter((fact) => fact.source === 'game');
    const currentKeys = new Map(current.map((fact) => [factKey(fact), fact]));

    let inserted = 0;
    let retired = 0;
    const identityChanged: string[] = [];
    for (const fact of derived) {
      if (currentKeys.has(factKey(fact))) {
        continue;
      }
      // A new answer to a question the store already had an answer to. Checked before
      // the insert, while "what the game used to say" is still readable.
      if (
        IDENTITY_PREDICATES.has(fact.predicate) &&
        current.some((existing) => existing.predicate === fact.predicate)
      ) {
        identityChanged.push(fact.predicate);
      }
      const id = this.facts.insert({
        subjectSimId: simId,
        predicate: fact.predicate,
        objectText: fact.objectText,
        objectSimId: fact.objectSimId,
        source: 'game',
        confidence: DEFAULT_CONFIDENCE.game,
        validFromDay: day,
        createdAt: new Date().toISOString(),
      });
      inserted += 1;
      // A game fact retires whatever contradicted it, whoever said it. This is where a
      // told lie loses: it stays in the table with its valid_to_day set, so the Facts
      // dialog can still show that the sim was told it and when it stopped counting.
      if (isSingleValued(fact.predicate)) {
        retired += this.retireContradicting(simId, fact.predicate, fact.objectText, fact.objectSimId, id, day);
      }
    }
    // Facts the dossier no longer asserts: a divorce, a moved-out sibling, a dropped
    // trait. Retired, never deleted.
    for (const [key, fact] of currentKeys) {
      if (!derivedKeys.has(key) && fact.id !== undefined) {
        this.facts.invalidate(fact.id, day);
        retired += 1;
      }
    }

    // The scores inside may have moved even when no fact did, and the battery grades
    // against this json, so the stored dossier is always replaced.
    this.facts.saveDossier({
      simId,
      json: JSON.stringify(dossier),
      updatedDay: day,
      updatedAt: new Date().toISOString(),
    });
    return { inserted, retired, skipped: inserted === 0 && retired === 0, identityChanged };
  }

  /**
   * Learn what kind of creature each reported sim is. The state report is the only channel
   * that says species (self.species for a reported pet, species on a perceived one); the
   * dossier lists a pet as a bare household member id. Each new species becomes a `game`
   * fact on the pet and a `pet` edge from everyone it lives with, so the owner's facts
   * block says "your dog Bosun" rather than naming the dog beside the people.
   *
   * Runs on every report, so it must be cheap: one indexed read per sim that has a
   * species, which is the handful of pets on the lot, and writes only on first sight.
   */
  recordSpeciesFromReport(report: SimStateReport): number {
    if (!this.isLoaded()) {
      return 0;
    }
    const day = report.lot?.clock?.absolute_day;
    const seen = new Map<string, string>();
    for (const entry of report.sims ?? []) {
      if (entry.sim_id && entry.self?.species) {
        seen.set(entry.sim_id, entry.self.species);
      }
      for (const perceived of entry.sims) {
        if (perceived.sim_id && perceived.species && !seen.has(perceived.sim_id)) {
          seen.set(perceived.sim_id, perceived.species);
        }
      }
    }
    let learned = 0;
    for (const [simId, species] of seen) {
      try {
        if (this.recordSpecies(simId, species, day)) {
          learned += 1;
        }
      } catch (err) {
        log.error(`[Facts] could not record species for ${simId}`, err);
      }
    }
    return learned;
  }

  // One sim's species as a game fact, plus the pet edges it implies. Returns true when the
  // species was news to the store.
  recordSpecies(simId: string, species: string, day?: number): boolean {
    const normalized = species.trim().toUpperCase();
    if (!normalized || normalized === 'HUMAN') {
      return false;
    }
    const current = this.facts.getCurrentFacts(simId, { predicate: FactPredicate.SPECIES });
    if (current.some((fact) => fact.source === 'game' && fact.objectText === normalized)) {
      return false;
    }
    const id = this.facts.insert({
      subjectSimId: simId,
      predicate: FactPredicate.SPECIES,
      objectText: normalized,
      source: 'game',
      confidence: DEFAULT_CONFIDENCE.game,
      validFromDay: day,
      createdAt: new Date().toISOString(),
    });
    this.retireContradicting(simId, FactPredicate.SPECIES, normalized, undefined, id, day);
    // The pet's dossier, ingested before anyone knew it was a dog, filed it as a HUMAN
    // occult. Retired here so the Facts window stops calling the dog human the moment
    // the species is known; the next dossier ingest derives no human occult for a pet.
    for (const predicate of [FactPredicate.OCCULT, FactPredicate.OCCULT_CURRENT]) {
      for (const human of this.facts.getCurrentFacts(simId, { predicate })) {
        if (human.id !== undefined && human.source === 'game' && human.objectText?.toUpperCase() === 'HUMAN') {
          this.facts.invalidate(human.id, day, id);
        }
      }
    }
    // Everyone whose dossier lists this sim as a housemate now has a pet. The dossier is
    // not re-sent for this (nothing structural changed on the mod's side), so the edge is
    // written here; the next dossier ingest derives the same edge and keeps it.
    for (const edge of this.facts.getFactsMentioning(simId)) {
      if (edge.predicate !== FactPredicate.HOUSEHOLD_MEMBER || edge.source !== 'game') {
        continue;
      }
      const owner = edge.subjectSimId;
      if (this.speciesFor(owner)) {
        continue;
      }
      const already = this.facts
        .getCurrentFacts(owner, { about: simId, predicate: FactPredicate.PET })
        .some((fact) => fact.source === 'game');
      if (!already) {
        this.facts.insert({
          subjectSimId: owner,
          predicate: FactPredicate.PET,
          objectSimId: simId,
          source: 'game',
          confidence: DEFAULT_CONFIDENCE.game,
          validFromDay: day,
          createdAt: new Date().toISOString(),
        });
      }
    }
    return true;
  }

  // The species the store has for a sim (DOG, CAT, ...), from any source; undefined for a
  // person or a sim it knows nothing about.
  speciesFor(simId: string): string | undefined {
    if (!this.isLoaded() || !simId) {
      return undefined;
    }
    try {
      return this.facts.getCurrentFacts(simId, { predicate: FactPredicate.SPECIES }).at(-1)?.objectText;
    } catch {
      return undefined;
    }
  }

  // Species for a set of ids, for the facts dialog and the renderer. Only ids with one.
  speciesForIds(simIds: string[]): Record<string, string> {
    const species: Record<string, string> = {};
    for (const simId of new Set(simIds.filter(Boolean))) {
      const found = this.speciesFor(simId);
      if (found) {
        species[simId] = found;
      }
    }
    return species;
  }

  private retireContradicting(
    simId: string,
    predicate: string,
    objectText: string | undefined,
    objectSimId: string | undefined,
    supersededBy: number,
    day?: number,
  ): number {
    let retired = 0;
    for (const existing of this.facts.findContradicting(simId, predicate)) {
      if (existing.id === undefined || existing.id === supersededBy) {
        continue;
      }
      const sameObject = existing.objectText === objectText && existing.objectSimId === objectSimId;
      if (sameObject) {
        continue;
      }
      if (!canSupersede('game', existing.source)) {
        continue;
      }
      this.facts.invalidate(existing.id, day, supersededBy);
      retired += 1;
    }
    return retired;
  }

  /**
   * Store one fact from somewhere other than the game. Returns the new row id, or
   * undefined when the fact was refused (a lower-trust source contradicting a game fact
   * is still stored, but it never retires the game fact).
   */
  addFact(input: AddFactInput): number | undefined {
    if (!this.isLoaded() || !input.subjectSimId || !input.predicate) {
      return undefined;
    }
    const confidence = input.confidence ?? DEFAULT_CONFIDENCE[input.source];
    const id = this.facts.insert({
      subjectSimId: input.subjectSimId,
      predicate: input.predicate,
      objectText: input.objectText,
      objectSimId: input.objectSimId,
      source: input.source,
      confidence,
      validFromDay: input.day,
      provenanceMemoryId: input.provenanceMemoryId,
      createdAt: new Date().toISOString(),
    });
    if (isSingleValued(input.predicate)) {
      for (const existing of this.facts.findContradicting(input.subjectSimId, input.predicate)) {
        if (existing.id === undefined || existing.id === id) {
          continue;
        }
        const sameObject = existing.objectText === input.objectText && existing.objectSimId === input.objectSimId;
        if (sameObject || !canSupersede(input.source, existing.source)) {
          continue;
        }
        this.facts.invalidate(existing.id, input.day, id);
      }
    }
    return id;
  }

  invalidateFact(id: number, day?: number) {
    if (this.isLoaded()) {
      this.facts.invalidate(id, day);
    }
  }

  /**
   * Change the wording of a fact somebody entered. Invalidate-never-delete still holds:
   * the old row is retired and points at the new one, so the history shows what was
   * believed before the edit. Returns the new row id, or undefined when the fact does not
   * exist, belongs to another sim, or came from the game.
   */
  editFact(
    subjectSimId: string,
    factId: number,
    changes: { objectText?: string; objectSimId?: string },
    day?: number,
  ): number | undefined {
    if (!this.isLoaded()) {
      return undefined;
    }
    const existing = this.facts.getFact(factId);
    if (!existing || existing.subjectSimId !== subjectSimId || existing.source === 'game') {
      return undefined;
    }
    const id = this.facts.insert({
      subjectSimId,
      predicate: existing.predicate,
      objectText: changes.objectText ?? existing.objectText,
      objectSimId: changes.objectSimId ?? existing.objectSimId,
      source: existing.source,
      confidence: existing.confidence,
      validFromDay: day ?? existing.validFromDay,
      provenanceMemoryId: existing.provenanceMemoryId,
      createdAt: new Date().toISOString(),
    });
    this.facts.invalidate(factId, day, id);
    return id;
  }

  /**
   * What this sim knows, as a <KNOWN_FACTS> block. Empty string when there is nothing to
   * say, so a caller can concatenate it unconditionally and the prompt is byte-identical
   * to today's when the store is empty.
   */
  recall(simId: string, options: RecallOptions = {}): string {
    if (!this.isLoaded() || !simId) {
      return '';
    }
    try {
      const selfFacts = this.facts.getCurrentFacts(simId);
      if (selfFacts.length === 0) {
        return '';
      }
      const dossier = this.readDossier(simId);
      // The dossier speaks the mod's snake_case; the word bands are the app's camelCase.
      // Passing the raw edge through read every known sim as a stranger, because
      // relationshipWords saw hasMet undefined - caught by the KNOWN_FACTS test.
      const scores = new Map(
        (dossier?.relationships ?? []).map(
          (edge) =>
            [
              edge.sim_id,
              {
                hasMet: edge.has_met,
                friendship: edge.friendship,
                romance: edge.romance,
                bits: edge.bits,
              },
            ] as const,
        ),
      );

      const mentioned = [
        ...new Set([...(options.mentionedSimIds ?? []), ...namesInText(dossier, options.mentionedText)]),
      ].filter((id) => id && id !== simId);
      // The people who matter to this sim wherever they happen to be standing. A sim alone
      // in a scene had nobody in its prompt at all, so "who are you closest to" was
      // answered from nothing (live 2026-09-03).
      const lifeIds = this.lifePeopleIds(simId, selfFacts, dossier, new Set(mentioned));
      const names = { ...dossierNames(dossier ?? { sim_id: simId }) };
      // Housemates are named in the household line whether or not they made a people
      // section, and a pet's name lives in the participant table, not the dossier
      const housemates = selfFacts
        .filter((fact) => fact.predicate === FactPredicate.HOUSEHOLD_MEMBER || fact.predicate === FactPredicate.PET)
        .map((fact) => fact.objectSimId as string);
      const missing = [...mentioned, ...lifeIds, ...housemates].filter((id) => id && !names[id]);
      if (missing.length > 0) {
        Object.assign(names, this.namesFor(missing));
      }
      const species = this.speciesForIds([simId, ...mentioned, ...lifeIds, ...housemates]);

      const describe = (otherId: string) => ({
        simId: otherId,
        name: names[otherId],
        facts: selfFacts.filter((fact) => fact.objectSimId === otherId),
        relationship: scores.get(otherId),
        pronouns: this.pronounsFor(otherId),
      });
      const people = mentioned.map(describe);
      const lifePeople = lifeIds.map(describe);

      // Hearsay is rendered separately and flagged as possibly untrue. Attribution comes
      // from the memory the fact was extracted from, which H3's encoder fills in; until
      // then a told fact simply carries no speaker rather than a fabricated one.
      const told = this.facts.getRecentTold(simId, 3).map((fact) => ({
        text: this.tellingLine(fact, names),
        saidBy: this.speakerFor(fact),
        confidence: fact.confidence,
      }));

      return renderKnownFacts({
        // Every fact, edges included: the renderer drops an edge it has already described
        // in a people section, and it needs the whole set to state what is ABSENT.
        selfFacts,
        people,
        lifePeople,
        told,
        names,
        species,
        // Absence is only worth stating when the game's record of this sim was actually
        // read. No dossier row means no records, which is not the same as empty ones.
        hasDossier: Boolean(dossier),
        maxChars: options.maxChars,
      });
    } catch (err) {
      log.error('Failed to build KNOWN_FACTS', err);
      return '';
    }
  }

  /**
   * How to refer to somebody else: their own pronouns if the game has them, otherwise the
   * ones their gender implies.
   *
   * Read from THEIR fact rows, not from the sim doing the recalling - gender is a fact
   * about a sim, never an edge, so nothing in the speaker's own rows knows it. Without
   * this the facts block named people and left their gender to be guessed from the name,
   * and a sim called a male housemate "she" (live 2026-09-03).
   */
  // 'm'/'f' for everyone this dossier names, for the battery's gendered role claims. Reads
  // the same pronouns the prompts use, so the grader and the prompt can never disagree
  // about who someone is.
  gendersFor(simIds: string[]): Record<string, 'm' | 'f'> {
    const genders: Record<string, 'm' | 'f'> = {};
    for (const simId of simIds) {
      const pronouns = this.pronounsFor(simId);
      if (pronouns === 'he/him') {
        genders[simId] = 'm';
      } else if (pronouns === 'she/her') {
        genders[simId] = 'f';
      }
    }
    return genders;
  }

  private pronounsFor(simId: string): string | undefined {
    try {
      const facts = this.facts.getCurrentFacts(simId);
      const stated = facts.find((fact) => fact.predicate === FactPredicate.PRONOUNS)?.objectText;
      if (stated) {
        return stated.toLowerCase();
      }
      const gender = facts.find((fact) => fact.predicate === FactPredicate.GENDER)?.objectText?.toUpperCase();
      if (gender === 'MALE') {
        return 'he/him';
      }
      if (gender === 'FEMALE') {
        return 'she/her';
      }
      return undefined;
    } catch {
      // A sim the store has never heard of simply goes unlabelled
      return undefined;
    }
  }

  /**
   * Who belongs in "People in your life": everyone the game ties this sim to by family or
   * partnership, then the closest few friends and the one strongest romance.
   *
   * Family first and unconditionally - a parent the sim never speaks to is still their
   * parent, and the friendship floor would drop them. The friend and romance thresholds
   * are the same bands relationshipWords uses, so nobody appears here described as an
   * acquaintance the prompt did not think worth mentioning.
   */
  private lifePeopleIds(
    simId: string,
    selfFacts: SimFactRecord[],
    dossier: SimDossier | undefined,
    exclude: Set<string>,
  ): string[] {
    const ids: string[] = [];
    const take = (id?: string) => {
      if (id && id !== simId && !exclude.has(id) && !ids.includes(id)) {
        ids.push(id);
      }
    };

    for (const fact of selfFacts) {
      if (FAMILY_AND_PARTNER_PREDICATES.has(fact.predicate)) {
        take(fact.objectSimId);
      }
    }

    const met = (dossier?.relationships ?? []).filter((edge) => edge.has_met);
    [...met]
      .filter((edge) => (edge.friendship ?? 0) >= LIFE_FRIENDSHIP_FLOOR)
      .sort((a, b) => (b.friendship ?? 0) - (a.friendship ?? 0))
      .slice(0, LIFE_FRIEND_COUNT)
      .forEach((edge) => {
        take(edge.sim_id);
      });
    const romance = [...met]
      .filter((edge) => Math.abs(edge.romance ?? 0) >= LIFE_ROMANCE_FLOOR)
      .sort((a, b) => Math.abs(b.romance ?? 0) - Math.abs(a.romance ?? 0))
      .at(0);
    take(romance?.sim_id);

    return ids.slice(0, MAX_LIFE_PEOPLE);
  }

  // Set by the caller that owns memory lookups; left unset the speaker is simply omitted.
  speakerLookup?: (memoryId: string) => string | undefined;

  private speakerFor(fact: SimFactRecord): string | undefined {
    if (!fact.provenanceMemoryId || !this.speakerLookup) {
      return undefined;
    }
    try {
      return this.speakerLookup(fact.provenanceMemoryId);
    } catch {
      return undefined;
    }
  }

  private tellingLine(fact: SimFactRecord, names: Record<string, string>): string {
    const object = fact.objectSimId ? (names[fact.objectSimId] ?? `sim ${fact.objectSimId}`) : (fact.objectText ?? '');
    return `${fact.predicate.replace(/_/g, ' ')}: ${object}`;
  }

  readDossier(simId: string): SimDossier | undefined {
    if (!this.isLoaded()) {
      return undefined;
    }
    const stored = this.facts.getDossier(simId);
    if (!stored) {
      return undefined;
    }
    try {
      return JSON.parse(stored.json) as SimDossier;
    } catch {
      return undefined;
    }
  }

  getCurrentFacts(simId: string, options: { about?: string } = {}): SimFactRecord[] {
    return this.isLoaded() ? this.facts.getCurrentFacts(simId, options) : [];
  }

  getHistory(simId: string): SimFactRecord[] {
    return this.isLoaded() ? this.facts.getHistory(simId) : [];
  }

  pathBetween(simA: string, simB: string, maxHops = 2): SimFactRecord[] {
    return this.isLoaded() ? this.facts.pathBetween(simA, simB, maxHops) : [];
  }

  getFact(id: number): SimFactRecord | undefined {
    return this.isLoaded() ? this.facts.getFact(id) : undefined;
  }

  // Who is named in a fact, for rendering and for the explain route. The participant
  // table is the first source, but a sim only gets a row there once a memory involves
  // them - and a fact about someone the sim has merely met can predate that. Their own
  // dossier knows the name, so it stands in rather than the route showing a bare id.
  namesForIds(simIds: string[]): Record<string, string> {
    const names = this.namesFor(simIds);
    for (const simId of simIds) {
      if (!names[simId]) {
        const name = this.readDossier(simId)?.name;
        if (name) {
          names[simId] = name;
        }
      }
    }
    return names;
  }

  // The family relationship word for one pair, used by the battery's graders.
  familyBitBetween(simId: string, otherId: string): string | undefined {
    if (!this.isLoaded()) {
      return undefined;
    }
    const bit = this.facts
      .getCurrentFacts(simId, { about: otherId })
      .find((fact) => fact.predicate === FactPredicate.FAMILY_BIT);
    return bit?.objectText;
  }
}
