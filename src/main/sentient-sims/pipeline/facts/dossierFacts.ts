// One dossier from the mod -> the set of `game` facts it asserts. Pure, so the mapping
// is testable without a database and so the diff in SemanticMemoryService is a set
// comparison rather than a pile of special cases.
//
// What is deliberately NOT a fact: relationship scores. A friendship bar is a number that
// drifts every few game minutes; turning it into a fact row would either churn the table
// or freeze a stale value into a sim's beliefs. Scores stay in sim_dossier.json and are
// rendered live into <KNOWN_FACTS> through the same word bands the tick prompt uses.

import { SimDossier } from '../../models/SimDossier';
import { FactPredicate } from './predicates';

export type DerivedFact = {
  predicate: string;
  objectText?: string;
  objectSimId?: string;
};

// Identity of a fact for diffing: two facts are the same claim if subject (implied),
// predicate and object all match.
export function factKey(fact: { predicate: string; objectText?: string; objectSimId?: string }): string {
  return `${fact.predicate}\u0000${fact.objectSimId ?? ''}\u0000${fact.objectText ?? ''}`;
}

export type DossierToFactsOptions = {
  // The species the app has learned for a sim from the state report (DOG, CAT, ...),
  // undefined for a person or an unknown. The dossier lists a pet as a bare household
  // member id and never says what it is, so this lookup is what turns "you live with
  // Bosun" into "your dog Bosun".
  speciesOf?: (simId: string) => string | undefined;
};

export function dossierToFacts(dossier: SimDossier, options: DossierToFactsOptions = {}): DerivedFact[] {
  const facts: DerivedFact[] = [];
  const speciesOf = (simId: string) =>
    dossier.species && simId === dossier.sim_id ? dossier.species : options.speciesOf?.(simId);
  const add = (predicate: string, objectText?: string, objectSimId?: string) => {
    if (!objectText && !objectSimId) {
      return;
    }
    facts.push({ predicate, objectText, objectSimId });
  };

  add(FactPredicate.AGE_STAGE, dossier.age);
  add(FactPredicate.GENDER, dossier.gender);
  if (dossier.pronouns?.subjective) {
    const p = dossier.pronouns;
    add(FactPredicate.PRONOUNS, `${p.subjective}/${p.objective}`);
  }
  // The game files a pet's occult as HUMAN, which is the one thing a dog is not. A sim
  // with a species gets its species instead and no human occult at all.
  const isPet = Boolean(speciesOf(dossier.sim_id));
  const notHumanIfPet = (occult: string) => !(isPet && occult.toUpperCase() === 'HUMAN');
  for (const occult of (dossier.occult?.types ?? []).filter(notHumanIfPet)) {
    add(FactPredicate.OCCULT, occult);
  }
  // The form they are in right now is single-valued and can change (a vampire in human
  // form); the set of forms they ARE is multi-valued and rarely changes.
  const current = (dossier.occult?.current ?? []).filter(notHumanIfPet);
  if (current.length > 0) {
    add(FactPredicate.OCCULT_CURRENT, current.join('+'));
  }
  add(FactPredicate.ALIVE, dossier.is_ghost ? 'no' : 'yes');
  if (dossier.death_type) {
    add(FactPredicate.DEATH_TYPE, dossier.death_type);
  }
  // A species fact is kept in the derived set so the diff below does not retire it: it
  // is game truth that reached the store by way of the state report, not the dossier.
  add(FactPredicate.SPECIES, speciesOf(dossier.sim_id));
  if (dossier.household?.name || dossier.household?.id) {
    add(FactPredicate.HOUSEHOLD, dossier.household.name || dossier.household.id);
  }
  for (const memberId of dossier.household?.member_ids ?? []) {
    if (memberId !== dossier.sim_id) {
      add(FactPredicate.HOUSEHOLD_MEMBER, undefined, memberId);
      // A housemate with a species is the sim's pet. Only a person keeps pets, so a pet's
      // own dossier gets no pet edges to the people it lives with.
      if (speciesOf(memberId) && !speciesOf(dossier.sim_id)) {
        add(FactPredicate.PET, undefined, memberId);
      }
    }
  }

  const family = dossier.family ?? {};
  for (const id of family.parents ?? []) {
    add(FactPredicate.PARENT, undefined, id);
  }
  for (const id of family.children ?? []) {
    add(FactPredicate.CHILD, undefined, id);
  }
  for (const id of family.siblings ?? []) {
    add(FactPredicate.SIBLING, undefined, id);
  }
  for (const id of family.grandparents ?? []) {
    add(FactPredicate.GRANDPARENT, undefined, id);
  }
  if (family.spouse_id) {
    add(FactPredicate.SPOUSE, undefined, family.spouse_id);
  }
  if (family.fiance_id) {
    add(FactPredicate.FIANCE, undefined, family.fiance_id);
  }
  for (const id of family.steady_ids ?? []) {
    add(FactPredicate.STEADY, undefined, id);
  }
  // The game's own label for the relation, which is where step/in-law/half distinctions
  // live: the id lists above cannot express them.
  for (const [otherId, bit] of Object.entries(dossier.family_bits ?? {})) {
    add(FactPredicate.FAMILY_BIT, bit, otherId);
  }

  for (const trait of dossier.traits ?? []) {
    add(FactPredicate.TRAIT, trait);
  }
  for (const fear of dossier.fears ?? []) {
    add(FactPredicate.FEAR, fear);
  }
  for (const like of dossier.likes ?? []) {
    add(FactPredicate.LIKES, like);
  }
  for (const dislike of dossier.dislikes ?? []) {
    add(FactPredicate.DISLIKES, dislike);
  }
  if (dossier.aspiration?.track) {
    add(FactPredicate.ASPIRATION, dossier.aspiration.track);
  }
  for (const career of dossier.careers ?? []) {
    if (career.career) {
      // The level is part of the claim: a promotion should read as a new fact and retire
      // the old one, which is exactly what a diff over this string does.
      add(FactPredicate.JOB, career.level ? `${career.career} (level ${career.level})` : career.career);
    }
  }
  // Only skills a sim would actually mention. Level 1 in everything is noise.
  for (const skill of dossier.top_skills ?? []) {
    if (skill.skill && (skill.level ?? 0) >= 3) {
      add(FactPredicate.SKILL, `${skill.skill} (level ${skill.level})`);
    }
  }
  // Who they have met at all. The strength of it is a live score, not a fact.
  for (const edge of dossier.relationships ?? []) {
    if (edge.has_met) {
      add(FactPredicate.KNOWS, undefined, edge.sim_id);
    }
  }

  // De-duplicate: family_bits and the id lists overlap by design, and a dossier can name
  // the same person twice (a household member who is also a child).
  const seen = new Set<string>();
  return facts.filter((fact) => {
    const key = factKey(fact);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Names the app can render without a database round trip: the dossier already carries
// the name of everyone the sim knows.
export function dossierNames(dossier: SimDossier): Record<string, string> {
  const names: Record<string, string> = {};
  if (dossier.name) {
    names[dossier.sim_id] = dossier.name;
  }
  for (const edge of dossier.relationships ?? []) {
    if (edge.name) {
      names[edge.sim_id] = edge.name;
    }
  }
  return names;
}
