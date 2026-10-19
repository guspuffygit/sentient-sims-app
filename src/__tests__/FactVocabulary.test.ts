import { describe, expect, it } from 'vitest';
import { dossierToFacts, exPartnerWords, factKey } from 'main/sentient-sims/pipeline/facts/dossierFacts';
import {
  canSupersede,
  FACT_PREDICATE_HELP,
  FactPredicate,
  isSingleValued,
} from 'main/sentient-sims/pipeline/facts/predicates';
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
    reward_traits: ['trait_Business_Savvy'],
    phases: ['trait_ChildhoodPhase_Clingy'],
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
      { sim_id: '400', name: 'Jake', has_met: true, friendship: 28, bits: ['HaveBeenRomantic', 'romantic-Broken_Up'] },
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
    // Reward traits and phases were sent and dropped until 2026-10-13
    expect(has(FactPredicate.REWARD_TRAIT, 'trait_Business_Savvy')).toBe(true);
    // Every reward the mod sends is kept, Top-Notch Infant included (it was once filtered
    // out by the descriptions' ignored flag, 2026-10-13)
    const infant = dossierToFacts({ sim_id: '1', reward_traits: ['trait_Reward_Infant_TopNotch'] });
    expect(infant.some((fact) => fact.predicate === FactPredicate.REWARD_TRAIT)).toBe(true);
    expect(has(FactPredicate.PHASE, 'trait_ChildhoodPhase_Clingy')).toBe(true);
  });

  it('puts the career level inside the claim so a promotion reads as a change', () => {
    expect(has(FactPredicate.JOB, 'career_Adult_TechGuru (level 4)')).toBe(true);
    const promoted = dossierToFacts({ ...dossier, careers: [{ career: 'career_Adult_TechGuru', level: 5 }] });
    expect(promoted.some((fact) => fact.objectText === 'career_Adult_TechGuru (level 5)')).toBe(true);
  });

  it('puts the branch inside the claim once chosen, and leaves the starting track off', () => {
    const texts = (careers: { career: string; track?: string; level?: number }[]) =>
      dossierToFacts({ sim_id: '1', careers })
        .filter((fact) => fact.predicate === FactPredicate.JOB)
        .map((fact) => fact.objectText);
    expect(texts([{ career: 'career_Adult_Athletic', track: 'Athletic_Track1', level: 3 }])).toEqual([
      'career_Adult_Athletic (level 3)',
    ]);
    expect(texts([{ career: 'career_Adult_Athletic', track: 'Athletic_Track3_BodyBuilder', level: 10 }])).toEqual([
      'career_Adult_Athletic/Athletic_Track3_BodyBuilder (level 10)',
    ]);
  });

  it('keeps a business by name, the kind after it unless it is a small business', () => {
    const texts = dossierToFacts({
      sim_id: '1',
      businesses: [
        { name: 'Vale Curios', type: 'SMALL_BUSINESS', owner: 'sim' },
        { name: 'Chez Vale', type: 'RESTAURANT', owner: 'household' },
        { type: 'RETAIL' },
      ],
    })
      .filter((fact) => fact.predicate === FactPredicate.BUSINESS)
      .map((fact) => fact.objectText);
    expect(texts).toEqual(['Vale Curios', 'Chez Vale (restaurant)']);
  });

  it('records an ex from the relationship bits', () => {
    // Lillie and Jake broke up; the bit is the game's record of it (2026-10-13)
    expect(has(FactPredicate.EX_PARTNER, 'broke up', '400')).toBe(true);
    expect(has(FactPredicate.EX_PARTNER, undefined, '200')).toBe(false);
    expect(exPartnerWords(['romantic-Divorced'])).toBe('divorced');
    expect(exPartnerWords(['romantic-Engaged'])).toBeUndefined();
  });

  it('never turns a relationship score into a fact', () => {
    // Scores drift every few game minutes; a fact row would either churn or go stale
    expect(facts.some((fact) => (fact.objectText ?? '').includes('100'))).toBe(false);
    expect(has(FactPredicate.KNOWS, undefined, '200')).toBe(true);
    // ...and someone never met is not someone the sim knows
    expect(has(FactPredicate.KNOWS, undefined, '300')).toBe(false);
  });

  it('drops the sim from its own household membership and keeps every reported skill', () => {
    expect(has(FactPredicate.HOUSEHOLD_MEMBER, undefined, '100')).toBe(false);
    // Level 1 is a fact too: what a sim is bad at informs a reply (2026-10-13)
    expect(facts.some((fact) => (fact.objectText ?? '').startsWith('Fitness'))).toBe(true);
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

  it('files a pet by its species, never as a human occult', () => {
    const bosun = dossierToFacts(
      { sim_id: '700', name: 'Bosun', occult: { types: ['HUMAN'], current: ['HUMAN'] } },
      { speciesOf: () => 'DOG' },
    );
    expect(bosun.some((fact) => fact.predicate === FactPredicate.OCCULT)).toBe(false);
    expect(bosun.some((fact) => fact.predicate === FactPredicate.OCCULT_CURRENT)).toBe(false);
    expect(bosun.find((fact) => fact.predicate === FactPredicate.SPECIES)?.objectText).toBe('DOG');
    // A person keeps theirs
    expect(has(FactPredicate.OCCULT, 'HUMAN')).toBe(true);
  });

  it('calls a housemate with a species a pet, and never a person', () => {
    // The dossier lists the dog as a bare member id; the species comes from the state
    // report. Anker introduced his dog Bosun as a man until this edge existed (2026-10-12).
    const withDog = dossierToFacts(
      { ...dossier, household: { id: '900', name: 'BFF', member_ids: ['100', '200', '700'] } },
      { speciesOf: (id) => (id === '700' ? 'DOG' : undefined) },
    );
    expect(withDog.some((fact) => fact.predicate === FactPredicate.PET && fact.objectSimId === '700')).toBe(true);
    expect(withDog.some((fact) => fact.predicate === FactPredicate.PET && fact.objectSimId === '200')).toBe(false);
    // Still a housemate as well
    expect(
      withDog.some((fact) => fact.predicate === FactPredicate.HOUSEHOLD_MEMBER && fact.objectSimId === '700'),
    ).toBe(true);
    // No lookup, no pets: an older app state is unchanged
    expect(facts.some((fact) => fact.predicate === FactPredicate.PET)).toBe(false);
  });

  it('keeps a pet own species in its derived facts so a dossier ingest does not retire it', () => {
    const bosun = dossierToFacts(
      { sim_id: '700', name: 'Bosun', household: { id: '900', member_ids: ['100', '700'] } },
      { speciesOf: (id) => (id === '700' ? 'DOG' : undefined) },
    );
    expect(bosun.some((fact) => fact.predicate === FactPredicate.SPECIES && fact.objectText === 'DOG')).toBe(true);
    // A dog does not keep the people it lives with as pets
    expect(bosun.some((fact) => fact.predicate === FactPredicate.PET)).toBe(false);
    // A dossier that one day carries species itself wins over the lookup
    const sent = dossierToFacts({ sim_id: '700', species: 'CAT' }, { speciesOf: () => 'DOG' });
    expect(sent.find((fact) => fact.predicate === FactPredicate.SPECIES)?.objectText).toBe('CAT');
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
    // A sim is one kind of creature, has any number of pets, and can be told many things
    expect(isSingleValued(FactPredicate.SPECIES)).toBe(true);
    expect(isSingleValued(FactPredicate.PET)).toBe(false);
    expect(isSingleValued(FactPredicate.NOTE)).toBe(false);
  });

  it('explains every predicate in the player words', () => {
    for (const predicate of Object.values(FactPredicate)) {
      expect(FACT_PREDICATE_HELP[predicate], predicate).toBeTruthy();
    }
    // The question that prompted the help: "household" is the family name, not the people
    expect(FACT_PREDICATE_HELP.household).toContain('not a list of who lives there');
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
    expect(block).toContain('you like: Hip Hop music');
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
