import { lotFacts, lotHasFacts, placeDescriptionProblems, venueKind } from 'main/sentient-sims/util/lotDescription';
import { defaultLotDescription } from 'main/sentient-sims/descriptions/locationDescriptions';
import { LocationEntity } from 'main/sentient-sims/db/entities/LocationEntity';

// The facts and the gate behind a generated lot description. Every rule here traces to a row
// the first version wrote into the save (2026-10-12) and to the trial that replaced it.

const genericRow: LocationEntity = {
  id: 2703097870,
  name: 'the home',
  lot_type: 'Residence',
  description: defaultLotDescription,
  is_generic: true,
};

describe('lotFacts', () => {
  it('writes the kind of place in plain words and groups the furnishings by what they are for', () => {
    const facts = lotFacts(
      genericRow,
      {
        venue: 'venue_residential',
        is_home: false,
        owned: { easel: 3, piano: 1, bookshelf: 4, computer: 1, fridge: 1, bed: 2, toilet: 2, shower: 1, mailbox: 1 },
        conditions: [],
        situations: ['Situation_UngreetedPlayerVisitingNPC'],
      },
      '13 Acacia Avenue',
    );
    expect(facts).toEqual(
      [
        'Name: 13 Acacia Avenue',
        'Kind of place: a private home',
        'Furnished for: art (three easels); music (a piano); reading and study (four bookshelves, a computer)',
        'Sleeps: 2',
      ].join('\n'),
    );
    // The moment and the bathroom never reach the writer
    expect(facts).not.toContain('Situation');
    expect(facts).not.toContain('toilet');
    expect(facts).not.toContain('Residence');
  });

  it('calls a gym a gym and never repeats the Residence placeholder beside it', () => {
    const facts = lotFacts(
      { ...genericRow, id: 2841378864 },
      {
        venue: 'venue_gym',
        owned: { shower: 4, toilet: 4, bookshelf: 2, stereo: 1 },
        situations: ['Situation_VenueGeneric'],
      },
      'Pectoral Fitness',
    );
    expect(facts).toContain('Kind of place: a gym');
    expect(facts).not.toContain('Residence');
    expect(facts).not.toContain('Sleeps');
    expect(facts).toContain('music (a stereo); reading and study (two bookshelves)');
  });

  it('keeps a lot_type a person set, drops the repository fallback, and drops the repair state', () => {
    const hand: LocationEntity = {
      id: 1,
      name: 'Campground',
      lot_type: 'Campground',
      description: 'x',
      is_generic: false,
    };
    expect(
      lotFacts(hand, { owned: { fridge: 1 }, conditions: [{ object_id: '1', name: 'Sink', conditions: ['broken'] }] }),
    ).toEqual(
      ['Name: Campground', 'Kind of place: Campground', 'Furnished for: nothing notable beyond the basics'].join('\n'),
    );
    expect(lotFacts(genericRow, undefined)).toEqual('Name: the home');
    expect(lotFacts(genericRow, { is_home: true, owned: { bed: 1, fridge: 1 } }, 'Inner Circle')).not.toContain(
      'burnt',
    );
  });

  it('de-prefixes a venue it has no words for', () => {
    expect(venueKind('venue_rentable_cabin')).toEqual('a rentable vacation cabin');
    expect(venueKind('venue_chalet_gardens')).toEqual('chalet gardens');
  });
});

describe('lotHasFacts', () => {
  it('is false for a missing block, an empty block, or only zero counts', () => {
    expect(lotHasFacts(undefined)).toBe(false);
    expect(lotHasFacts({})).toBe(false);
    expect(lotHasFacts({ owned: { computer: 0 } })).toBe(false);
  });
  it('is true with a venue or any owned object', () => {
    expect(lotHasFacts({ venue: 'venue_park' })).toBe(true);
    expect(lotHasFacts({ owned: { bed: 1 } })).toBe(true);
  });
});

describe('placeDescriptionProblems', () => {
  it('rejects the rows that were in the save', () => {
    expect(
      placeDescriptionProblems(
        "She stands at 13 Acacia Avenue, a residence that appears to be a hub of creative activity. As she waits to be acknowledged by the home's occupant, the atmosphere feels slightly awkward.",
        'venue_residential',
      ),
    ).toEqual(['person_pov', 'present_moment']);
    expect(
      placeDescriptionProblems(
        "Mansión de la Pasión is a residence where someone is currently visiting, though they haven't been greeted yet.",
        'venue_residential',
      ),
    ).toEqual(['person_pov', 'present_moment']);
    expect(
      placeDescriptionProblems(
        'Pectoral Fitness is a residence that also serves as a gym, giving it a unique blend of living and workout spaces.',
        'venue_gym',
      ),
    ).toEqual(['venue_as_residence']);
    expect(
      placeDescriptionProblems(
        'Media Naranja is a residential park where people can come to relax and unwind.',
        'venue_park',
      ),
    ).toEqual(['venue_as_residence']);
  });

  it('passes the texts the trial judged clean, including the two regex false positives it found', () => {
    expect(
      placeDescriptionProblems(
        'Pectoral Fitness is a gym. The gym is equipped with a stereo, and two bookshelves line the walls. Weightlifting equipment and exercise machines are situated throughout the space.',
        'venue_gym',
      ),
    ).toEqual([]);
    // An easel stands; nobody does
    expect(
      placeDescriptionProblems(
        "Gringle's is a bar. The space contains a bookshelf filled with volumes, and a guitar is available near a pair of stereos. A easel stands in one area, accompanied by art supplies.",
        'venue_bar',
      ),
    ).toEqual([]);
    // A home described as a residential lot is a home
    expect(
      placeDescriptionProblems(
        "Yuma Heights is a private home, a residential lot that serves as the household's own home. The space is furnished with a piano for music and two computers situated near three bookshelves.",
        'venue_residential',
      ),
    ).toEqual([]);
    // Generic people are fine; a present person is not
    expect(
      placeDescriptionProblems(
        'SUDOR is a gym where people come to work out. A stereo plays over the floor.',
        'venue_gym',
      ),
    ).toEqual([]);
  });

  it('rejects an answer that is not 1-4 sentences', () => {
    expect(placeDescriptionProblems('', 'venue_gym')).toEqual(['length']);
    expect(placeDescriptionProblems('One. Two. Three. Four. Five.', 'venue_gym')).toEqual(['length']);
  });
});
