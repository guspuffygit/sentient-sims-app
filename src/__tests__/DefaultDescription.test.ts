import * as fs from 'fs';
import { DefaultDescriptionService } from 'main/sentient-sims/services/DefaultDescriptionService';
import { LocationEntity } from 'main/sentient-sims/db/entities/LocationEntity';
import { defaultLotDescription } from 'main/sentient-sims/descriptions/locationDescriptions';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { mockApiContext } from './util';

// V-6: a generated default may only ever FILL a hole. These tests pin the two rules that
// keep it from stepping on the player: never overwrite an existing description, and never
// fire twice for the same entity.

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// The service only ever touches ai + settings + the two repositories, so a stub context
// keeps these tests off the (Electron-built) sqlite binding.
function stubContext(answer: string) {
  const calls: string[] = [];
  const prompts: string[] = [];
  const participants = new Map<string, string>();
  const locations = new Map<number, string>();
  const settings = { generatedDefaultDescriptions: true };
  const ctx = {
    settings,
    ai: {
      runOneShot: (label: string, _system: string, userText: string) => {
        calls.push(label);
        prompts.push(userText);
        return Promise.resolve({ exchange: {}, text: answer });
      },
    },
    participantRepository: {
      setDescriptionIfEmpty: (id: string, description: string) => {
        if (participants.has(id)) {
          return false;
        }
        participants.set(id, description);
        return true;
      },
    },
    locationRepository: {
      setDescriptionIfGeneric: (location: LocationEntity, description: string) => {
        locations.set(location.id, description);
        return true;
      },
    },
  } as unknown as ApiContext;
  return { ctx, settings, calls, prompts, participants, locations };
}

function loadedContext(saveId: string) {
  const ctx = mockApiContext();
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
  ctx.db.loadDatabase({ sessionId: `dd-${saveId}`, saveId });
  return ctx;
}

function sim(simId: string, name: string): SentientSim {
  return {
    sim_id: simId,
    name,
    age: 4,
    gender: 'female',
    traits: [],
    moods: [],
  } as unknown as SentientSim;
}

describe('DefaultDescriptionService', () => {
  it('setDescriptionIfEmpty fills a hole but never overwrites', () => {
    const ctx = loadedContext('1');
    const id = '9001';

    expect(ctx.participantRepository.setDescriptionIfEmpty(id, 'generated one', 'Milo Test')).toBeTruthy();
    expect(ctx.participantRepository.getParticipant({ id, fullName: 'Milo Test' }).description).toEqual(
      'generated one',
    );

    // A second generation landing later must not clobber what is now there
    expect(ctx.participantRepository.setDescriptionIfEmpty(id, 'generated two', 'Milo Test')).toBeFalsy();
    expect(ctx.participantRepository.getParticipant({ id, fullName: 'Milo Test' }).description).toEqual(
      'generated one',
    );
  });

  // Fix B: a description is written once and never revised, so a sim who has aged twice is
  // still introduced to every scene as a teenager. Refreshing one means clearing it, and
  // the only thing standing between that and deleting the player's own writing is this flag.
  it('clears a description it generated, and never one a person wrote', () => {
    const ctx = loadedContext('3');

    ctx.participantRepository.setDescriptionIfEmpty('9101', 'a machine wrote this', 'Generated Sim');
    expect(ctx.participantRepository.clearGeneratedDescription('9101')).toBe(true);
    expect(ctx.participantRepository.getParticipant({ id: '9101', fullName: 'Generated Sim' }).description).toBeFalsy();

    ctx.participantRepository.updateParticipant({ id: '9102', description: 'the player wrote this', name: 'Own Sim' });
    expect(ctx.participantRepository.clearGeneratedDescription('9102')).toBe(false);
    expect(ctx.participantRepository.getParticipant({ id: '9102', fullName: 'Own Sim' }).description).toEqual(
      'the player wrote this',
    );

    // Clearing is idempotent: nothing to clear the second time
    expect(ctx.participantRepository.clearGeneratedDescription('9101')).toBe(false);
  });

  it('stops treating a description as generated once a person edits it', () => {
    const ctx = loadedContext('4');
    ctx.participantRepository.setDescriptionIfEmpty('9201', 'a machine wrote this', 'Edited Sim');

    ctx.participantRepository.updateParticipant({
      id: '9201',
      description: 'the player rewrote it',
      name: 'Edited Sim',
    });

    expect(ctx.participantRepository.clearGeneratedDescription('9201')).toBe(false);
    expect(ctx.participantRepository.getParticipant({ id: '9201', fullName: 'Edited Sim' }).description).toEqual(
      'the player rewrote it',
    );
  });

  it('keeps the generated flag when only the name is refreshed', () => {
    // getParticipant rewrites the row whenever it learns a sim's real name, and the old
    // INSERT OR REPLACE dropped the flag every time it did
    const ctx = loadedContext('5');
    ctx.participantRepository.setDescriptionIfEmpty('9301', 'a machine wrote this', 'Sim 9301');

    ctx.participantRepository.updateParticipant({
      id: '9301',
      description: 'a machine wrote this',
      name: 'Renamed Sim',
    });

    expect(ctx.participantRepository.clearGeneratedDescription('9301')).toBe(true);
  });

  it('describes a sim again after its description is cleared', () => {
    const { ctx, calls } = stubContext('A steady presence who keeps the household running.');
    const service = new DefaultDescriptionService(ctx);

    service.considerSim(sim('7101', 'Aging Sim'));
    service.considerSim(sim('7101', 'Aging Sim'));
    expect(calls).toHaveLength(1);

    // Without this the description would be cleared and never rewritten in this app run
    service.forget('7101');
    service.considerSim(sim('7101', 'Aging Sim'));
    expect(calls).toHaveLength(2);
  });

  it('setDescriptionIfGeneric replaces only the stock lot description', () => {
    const ctx = loadedContext('2');
    const generic: LocationEntity = {
      id: 424242,
      name: 'the home',
      lot_type: 'Residence',
      description: defaultLotDescription,
      is_generic: true,
    };

    expect(ctx.locationRepository.setDescriptionIfGeneric(generic, 'a sunlit bungalow', 'Garden Essence')).toBeTruthy();
    const stored = ctx.locationRepository.getLocation({ id: 424242 });
    expect(stored.description).toEqual('a sunlit bungalow');
    expect(stored.name).toEqual('Garden Essence');

    expect(ctx.locationRepository.setDescriptionIfGeneric(generic, 'something else', 'Garden Essence')).toBeFalsy();
    expect(ctx.locationRepository.getLocation({ id: 424242 }).description).toEqual('a sunlit bungalow');
  });

  it('generates once per sim, skips described sims, and honours the setting', async () => {
    const { ctx, settings, calls, participants } = stubContext('A steady presence who keeps the household running.');
    const service = new DefaultDescriptionService(ctx);

    // Already described: nothing queued
    service.considerSim(sim('7001', 'Described Sim'), 'the player wrote this');
    expect(calls).toHaveLength(0);

    service.considerSim(sim('7002', 'Blank Sim'));
    service.considerSim(sim('7002', 'Blank Sim'));
    await flush();
    expect(calls).toEqual(['Default Description: Blank Sim']);
    expect(participants.get('7002')).toEqual('A steady presence who keeps the household running.');

    settings.generatedDefaultDescriptions = false;
    service.considerSim(sim('7003', 'Off Sim'));
    await flush();
    expect(calls).toHaveLength(1);
  });

  it('only describes a location while it is still generic', async () => {
    const { ctx, calls, locations } = stubContext('A cramped starter home with a stubbornly broken sink.');
    const service = new DefaultDescriptionService(ctx);

    service.considerLocation(
      { id: 515151, name: 'the home', lot_type: 'Residence', description: 'already written', is_generic: false },
      undefined,
      'Garden Essence',
    );
    expect(calls).toHaveLength(0);

    service.considerLocation(
      { id: 515152, name: 'the home', lot_type: 'Residence', description: defaultLotDescription, is_generic: true },
      { venue: 'venue_residential', is_home: true, owned: { computer: 1 } },
      'Garden Essence',
    );
    await flush();
    expect(calls).toEqual(['Default Description: Garden Essence']);
    expect(locations.get(515152)).toEqual('A cramped starter home with a stubbornly broken sink.');
  });

  it('feeds the lot facts, not the stock text, to the generator', async () => {
    const { ctx, prompts } = stubContext('A tidy little place that always smells of coffee.');
    const service = new DefaultDescriptionService(ctx);

    service.considerLocation(
      { id: 616161, name: 'the home', lot_type: 'Residence', description: defaultLotDescription, is_generic: true },
      {
        venue: 'venue_residential',
        is_home: true,
        owned: { computer: 2 },
        conditions: [{ object_id: '1', name: 'Sink', conditions: ['broken'] }],
        situations: ['house party'],
      },
      'Garden Essence',
    );
    await flush();

    expect(prompts[0]).toContain('Garden Essence');
    expect(prompts[0]).toContain('venue_residential');
    expect(prompts[0]).toContain('computer x2');
    expect(prompts[0]).toContain('Sink is broken');
    expect(prompts[0]).toContain('house party');
    expect(prompts[0]).not.toContain(defaultLotDescription);
  });

  it('drops an answer too short to be a description', async () => {
    const { ctx, participants } = stubContext('ok');
    const service = new DefaultDescriptionService(ctx);
    service.considerSim(sim('7004', 'Terse Sim'));
    await flush();
    expect(participants.size).toEqual(0);
  });
});
