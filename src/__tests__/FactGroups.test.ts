import { describe, expect, it } from 'vitest';
import { FactPredicate } from 'main/sentient-sims/pipeline/facts/predicates';
import { CUSTOM_CATEGORY, GroupableFact, groupFacts, SIMS_MET_CATEGORY } from 'main/sentient-sims/util/factGroups';

// The Facts window's shape: a summary line, then categories A to Z with rows A to Z. A
// live sim (traits, likes with turn-ons mixed in, family, a pet, forty people met, a note,
// hearsay, a retired fact) is what this has to make readable at a glance.
describe('groupFacts', () => {
  let nextId = 1;
  const fact = (
    predicate: string,
    objectText?: string,
    objectSimId?: string,
    source = 'game',
    validToDay?: number,
  ): GroupableFact => ({ id: nextId++, predicate, objectText, objectSimId, source, validFromDay: 10, validToDay });

  const names = {
    '200': 'Mackenzie Scott',
    '300': 'Liberty Lee',
    '400': 'Ariel Scott',
    '700': 'Bosun',
    '800': 'Alice',
    '900': 'Elliot Chatman',
    '950': 'Jake Flores',
    '960': 'Zed Nobody',
  };
  const relationships = {
    '300': { friendship: 100, bits: ['friendship-bff'] },
    '800': { friendship: 20, bits: ['friendship-friend'] },
    '950': { friendship: 28, bits: ['friendship-acquaintances', 'romantic-Broken_Up'] },
    '960': { friendship: -40, bits: ['friendship-disliked'] },
  };
  const species = { '700': 'DOG' };

  const facts: GroupableFact[] = [
    fact(FactPredicate.AGE_STAGE, 'YOUNGADULT'),
    fact(FactPredicate.GENDER, 'MALE'),
    fact(FactPredicate.PRONOUNS, 'he/him'),
    fact(FactPredicate.OCCULT, 'HUMAN'),
    fact(FactPredicate.OCCULT_CURRENT, 'HUMAN'),
    fact(FactPredicate.ALIVE, 'yes'),
    fact(FactPredicate.HOUSEHOLD, 'Calloway'),
    fact(FactPredicate.HOUSEHOLD_MEMBER, undefined, '200'),
    fact(FactPredicate.HOUSEHOLD_MEMBER, undefined, '700'),
    fact(FactPredicate.PET, undefined, '700'),
    fact(FactPredicate.CHILD, undefined, '200'),
    fact(FactPredicate.FAMILY_BIT, 'family_Target_IsSonOrDaughterOf_Actor', '200'),
    fact(FactPredicate.FAMILY_BIT, 'family_Target_IsStepchildOf_Actor', '400'),
    fact(FactPredicate.SPOUSE, undefined, '300'),
    fact(FactPredicate.FAMILY_BIT, 'romantic-Married', '300'),
    fact(FactPredicate.FAMILY_BIT, 'romantic-Divorced', '900'),
    fact(FactPredicate.TRAIT, 'trait_Outgoing'),
    fact(FactPredicate.TRAIT, 'trait_Cheerful'),
    fact(FactPredicate.REWARD_TRAIT, 'trait_Business_Savvy'),
    fact(FactPredicate.PHASE, 'trait_ChildhoodPhase_Clingy'),
    fact(FactPredicate.LIKES, 'trait_SimPreference_Likes_Music_HipHop'),
    fact(FactPredicate.LIKES, 'trait_SimPreference_Likes_Activities_Cooking'),
    fact(FactPredicate.LIKES, 'trait_SimPreference_Likes_Color_Blue'),
    fact(FactPredicate.LIKES, 'trait_SimPreference_Likes_Characteristic_HardWorker'),
    fact(FactPredicate.LIKES, 'trait_Attraction_Activities_Broke_TurnOn'),
    fact(FactPredicate.DISLIKES, 'trait_Attraction_HairColor_Green_TurnOff'),
    fact(FactPredicate.FEAR, 'trait_Fear_Fire'),
    fact(FactPredicate.JOB, 'career_Adult_Business (level 6)'),
    fact(FactPredicate.SKILL, 'AdultMajor_Charisma (level 5)'),
    fact(FactPredicate.SKILL, 'AdultMajor_Writing (level 1)'),
    fact(FactPredicate.SKILL, 'NLS (level 9)'),
    fact(FactPredicate.ASPIRATION, 'Track_Popularity_A'),
    fact(FactPredicate.KNOWS, undefined, '800'),
    fact(FactPredicate.KNOWS, undefined, '300'),
    fact(FactPredicate.KNOWS, undefined, '950'),
    fact(FactPredicate.KNOWS, undefined, '960'),
    fact(FactPredicate.EX_PARTNER, 'broke up', '950'),
    fact(FactPredicate.NOTE, 'Bosun is your dog', undefined, 'player'),
    fact(FactPredicate.SPOUSE, undefined, '800', 'told'),
    fact(FactPredicate.TRAIT, 'trait_Lazy', undefined, 'game', 12),
  ];

  const grouped = groupFacts({ facts, names, species, relationships });
  const category = (title: string) => grouped.categories.find((c) => c.title === title);
  const labels = (title: string) => (category(title)?.rows ?? []).map((row) => row.label);

  it('puts the player facts first, then the categories in alphabetical order', () => {
    const titles = grouped.categories.map((c) => c.title);
    expect(titles[0]).toBe(CUSTOM_CATEGORY);
    const rest = titles.slice(1);
    expect(rest).toEqual([...rest].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })));
    expect(titles).toContain('Family');
    expect(titles).toContain('Turn-ons');
  });

  it('summarises who the sim is, each tag under its heading', () => {
    expect(grouped.summary.map((item) => [item.title, item.label])).toEqual([
      ['Age', 'young adult'],
      ['Gender', 'male (he/him)'],
      ['Household', 'Calloway'],
      ['Career', 'Business, level 6'],
      ['Aspiration', 'Friend of the World'],
    ]);
    // The aspiration lives on the summary line alone
    expect(grouped.categories.map((c) => c.title)).not.toContain('Aspiration');
  });

  it('names the career branch and the businesses the sim owns', () => {
    const owner = groupFacts({
      facts: [
        fact(FactPredicate.JOB, 'career_Adult_Athletic/Athletic_Track3_BodyBuilder (level 10)'),
        fact(FactPredicate.BUSINESS, 'Vale Curios'),
        fact(FactPredicate.BUSINESS, 'Chez Vale (restaurant)'),
      ],
      names,
      species,
    });
    expect(owner.summary.map((item) => [item.title, item.label])).toEqual([
      ['Career', 'Bodybuilder (Athletic, level 10)'],
      ['Business', 'Vale Curios, Chez Vale'],
    ]);
    const career = owner.categories.find((c) => c.title === 'Career')?.rows ?? [];
    expect(career.map((row) => [row.label, row.detail])).toEqual([['Bodybuilder', 'Athletic, level 10']]);
    const business = owner.categories.find((c) => c.title === 'Business')?.rows ?? [];
    expect(business.map((row) => [row.label, row.detail])).toEqual([
      ['Chez Vale', 'restaurant'],
      ['Vale Curios', 'small business'],
    ]);
  });

  it('sorts the rows inside a category', () => {
    expect(labels('Personality')).toEqual(['Business Savvy', 'Cheerful', 'Clingy', 'Lazy', 'Outgoing']);
    const details = category('Personality')?.rows.map((row) => row.detail);
    expect(details).toEqual([undefined, undefined, 'childhood phase', undefined, undefined]);
    expect(category('Personality')?.rows.find((row) => row.label === 'Lazy')?.retired).toBe(true);
  });

  it('gives turn-ons and turn-offs their own categories, bare', () => {
    expect(labels('Likes')).toEqual(['Blue', 'Cooking', 'Hard Worker Sims', 'Hip Hop']);
    expect(labels('Turn-ons')).toEqual(['Broke']);
    expect(labels('Turn-offs')).toEqual(['Green']);
    expect(category('Dislikes')).toBeUndefined();
  });

  it('splits likes under sub-headings so the words can stay bare', () => {
    const groups = category('Likes')?.groups?.map(
      (group) => `${group.title}: ${group.rows.map((r) => r.label).join(', ')}`,
    );
    expect(groups).toEqual([
      'Activities: Cooking',
      'Colors: Blue',
      'Music: Hip Hop',
      'Types of Sims: Hard Worker Sims',
    ]);
    expect(category('Turn-offs')?.groups?.map((group) => group.title)).toEqual(['Hair Color']);
    // a category without sub-headings has none
    expect(category('Personality')?.groups).toBeUndefined();
  });

  it('lists the household members, pets included, and no household-name row', () => {
    expect(category('Household')).toBeUndefined();
    expect(category('Pets')).toBeUndefined();
    expect(category('Household Members')?.rows.map((row) => `${row.label} - ${row.detail}`)).toEqual([
      'Bosun - dog',
      'Mackenzie Scott - Sim',
    ]);
    // the dog's member edge and pet edge are one row
    expect(category('Household Members')?.rows[0].facts).toHaveLength(2);
  });

  it('orders skills highest first and keeps level 1', () => {
    expect(category('Skills')?.rows.map((row) => `${row.label} ${row.detail}`)).toEqual([
      'Natural Living level 9',
      'Charisma level 5',
      'Writing level 1',
    ]);
  });

  it('merges a family bit into the person row and lets the precise word win', () => {
    const family = category('Family')?.rows.map((row) => `${row.label}: ${row.detail}`);
    expect(family).toEqual(['Ariel Scott: stepchild', 'Mackenzie Scott: child']);
    const mackenzie = category('Family')?.rows.find((row) => row.label === 'Mackenzie Scott');
    expect(mackenzie?.facts).toHaveLength(2);
    // the current partner first, the ex below and marked
    expect(category('Partners')?.rows.map((row) => `${row.label}: ${row.detail}`)).toEqual([
      'Liberty Lee: married',
      'Elliot Chatman (ex): divorced',
      'Jake Flores (ex): broke up',
    ]);
  });

  it('files hearsay under its own category whatever it claims', () => {
    expect(labels('Heard in conversation')).toEqual(['spouse: Alice']);
    expect(category('Partners')?.rows.some((row) => row.label === 'Alice')).toBe(false);
  });

  it('keeps notes, folds the people met, and leaves identity to the summary', () => {
    expect(labels(CUSTOM_CATEGORY)).toEqual(['Bosun is your dog']);
    expect(labels(SIMS_MET_CATEGORY)).toEqual(['Alice', 'Jake Flores', 'Liberty Lee', 'Zed Nobody']);
    expect(category(SIMS_MET_CATEGORY)?.collapsedByDefault).toBe(true);
    // closest first, then the acquaintances, then whoever the sim cannot stand
    expect(
      category(SIMS_MET_CATEGORY)?.groups?.map((g) => `${g.title}: ${g.rows.map((r) => r.label).join(', ')}`),
    ).toEqual([
      'Best Friends: Liberty Lee',
      'Friends: Alice',
      'Acquaintances: Jake Flores',
      'On Bad Terms: Zed Nobody',
    ]);
    expect(grouped.categories.some((c) => c.rows.some((row) => row.label === 'human'))).toBe(false);
  });

  it('describes a pet by its species and a ghost by its death', () => {
    const pet = groupFacts({
      facts: [
        fact(FactPredicate.AGE_STAGE, 'ADULT'),
        fact(FactPredicate.SPECIES, 'DOG'),
        fact(FactPredicate.GENDER, 'MALE'),
      ],
      names,
      species,
    });
    expect(pet.summary.map((item) => item.label)).toEqual(['adult', 'male', 'dog']);
    const ghost = groupFacts({
      facts: [
        fact(FactPredicate.ALIVE, 'no'),
        fact(FactPredicate.DEATH_TYPE, 'KillerRabbit'),
        fact(FactPredicate.OCCULT_CURRENT, 'FAIRY'),
      ],
      names,
      species,
    });
    expect(ghost.summary.map((item) => item.label)).toEqual(['fairy', 'ghost (Killer Rabbit)']);
  });
});
