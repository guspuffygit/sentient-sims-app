import { describe, expect, it } from 'vitest';
import { dossierToFacts, factKey } from 'main/sentient-sims/pipeline/facts/dossierFacts';
import { canSupersede, FactPredicate, isSingleValued } from 'main/sentient-sims/pipeline/facts/predicates';
import { familyBitWords, renderKnownFacts } from 'main/sentient-sims/util/renderKnownFacts';
import { friendshipWord, relationshipWords, romanceWord } from 'main/sentient-sims/util/relationshipWords';
import { SimDossier } from 'main/sentient-sims/models/SimDossier';

describe('dossier to facts', () => {
  const dossier: SimDossier = {
    sim_id: '100',
    name: 'Travis Scott',
    age: 'ELDER',
    gender: 'MALE',
    pronouns: {
      raw: 'They|them|their|theirs|themselves|',
      subjective: 'They',
      objective: 'them',
      possessive: 'their',
      possessive_independent: 'theirs',
      reflexive: 'themselves',
    },
    occult: { types: ['HUMAN', 'VAMPIRE'], current: ['HUMAN'] },
    is_ghost: false,
    household: { id: '900', name: 'BFF', member_ids: ['100', '200'] },
    family: { children: ['200'], parents: ['10', '11'], steady_ids: ['77'] },
    family_bits: { '200': 'family_Target_IsSonOrDaughterOf_Actor' },
    traits: ['trait_Geek'],
    fears: ['trait_Fear_Fire'],
    likes: ['trait_SimPreference_Likes_Music_HipHop'],
    careers: [{ career: 'career_Adult_TechGuru', level: 4 }],
    top_skills: [
      { skill: 'Charisma', level: 5 },
      { skill: 'Fitness', level: 1 },
    ],
    relationships: [
      { sim_id: '200', name: 'Mackenzie', has_met: true, friendship: 100 },
      { sim_id: '300', name: 'Stranger', has_met: false },
    ],
  };

  const facts = dossierToFacts(dossier);
  const has = (predicate: string, objectText?: string, objectSimId?: string) =>
    facts.some(
      (fact) =>
        fact.predicate === predicate &&
        (objectText === undefined || fact.objectText === objectText) &&
        (objectSimId === undefined || fact.objectSimId === objectSimId),
    );

  it('derives attributes and edges', () => {
    expect(has(FactPredicate.AGE_STAGE, 'ELDER')).toBe(true);
    expect(has(FactPredicate.PRONOUNS, 'They/them')).toBe(true);
    expect(has(FactPredicate.OCCULT, 'VAMPIRE')).toBe(true);
    expect(has(FactPredicate.OCCULT_CURRENT, 'HUMAN')).toBe(true);
    expect(has(FactPredicate.ALIVE, 'yes')).toBe(true);
    expect(has(FactPredicate.PARENT, undefined, '10')).toBe(true);
    expect(has(FactPredicate.CHILD, undefined, '200')).toBe(true);
    expect(has(FactPredicate.STEADY, undefined, '77')).toBe(true);
    expect(has(FactPredicate.FAMILY_BIT, 'family_Target_IsSonOrDaughterOf_Actor', '200')).toBe(true);
    expect(has(FactPredicate.HOUSEHOLD_MEMBER, undefined, '200')).toBe(true);
    expect(has(FactPredicate.FEAR, 'trait_Fear_Fire')).toBe(true);
  });

  it('puts the career level inside the claim so a promotion reads as a change', () => {
    expect(has(FactPredicate.JOB, 'career_Adult_TechGuru (level 4)')).toBe(true);
    const promoted = dossierToFacts({ ...dossier, careers: [{ career: 'career_Adult_TechGuru', level: 5 }] });
    expect(promoted.some((fact) => fact.objectText === 'career_Adult_TechGuru (level 5)')).toBe(true);
  });

  it('never turns a relationship score into a fact', () => {
    // Scores drift every few game minutes; a fact row would either churn or go stale
    expect(facts.some((fact) => (fact.objectText ?? '').includes('100'))).toBe(false);
    expect(has(FactPredicate.KNOWS, undefined, '200')).toBe(true);
    // ...and someone never met is not someone the sim knows
    expect(has(FactPredicate.KNOWS, undefined, '300')).toBe(false);
  });

  it('drops the sim from its own household membership and skips trivial skills', () => {
    expect(has(FactPredicate.HOUSEHOLD_MEMBER, undefined, '100')).toBe(false);
    expect(facts.some((fact) => (fact.objectText ?? '').startsWith('Fitness'))).toBe(false);
    expect(facts.some((fact) => (fact.objectText ?? '').startsWith('Charisma'))).toBe(true);
  });

  it('de-duplicates claims the dossier makes twice', () => {
    const keys = facts.map(factKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('reports a ghost as not alive', () => {
    const ghost = dossierToFacts({ ...dossier, is_ghost: true, death_type: 'OLD_AGE' });
    expect(ghost.some((fact) => fact.predicate === FactPredicate.ALIVE && fact.objectText === 'no')).toBe(true);
    expect(ghost.some((fact) => fact.predicate === FactPredicate.DEATH_TYPE)).toBe(true);
  });
});

describe('fact trust rules', () => {
  it('never lets hearsay retire the game', () => {
    expect(canSupersede('told', 'game')).toBe(false);
    expect(canSupersede('inferred', 'game')).toBe(false);
    expect(canSupersede('reflection', 'game')).toBe(false);
    expect(canSupersede('player', 'game')).toBe(false);
    expect(canSupersede('game', 'told')).toBe(true);
    expect(canSupersede('game', 'game')).toBe(true);
  });

  it('knows which predicates a sim can only have one of', () => {
    expect(isSingleValued(FactPredicate.SPOUSE)).toBe(true);
    expect(isSingleValued(FactPredicate.AGE_STAGE)).toBe(true);
    // Two parents is the normal case, not a contradiction
    expect(isSingleValued(FactPredicate.PARENT)).toBe(false);
    expect(isSingleValued(FactPredicate.TRAIT)).toBe(false);
    expect(isSingleValued(FactPredicate.STEADY)).toBe(false);
  });
});

describe('relationship words', () => {
  it('keeps the bands the tick prompt has always used', () => {
    expect(friendshipWord(50)).toBe('a good friend');
    expect(friendshipWord(49)).toBe('a friend');
    expect(friendshipWord(15)).toBe('a friend');
    expect(friendshipWord(14)).toBe('an acquaintance');
    expect(friendshipWord(-15)).toBe('on bad terms with you');
    expect(romanceWord(40)).toBe('romantic');
    expect(romanceWord(10)).toBe('a romantic spark');
    expect(romanceWord(9)).toBeUndefined();
  });

  it('drops transient social-context bits and keeps the lore ones', () => {
    const words = relationshipWords({
      hasMet: true,
      friendship: 60,
      romance: 45,
      bits: ['relbit_SocialContext_Awkwardness_Casual', 'bit_Married', 'relbit_Enemies'],
    });
    expect(words).toEqual(['a good friend', 'romantic', 'married', 'enemies']);
  });

  it('says a stranger is a stranger and nothing else', () => {
    expect(relationshipWords({ hasMet: false, friendship: 90 })).toEqual(['a stranger — chat to break the ice']);
  });
});

describe('KNOWN_FACTS rendering', () => {
  it('reads the family bit from the actor side', () => {
    expect(familyBitWords('family_Target_IsSonOrDaughterOf_Actor')).toBe('their child');
    expect(familyBitWords('family_Target_IsParentOf_Actor')).toBe('their parent');
    expect(familyBitWords('family_Target_IsCousinOf_Actor')).toBe('their cousin');
    // An unrecognized bit is rendered readably rather than dropped: a wrong-looking
    // label is debuggable, a missing one is not
    expect(familyBitWords('family_Something_New')).toContain('Something');
  });

  it('is empty when there is nothing to say, so prompts are unchanged', () => {
    expect(renderKnownFacts({ selfFacts: [], people: [], told: [], names: {} })).toBe('');
  });

  it('collapses list predicates into one line each', () => {
    const block = renderKnownFacts({
      selfFacts: [
        { predicate: FactPredicate.TRAIT, objectText: 'trait_Geek', source: 'game', confidence: 1 },
        { predicate: FactPredicate.TRAIT, objectText: 'trait_Outgoing', source: 'game', confidence: 1 },
        {
          predicate: FactPredicate.LIKES,
          objectText: 'trait_SimPreference_Likes_Music_HipHop',
          source: 'game',
          confidence: 1,
        },
      ],
      people: [],
      told: [],
      names: {},
    });
    expect(block).toContain('your personality: Geek, Outgoing');
    expect(block).toContain('you like: Music Hip Hop');
  });

  it('flags hearsay as possibly untrue and attributes it', () => {
    const block = renderKnownFacts({
      selfFacts: [{ predicate: FactPredicate.AGE_STAGE, objectText: 'ADULT', source: 'game', confidence: 1 }],
      people: [],
      told: [{ text: 'spouse: Nancy', saidBy: 'Nancy', confidence: 0.4 }],
      names: {},
    });
    expect(block).toContain('Recently learned (may not be true):');
    expect(block).toContain('(said by Nancy)');
  });

  it('trims from the end so self facts survive a tight budget', () => {
    const block = renderKnownFacts({
      selfFacts: [{ predicate: FactPredicate.AGE_STAGE, objectText: 'ADULT', source: 'game', confidence: 1 }],
      people: [],
      told: [{ text: 'a very long piece of hearsay '.repeat(20), confidence: 0.4 }],
      names: {},
      maxChars: 60,
    });
    expect(block).toContain('you are an adult');
    expect(block).not.toContain('hearsay');
  });
});
