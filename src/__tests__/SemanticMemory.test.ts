import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { DirectoryService } from 'main/sentient-sims/services/DirectoryService';
import { SettingsService } from 'main/sentient-sims/services/SettingsService';
import { SimDossier } from 'main/sentient-sims/models/SimDossier';
import { FactPredicate } from 'main/sentient-sims/pipeline/facts/predicates';
import { mockApiContext, mockEnvironment } from './util';

// H2: the semantic fact store. The point of the block is that a sim can answer a question
// about itself correctly, and that nothing it is TOLD can overwrite what the game says.
describe('semantic memory', () => {
  let ctx: ApiContext;
  let directoryService: DirectoryService;
  let settingsService: SettingsService;
  let sessionId: string;

  function dossier(overrides: Partial<SimDossier> = {}): SimDossier {
    return {
      version: 1,
      sim_id: '100',
      name: 'Travis Scott',
      age: 'ELDER',
      gender: 'MALE',
      occult: { types: ['HUMAN'], current: ['HUMAN'] },
      is_ghost: false,
      household: { id: '900', name: 'BFF', member_ids: ['100', '200'] },
      family: { parents: [], siblings: [], children: ['200'], grandparents: [], steady_ids: [] },
      family_bits: { '200': 'family_Target_IsSonOrDaughterOf_Actor' },
      traits: ['trait_Geek'],
      likes: ['trait_SimPreference_Likes_Music_HipHop'],
      dislikes: [],
      relationships: [{ sim_id: '200', name: 'Mackenzie Scott', has_met: true, friendship: 100, romance: 0 }],
      ...overrides,
    };
  }

  beforeEach(() => {
    ({ directoryService, settingsService } = mockEnvironment());
    ctx = mockApiContext({ directoryService, settingsService });
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    sessionId = `facts-${Math.random().toString(36).slice(2)}`;
    ctx.db.loadDatabase({ sessionId, saveId: '1' });
  });

  it('turns a dossier into game facts', () => {
    const result = ctx.semanticMemory.ingestDossier(dossier(), { day: 10 });
    expect(result.skipped).toBe(false);
    expect(result.inserted).toBeGreaterThan(0);

    const facts = ctx.semanticMemory.getCurrentFacts('100');
    const child = facts.find((fact) => fact.predicate === FactPredicate.CHILD);
    expect(child?.objectSimId).toBe('200');
    expect(child?.source).toBe('game');
    expect(child?.confidence).toBe(1);
    expect(child?.validFromDay).toBe(10);
    expect(facts.find((fact) => fact.predicate === FactPredicate.AGE_STAGE)?.objectText).toBe('ELDER');
    expect(facts.find((fact) => fact.predicate === FactPredicate.HOUSEHOLD)?.objectText).toBe('BFF');
    // The family bit is the only place step/in-law distinctions live
    expect(facts.find((fact) => fact.predicate === FactPredicate.FAMILY_BIT)?.objectText).toBe(
      'family_Target_IsSonOrDaughterOf_Actor',
    );
  });

  it('adds and retires nothing when the dossier is re-sent unchanged', () => {
    // A zone load and a sleep push re-send unconditionally: the diff is what must keep
    // the table from growing.
    ctx.semanticMemory.ingestDossier(dossier(), { day: 10 });
    const before = ctx.simFactRepository.count();
    const again = ctx.semanticMemory.ingestDossier(dossier(), { day: 11 });
    expect(again.skipped).toBe(true);
    expect(again.inserted).toBe(0);
    expect(again.retired).toBe(0);
    expect(ctx.simFactRepository.count()).toBe(before);
  });

  it('sees a change that leaves the dossier JSON the same length', () => {
    const cook = (level: number) => [{ career: 'career_Adult_Culinary', level, performance: 50, at_work: false }];
    const before = dossier({ age: 'ADULT', careers: cook(3) });
    const after = dossier({ age: 'ELDER', careers: cook(4) });
    expect(JSON.stringify(after).length).toBe(JSON.stringify(before).length);

    ctx.semanticMemory.ingestDossier(before, { day: 1 });
    const result = ctx.semanticMemory.ingestDossier(after, { day: 2 });

    expect(result.skipped).toBe(false);
    expect(result.identityChanged).toEqual([FactPredicate.AGE_STAGE]);
    const facts = ctx.semanticMemory.getCurrentFacts('100');
    expect(facts.find((fact) => fact.predicate === FactPredicate.AGE_STAGE)?.objectText).toBe('ELDER');
    expect(facts.find((fact) => fact.predicate === FactPredicate.JOB)?.objectText).toBe(
      'career_Adult_Culinary (level 4)',
    );
  });

  it('retires a fact the dossier stopped asserting, without deleting it', () => {
    // A divorce: the old edge is history, not a lie, and "she used to be married to him"
    // is worth keeping
    ctx.semanticMemory.ingestDossier(dossier({ family: { spouse_id: '300', steady_ids: [] } }), {
      day: 10,
    });
    expect(ctx.semanticMemory.getCurrentFacts('100').some((f) => f.predicate === FactPredicate.SPOUSE)).toBe(true);

    ctx.semanticMemory.ingestDossier(dossier({ family: { steady_ids: [] } }), { day: 20 });

    expect(ctx.semanticMemory.getCurrentFacts('100').some((f) => f.predicate === FactPredicate.SPOUSE)).toBe(false);
    const historic = ctx.semanticMemory.getHistory('100').find((f) => f.predicate === FactPredicate.SPOUSE);
    expect(historic).toBeDefined();
    expect(historic?.validToDay).toBe(20);
  });

  it('a new single-valued game fact supersedes the old one', () => {
    ctx.semanticMemory.ingestDossier(dossier({ age: 'ADULT' }), { day: 1 });
    ctx.semanticMemory.ingestDossier(dossier({ age: 'ELDER' }), { day: 2 });
    const current = ctx.semanticMemory.getCurrentFacts('100').filter((f) => f.predicate === FactPredicate.AGE_STAGE);
    expect(current).toHaveLength(1);
    expect(current[0].objectText).toBe('ELDER');
  });

  it('keeps a told lie but never lets it beat the game', () => {
    // The 3.1 acceptance test: tell the sim a false family fact
    ctx.semanticMemory.ingestDossier(dossier(), { day: 10 });
    const toldId = ctx.semanticMemory.addFact({
      subjectSimId: '100',
      predicate: FactPredicate.SPOUSE,
      objectSimId: '999',
      source: 'told',
      provenanceMemoryId: '55',
      day: 10,
    });
    expect(toldId).toBeDefined();

    // The lie is stored, at low confidence, with its source and its provenance
    const told = ctx.semanticMemory.getCurrentFacts('100').find((f) => f.objectSimId === '999');
    expect(told?.source).toBe('told');
    expect(told?.confidence).toBeLessThan(0.5);
    expect(told?.provenanceMemoryId).toBe('55');

    // ...and the moment the game asserts a real spouse, the lie is retired by it
    ctx.semanticMemory.ingestDossier(dossier({ family: { spouse_id: '300', steady_ids: [] } }), {
      day: 11,
    });
    const spouses = ctx.semanticMemory.getCurrentFacts('100').filter((f) => f.predicate === FactPredicate.SPOUSE);
    expect(spouses).toHaveLength(1);
    expect(spouses[0].objectSimId).toBe('300');
    expect(spouses[0].source).toBe('game');
  });

  it('a told fact cannot retire a game fact', () => {
    ctx.semanticMemory.ingestDossier(dossier({ family: { spouse_id: '300', steady_ids: [] } }), {
      day: 10,
    });
    ctx.semanticMemory.addFact({
      subjectSimId: '100',
      predicate: FactPredicate.SPOUSE,
      objectSimId: '999',
      source: 'told',
      day: 10,
    });
    const game = ctx.semanticMemory
      .getCurrentFacts('100')
      .find((f) => f.predicate === FactPredicate.SPOUSE && f.source === 'game');
    expect(game?.objectSimId).toBe('300');
    expect(game?.validToDay).toBeUndefined();
  });

  it('renders what the sim knows into a KNOWN_FACTS block', () => {
    ctx.semanticMemory.ingestDossier(dossier(), { day: 10 });
    const block = ctx.semanticMemory.recall('100', { mentionedSimIds: ['200'] });
    expect(block).toContain('<KNOWN_FACTS>');
    expect(block).toContain('you are an elder (retirement age)');
    expect(block).toContain('Mackenzie Scott');
    // The family word beats the score band, and the score band still appears
    expect(block).toContain('your child');
    expect(block).toContain('a good friend');
  });

  it('names the people in a sim life when nobody else is in the scene', () => {
    // The 3.1 fix-A failure: a single-Sim event carries no mentioned sims and no
    // <RELATIONSHIPS> block, so before this the sim had no name anywhere in its prompt and
    // answered "who are you closest to" with the household's name (live 2026-09-03).
    ctx.semanticMemory.ingestDossier(
      dossier({
        household: { id: '900', name: 'BFF', member_ids: ['100', '200', '300'] },
        relationships: [
          { sim_id: '200', name: 'Mackenzie Scott', has_met: true, friendship: 100, romance: 0 },
          { sim_id: '300', name: 'Liberty Lee', has_met: true, friendship: 55, romance: 0 },
          { sim_id: '400', name: 'Alice Landgraab', has_met: true, friendship: 2, romance: 0 },
        ],
      }),
      { day: 10 },
    );

    const block = ctx.semanticMemory.recall('100');
    expect(block).toContain('People in your life:');
    // family, and the closest friend who is not family
    expect(block).toContain('Mackenzie Scott');
    expect(block).toContain('Liberty Lee');
    // a bare acquaintance does not earn a line
    expect(block).not.toContain('Alice Landgraab');
    // ...and the household is named with its members, not just its name
    expect(block).toContain('you live with Mackenzie Scott and Liberty Lee (the BFF household)');
  });

  it('a person named in the text the sim is about to read gets their fact line', () => {
    // Live 2026-09-23: Mara's briefing named Adrian, her life list had no room for him
    // (seven friends at 100, a stronger old romance), and "the facts are right" made her
    // conclude "there's no Adrian in my life" and swap in the romance that WAS listed.
    ctx.semanticMemory.ingestDossier(
      dossier({
        relationships: [
          { sim_id: '200', name: 'Mackenzie Scott', has_met: true, friendship: 100, romance: 0 },
          { sim_id: '300', name: 'Liberty Lee', has_met: true, friendship: 100, romance: 0 },
          { sim_id: '400', name: 'Mika Oshino', has_met: true, friendship: 90, romance: 82 },
          {
            sim_id: '500',
            name: 'Adrian House',
            has_met: true,
            friendship: 72,
            romance: 17,
            bits: ['RomanticCombo_RomanticInterest'],
          },
          { sim_id: '600', name: 'Al Pacino', has_met: true, friendship: 20, romance: 0 },
        ],
      }),
      { day: 10 },
    );

    const block = ctx.semanticMemory.recall('100', {
      mentionedText: 'You want to untangle your feelings about Nadia and adrian house.\nAlice Landgraab waved.',
    });
    const mentionedSection = block.split('About people here or mentioned:')[1]?.split('People in your life:')[0] ?? '';
    expect(mentionedSection).toContain('Adrian House');
    // whole names only: "Al" inside "Alice" is not Al Pacino (he is a friend, so he still
    // appears further down in the life list, but not as mentioned)
    expect(mentionedSection).not.toContain('Al Pacino');
  });

  it('lists up to ten friends in a sim life', () => {
    const relationships = Array.from({ length: 12 }, (_, i) => ({
      sim_id: `${200 + i}`,
      name: `Friend Number${i}`,
      has_met: true,
      friendship: 100 - i,
      romance: 0,
    }));
    ctx.semanticMemory.ingestDossier(dossier({ relationships }), { day: 10 });
    const block = ctx.semanticMemory.recall('100');
    expect(block).toContain('Friend Number9');
    expect(block).not.toContain('Friend Number10');
  });

  it('reports an identity change, but not a first ingest', () => {
    // Fix B: an age-up means the stored character description was written about somebody
    // this sim no longer is. A first ingest inserts the age without changing anything -
    // there was no previous answer for it to contradict.
    const first = ctx.semanticMemory.ingestDossier(dossier({ age: 'TEEN' }), { day: 1 });
    expect(first.inserted).toBeGreaterThan(0);
    expect(first.identityChanged).toEqual([]);

    const aged = ctx.semanticMemory.ingestDossier(dossier({ age: 'ELDER' }), { day: 2 });
    expect(aged.identityChanged).toEqual([FactPredicate.AGE_STAGE]);

    // ...and it is reported once, not on every push afterwards
    const again = ctx.semanticMemory.ingestDossier(dossier({ age: 'ELDER' }), { day: 3 });
    expect(again.identityChanged).toEqual([]);
  });

  it('does not call a new trait or a new friend an identity change', () => {
    ctx.semanticMemory.ingestDossier(dossier(), { day: 1 });
    const changed = ctx.semanticMemory.ingestDossier(dossier({ traits: ['trait_Geek', 'trait_Cheerful'] }), {
      day: 2,
    });
    expect(changed.inserted).toBeGreaterThan(0);
    expect(changed.identityChanged).toEqual([]);
  });

  it('labels other people with the pronouns their own facts imply', () => {
    // Gender is a fact ABOUT a sim, never an edge, so the speaker's own rows cannot supply
    // it: without reading Mackenzie's rows the block named him and left his gender to be
    // guessed from the name, and a sim called him "she" (live 2026-09-03).
    ctx.semanticMemory.ingestDossier(dossier(), { day: 10 });
    ctx.semanticMemory.ingestDossier(
      { sim_id: '200', name: 'Mackenzie Scott', gender: 'MALE', family: { parents: ['100'], steady_ids: [] } },
      { day: 10 },
    );

    expect(ctx.semanticMemory.recall('100', { mentionedSimIds: ['200'] })).toContain('Mackenzie Scott (he/him)');
  });

  it('states the absences the game records, once a dossier has been ingested', () => {
    ctx.semanticMemory.ingestDossier(
      dossier({ family: { parents: [], siblings: [], children: [], grandparents: [], steady_ids: [] } }),
      { day: 10 },
    );
    const block = ctx.semanticMemory.recall('100');
    expect(block).toContain('you have no parents, siblings or children on record');
    expect(block).toContain('you are not married or seeing anyone');
    expect(block).toContain('you are retired');
  });

  it('keeps a sim who knows forty people inside the prompt budget', () => {
    const relationships = [
      { sim_id: '200', name: 'Mackenzie Scott', has_met: true, friendship: 100, romance: 0 },
      ...Array.from({ length: 40 }, (_, index) => ({
        sim_id: `${1000 + index}`,
        name: `Person Number${index}`,
        has_met: true,
        friendship: 60 - index,
        romance: 0,
      })),
    ];
    ctx.semanticMemory.ingestDossier(dossier({ relationships }), { day: 10 });

    const block = ctx.semanticMemory.recall('100');
    expect(block.length).toBeLessThan(1600);
    // The child is family, so they are in the section however many friends there are
    expect(block).toContain('Mackenzie Scott');
  });

  it('recall is empty for a sim with no facts, so the prompt is unchanged', () => {
    expect(ctx.semanticMemory.recall('404')).toBe('');
  });

  it('finds the path between two sims through the edges', () => {
    ctx.semanticMemory.ingestDossier(dossier(), { day: 10 });
    ctx.semanticMemory.ingestDossier(
      {
        sim_id: '200',
        name: 'Mackenzie Scott',
        family: { parents: ['100'], children: ['400'], steady_ids: [] },
      },
      { day: 10 },
    );
    const direct = ctx.semanticMemory.pathBetween('100', '200');
    expect(direct.length).toBe(1);
    const twoHops = ctx.semanticMemory.pathBetween('100', '400', 2);
    expect(twoHops.length).toBe(2);
    expect(ctx.semanticMemory.pathBetween('100', '7777', 2)).toEqual([]);
  });

  it('walks a densely connected save without retracing it', () => {
    const sims = 60;
    ctx.db.getDb().transaction(() => {
      for (let sim = 0; sim < sims; sim += 1) {
        for (let step = 1; step <= 20; step += 1) {
          ctx.simFactRepository.insert({
            subjectSimId: `${sim}`,
            predicate: FactPredicate.KNOWS,
            objectSimId: `${(sim + step) % sims}`,
            source: 'game',
            confidence: 1,
          });
        }
      }
    })();

    expect(ctx.semanticMemory.pathBetween('0', 'nobody', 5)).toEqual([]);

    const path = ctx.semanticMemory.pathBetween('0', '30', 5);
    expect(path.length).toBe(2);
    const middle = path[0].subjectSimId === '0' ? path[0].objectSimId : path[0].subjectSimId;
    expect([path[0].subjectSimId, path[0].objectSimId]).toContain('0');
    expect([path[1].subjectSimId, path[1].objectSimId].sort()).toEqual([middle, '30'].sort());
  });

  it('keeps facts and the stored dossier across a restart', () => {
    ctx.semanticMemory.ingestDossier(dossier(), { day: 10 });

    const restarted = mockApiContext({ directoryService, settingsService });
    restarted.db.loadDatabase({ sessionId, saveId: '1' });

    expect(restarted.semanticMemory.getCurrentFacts('100').length).toBeGreaterThan(0);
    expect(restarted.semanticMemory.readDossier('100')?.name).toBe('Travis Scott');
    // ...and an unchanged dossier is still recognized as unchanged after the restart
    expect(restarted.semanticMemory.ingestDossier(dossier()).skipped).toBe(true);
  });
});
