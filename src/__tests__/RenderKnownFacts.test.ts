import { describe, expect, it } from 'vitest';
import { FactPredicate } from 'main/sentient-sims/pipeline/facts/predicates';
import {
  DEFAULT_FACTS_MAX_CHARS,
  jobWords,
  RenderableFact,
  renderKnownFacts,
} from 'main/sentient-sims/util/renderKnownFacts';

// 3.1 fix A: the block is pure, so every wording rule that cost a live battery question is
// pinned here rather than measured by asking a model. The failures each test names are from
// FIX-PLAN-2026-09-03.md.
describe('renderKnownFacts', () => {
  const fact = (predicate: string, objectText?: string, objectSimId?: string): RenderableFact => ({
    predicate,
    objectText,
    objectSimId,
    source: 'game',
    confidence: 1,
  });

  const names = {
    '100': 'Summer Holiday',
    '200': 'Travis Scott',
    '300': 'Mackenzie Scott',
    '400': 'Ariel Scott',
    '500': 'Liberty Lee',
  };

  // Summer: an elder with no family and no career at all, living with three people. Every
  // question she was asked about her family was answered from vibes because the block said
  // nothing about any of it.
  const summerFacts = [
    fact(FactPredicate.AGE_STAGE, 'ELDER'),
    fact(FactPredicate.GENDER, 'FEMALE'),
    fact(FactPredicate.HOUSEHOLD, 'BFF'),
    fact(FactPredicate.HOUSEHOLD_MEMBER, undefined, '200'),
    fact(FactPredicate.HOUSEHOLD_MEMBER, undefined, '300'),
    fact(FactPredicate.HOUSEHOLD_MEMBER, undefined, '400'),
    fact(FactPredicate.TRAIT, 'trait_Cheerful'),
  ];

  const render = (input: Partial<Parameters<typeof renderKnownFacts>[0]> = {}) =>
    renderKnownFacts({
      selfFacts: summerFacts,
      people: [],
      told: [],
      names,
      hasDossier: true,
      ...input,
    });

  it('states what the game records the sim does NOT have', () => {
    const block = render();
    expect(block).toContain('you have no parents, siblings or children on record');
    expect(block).toContain('you are not married or seeing anyone');
    // An elder with no career has retired; "you have no job" would be the wrong word
    expect(block).toContain('you are retired');
  });

  it('says nothing about absence for a sim with no dossier', () => {
    // No dossier row means no records, which is not the same as empty records
    const block = render({ hasDossier: false });
    expect(block).not.toContain('on record');
    expect(block).not.toContain('you are retired');
    expect(block).not.toContain('not married');
  });

  it('names only the roles that are actually missing', () => {
    const block = render({
      selfFacts: [...summerFacts, fact(FactPredicate.CHILD, undefined, '300')],
    });
    expect(block).toContain('you have no parents or siblings on record');
    expect(block).not.toContain('children on record');
  });

  it('says a working sim has a job, in career words', () => {
    const block = render({ selfFacts: [...summerFacts, fact(FactPredicate.JOB, 'career_Adult_Culinary (level 4)')] });
    expect(block).toContain('you work in the Culinary career, level 4');
    expect(block).not.toContain('you are retired');
    // The old wording is what a sim turned into "I mix drinks at a bar"
    expect(block).not.toContain('you work as');
  });

  it('renders a career with no level', () => {
    expect(jobWords('career_Adult_Culinary')).toBe('you work in the Culinary career');
    expect(jobWords('career_Adult_TechGuru (level 2)')).toBe('you work in the Tech Guru career, level 2');
  });

  it('says a business owner owns it, and is not jobless', () => {
    const block = render({ selfFacts: [...summerFacts, fact(FactPredicate.BUSINESS, 'Vale Curios')] });
    expect(block).toContain('you own a small business, Vale Curios');
    expect(block).not.toContain('you are retired');
    expect(block).not.toContain('you have no job');
  });

  it('names the people the sim lives with, not just the household', () => {
    // Live 2026-09-03: asked who she lived with, Summer answered "BFF" - the household name
    // was the only name anywhere in her prompt
    expect(render()).toContain('you live with Travis Scott, Mackenzie Scott and Ariel Scott (the BFF household)');
  });

  it('falls back to the household name when the members are unknown', () => {
    const block = render({
      selfFacts: [fact(FactPredicate.HOUSEHOLD, 'BFF')],
    });
    expect(block).toContain('you live with the BFF household');
  });

  it('says a life stage the way a person says it', () => {
    expect(render()).toContain('you are an elder (retirement age)');
    const adult = render({ selfFacts: [fact(FactPredicate.AGE_STAGE, 'ADULT')] });
    // Live 2026-09-03: an ADULT sim read the bare word as "early twenties"
    expect(adult).toContain('you are an adult (your thirties or forties)');
  });

  it('carries the people in the sim life even when nobody is present', () => {
    const block = render({
      lifePeople: [
        {
          simId: '300',
          name: 'Mackenzie Scott',
          facts: [fact(FactPredicate.HOUSEHOLD_MEMBER, undefined, '300')],
          relationship: { hasMet: true, friendship: 60 },
        },
        {
          simId: '500',
          name: 'Liberty Lee',
          facts: [],
          relationship: { hasMet: true, friendship: 55 },
        },
      ],
    });
    expect(block).toContain('People in your life:');
    expect(block).toContain('- Mackenzie Scott: you live together, a good friend');
    expect(block).toContain('- Liberty Lee: a good friend');
  });

  it('says how to refer to the people it names', () => {
    // Live 2026-09-03: the block named Mackenzie and said nothing about his gender, so the
    // sim guessed from the name and called him "she"
    const block = render({
      lifePeople: [
        {
          simId: '300',
          name: 'Mackenzie Scott',
          facts: [],
          relationship: { hasMet: true, friendship: 60 },
          pronouns: 'he/him',
        },
      ],
    });
    expect(block).toContain('- Mackenzie Scott (he/him): a good friend');
  });

  it('leaves a person unlabelled when their pronouns are unknown', () => {
    const block = render({
      lifePeople: [
        { simId: '300', name: 'Mackenzie Scott', facts: [], relationship: { hasMet: true, friendship: 60 } },
      ],
    });
    expect(block).toContain('- Mackenzie Scott: a good friend');
  });

  it('describes a person once, in the section they belong to', () => {
    const block = render({
      selfFacts: [...summerFacts, fact(FactPredicate.CHILD, undefined, '400')],
      people: [
        {
          simId: '400',
          name: 'Ariel Scott',
          facts: [fact(FactPredicate.CHILD, undefined, '400')],
          relationship: { hasMet: true, friendship: 80 },
        },
      ],
    });
    expect(block).toContain('- Ariel Scott: your child, a good friend');
    // ...and not a second time as a bare self line
    expect(block).not.toContain('Ariel Scott is your child');
  });

  it('keeps a sim with a very large family inside the budget', () => {
    const many: RenderableFact[] = [...summerFacts];
    for (let i = 0; i < 40; i += 1) {
      many.push(fact(FactPredicate.KNOWS, undefined, `9${i}`));
    }
    const lifePeople = Array.from({ length: 6 }, (_, index) => ({
      simId: `9${index}`,
      name: `Person Number${index}`,
      facts: [],
      relationship: { hasMet: true, friendship: 50 },
    }));
    const block = render({ selfFacts: many, lifePeople });
    expect(block.length).toBeLessThanOrEqual(DEFAULT_FACTS_MAX_CHARS + '<KNOWN_FACTS>\n\n</KNOWN_FACTS>'.length);
    // The sections that matter survive the trim
    expect(block).toContain('you have no parents, siblings or children on record');
    expect(block).toContain('People in your life:');
  });

  it('returns nothing at all when there is nothing to say', () => {
    expect(renderKnownFacts({ selfFacts: [], people: [], told: [], names })).toBe('');
  });

  it('says the family bit the way a person says it, once', () => {
    // Live through 2026-09-04: the game's sibling bit is family_Target_IsBrotherSisterOf_Actor
    // and every block read "Mackenzie Scott (he/him): your brother sister, your sibling"
    const brother = (pronouns?: string) =>
      render({
        lifePeople: [
          {
            simId: '300',
            name: 'Mackenzie Scott',
            facts: [
              fact(FactPredicate.FAMILY_BIT, 'family_Target_IsBrotherSisterOf_Actor', '300'),
              fact(FactPredicate.SIBLING, undefined, '300'),
              fact(FactPredicate.HOUSEHOLD_MEMBER, undefined, '300'),
            ],
            relationship: { hasMet: true, friendship: 60 },
            pronouns,
          },
        ],
      });
    expect(brother('he/him')).toContain('- Mackenzie Scott (he/him): your brother, you live together, a good friend');
    expect(brother('she/her')).toContain('- Mackenzie Scott (she/her): your sister, you live together');
    // Unknown pronouns: the plain word, and not twice
    expect(brother()).toContain('- Mackenzie Scott: your sibling, you live together');
    expect(brother()).not.toContain('brother sister');
  });

  it('names a stepparent, who appears in no genealogy at all', () => {
    // The game keeps step relations out of genealogy - live 2026-09-05, Alex Moyer's own
    // family tree labels Ehren "Stepson" while HIS tree has no Alex in it - so the family
    // bit is the only record of one. Until it was carried, the woman raising him read as
    // "you live together" and nothing more, while both birth parents read as parents, and
    // he spent the day guessing ("my dads", "two moms").
    const alex = (pronouns?: string) =>
      render({
        lifePeople: [
          {
            simId: '400',
            name: 'Alex Moyer',
            facts: [
              fact(FactPredicate.FAMILY_BIT, 'family_Target_IsStepparentOf_Actor', '400'),
              fact(FactPredicate.HOUSEHOLD_MEMBER, undefined, '400'),
            ],
            relationship: { hasMet: true, friendship: 60 },
            pronouns,
          },
        ],
      });
    expect(alex('she/her')).toContain('- Alex Moyer (she/her): your stepmother, you live together');
    expect(alex('he/him')).toContain('- Alex Moyer (he/him): your stepfather, you live together');
    expect(alex()).toContain('- Alex Moyer: your stepparent, you live together');
  });

  it('names a stepchild from the other side', () => {
    const ehren = render({
      lifePeople: [
        {
          simId: '500',
          name: 'Ehren Alder',
          facts: [
            fact(FactPredicate.FAMILY_BIT, 'family_Target_IsStepchildOf_Actor', '500'),
            fact(FactPredicate.HOUSEHOLD_MEMBER, undefined, '500'),
          ],
          relationship: { hasMet: true, friendship: 100 },
          pronouns: 'he/him',
        },
      ],
    });
    expect(ehren).toContain('- Ehren Alder (he/him): your stepson, you live together');
  });

  it('lists a pet as a pet, not among the people the sim lives with', () => {
    // Live 2026-10-12: Anker's household line named his dog Bosun beside his wife, and he
    // introduced Bosun as a man. The dog gets its own line with its species.
    const block = render({
      selfFacts: [
        ...summerFacts,
        fact(FactPredicate.HOUSEHOLD_MEMBER, undefined, '700'),
        fact(FactPredicate.PET, undefined, '700'),
      ],
      names: { ...names, '700': 'Bosun' },
      species: { '700': 'DOG' },
    });
    expect(block).toContain('you live with Travis Scott, Mackenzie Scott and Ariel Scott (the BFF household)');
    expect(block).toContain('- your pet: Bosun the dog');
    expect(block).not.toContain('Ariel Scott and Bosun');
  });

  it('joins several pets on one line and says "pet" when the species is unknown', () => {
    const block = render({
      selfFacts: [
        ...summerFacts,
        fact(FactPredicate.PET, undefined, '700'),
        fact(FactPredicate.PET, undefined, '701'),
        fact(FactPredicate.PET, undefined, '702'),
      ],
      names: { ...names, '700': 'Bosun', '701': 'Luna', '702': 'Mystery' },
      species: { '700': 'SMALLDOG', '701': 'CAT' },
    });
    expect(block).toContain('- your pets: Bosun the small dog, Luna the cat and Mystery the pet');
  });

  it('tags a pet with its species when it is present, and calls it the sim dog', () => {
    const block = render({
      names: { ...names, '700': 'Bosun' },
      species: { '700': 'DOG' },
      people: [
        {
          simId: '700',
          name: 'Bosun',
          facts: [fact(FactPredicate.HOUSEHOLD_MEMBER, undefined, '700'), fact(FactPredicate.PET, undefined, '700')],
          relationship: { hasMet: true, friendship: 80 },
          pronouns: 'he/him',
        },
      ],
    });
    expect(block).toContain('- Bosun (dog, he/him): your dog, a good friend');
    // "your dog" already says he lives here
    expect(block).not.toContain('you live together');
  });

  it('names an ex in the sim life', () => {
    const block = render({
      selfFacts: [fact(FactPredicate.EX_PARTNER, 'broke up', '500')],
      hasDossier: false,
    });
    expect(block).toContain('- Liberty Lee is your ex (you broke up)');
  });

  it('puts reward traits with the personality and a child phase on its own line', () => {
    const block = render({
      selfFacts: [
        fact(FactPredicate.TRAIT, 'trait_Insane'),
        fact(FactPredicate.REWARD_TRAIT, 'trait_Business_Savvy'),
        fact(FactPredicate.PHASE, 'trait_ChildhoodPhase_Clingy'),
        fact(FactPredicate.PHASE, 'trait_ChildConfidence_High'),
        // The game types this WickedWhims trait as a PHASE; it is a trait, not a phase
        fact(FactPredicate.PHASE, 'TURBODRIVER:WickedWhims_Trait_FertilityIssues'),
      ],
      hasDossier: false,
    });
    expect(block).toContain('- your personality: Erratic, Business Savvy, Hypofertile');
    expect(block).toContain('- right now: you are going through a clingy phase, your confidence is high');
    expect(block).not.toContain('Hypofertile phase');
  });

  it('lists skills highest first, level 1 included', () => {
    const block = render({
      selfFacts: [
        fact(FactPredicate.SKILL, 'AdultMajor_HomestyleCooking (level 1)'),
        fact(FactPredicate.SKILL, 'AdultMajor_Charisma (level 9)'),
        fact(FactPredicate.SKILL, 'Fitness (level 4)'),
      ],
      hasDossier: false,
    });
    expect(block).toContain('- your skills: Charisma (level 9), Fitness (level 4), Cooking (level 1)');
  });

  it('lists turn-ons and turn-offs apart from likes and dislikes', () => {
    const block = render({
      selfFacts: [
        fact(FactPredicate.LIKES, 'trait_SimPreference_Likes_Activities_Cooking'),
        fact(FactPredicate.LIKES, 'trait_Attraction_Activities_Broke_TurnOn'),
        fact(FactPredicate.DISLIKES, 'trait_SimPreference_Dislikes_Music_Metal'),
        fact(FactPredicate.DISLIKES, 'trait_Attraction_HairColor_Green_TurnOff'),
      ],
      hasDossier: false,
    });
    expect(block).toContain('- you like: Cooking');
    expect(block).toContain('- you dislike: Metal music');
    expect(block).toContain('- your turn-ons: Broke');
    expect(block).toContain('- your turn-offs: Green hair');
    expect(block).not.toContain('Cooking, Broke');
  });

  it('says what a pet is in its own facts', () => {
    const block = render({ selfFacts: [fact(FactPredicate.SPECIES, 'CAT')], hasDossier: false });
    expect(block).toContain('- you are a cat');
  });

  it('carries a player note word for word, after the household', () => {
    const block = render({
      selfFacts: [
        ...summerFacts,
        {
          predicate: FactPredicate.NOTE,
          objectText: 'You grew up in Brindleton Bay.',
          source: 'player',
          confidence: 0.9,
        },
        {
          predicate: FactPredicate.NOTE,
          objectText: '  Bosun is your dog, not a person  ',
          source: 'player',
          confidence: 0.9,
        },
      ],
    });
    const lines = block.split('\n');
    const household = lines.findIndex((line) => line.startsWith('- you live with'));
    const first = lines.indexOf('- You grew up in Brindleton Bay.');
    const second = lines.indexOf('- Bosun is your dog, not a person');
    expect(household).toBeGreaterThan(0);
    expect(first).toBe(household + 1);
    expect(second).toBe(household + 2);
    // and before the trait list, which is what a sim skims last
    expect(lines.findIndex((line) => line.startsWith('- your personality'))).toBeGreaterThan(second);
  });
});
