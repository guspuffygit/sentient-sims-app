import {
  countSentences,
  lotFacts,
  lotHasFacts,
  lotTypeLabel,
  orderDrafts,
  placeDescriptionProblems,
  venueKind,
} from 'main/sentient-sims/util/lotDescription';
import { defaultLotDescription } from 'main/sentient-sims/descriptions/locationDescriptions';
import { LocationEntity } from 'main/sentient-sims/db/entities/LocationEntity';
import { LotRoom } from 'main/sentient-sims/models/SimStateReport';

// The facts and the gate behind a generated lot description. Every rule here traces to a row
// the first version wrote into the save (2026-10-12) and to the trial that replaced it.

const genericRow: LocationEntity = {
  // A lot the neighborhood table does not know
  id: 999,
  name: 'the home',
  lot_type: 'Residence',
  description: defaultLotDescription,
  is_generic: true,
};

describe('lotFacts', () => {
  it('writes the kind of place in plain words and the furnishings as kinds, never counts', () => {
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
        'Furnished with: computers, bookshelves, a piano, easels',
      ].join('\n'),
    );
    // The moment and a home's bathroom never reach the writer
    expect(facts).not.toContain('Situation');
    expect(facts).not.toContain('restrooms');
    expect(facts).not.toContain('Residence');
  });

  it('calls a gym a gym and never repeats the Residence placeholder beside it', () => {
    const facts = lotFacts(
      { ...genericRow, id: 2841378864 },
      {
        venue: 'venue_gym',
        owned: { shower: 4, toilet: 4, bookshelf: 2, stereo: 1 },
        furnishings: [
          'object_shower_public',
          'object_toilet_stall',
          'object_Locker_GP01',
          'swimmingPool',
          'object_Mailbox',
        ],
        floors: [0, 1],
        music: ['StereoStation_Pop'],
        world_name: 'Del Sol Valley',
        situations: ['Situation_VenueGeneric'],
      },
      'Pectoral Fitness',
    );
    expect(facts).toEqual(
      [
        'Name: Pectoral Fitness',
        'Kind of place: a gym',
        'Neighborhood: Starlight Boulevard, Del Sol Valley',
        'Floors: two stories',
        'Furnished with: a swimming pool, lockers, showers, restrooms',
        'The speakers play: Pop',
      ].join('\n'),
    );
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
      ['Name: Campground', 'Kind of place: Campground', 'Furnished with: nothing notable beyond the basics'].join('\n'),
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
    expect(
      placeDescriptionProblems(
        'Planet Honey Pop! is a karaoke bar in San Myshuno. It has a bar. Upstairs are karaoke rooms. It is lively.',
        'venue_karaoke',
      ),
    ).toEqual([]);
    // Four sentences on the mountain, not five
    expect(
      placeDescriptionProblems('A bar on Mt. Komorebi. It has a bar. It has tables. It has a view.', 'venue_bar'),
    ).toEqual([]);
  });
});

describe('lotTypeLabel', () => {
  it('names the venue the way the Lot Type column does', () => {
    expect(lotTypeLabel('venue_residential')).toEqual('Residence');
    expect(lotTypeLabel('venue_cafe')).toEqual('Café');
    expect(lotTypeLabel('venue_RecCenter')).toEqual('Recreation Center');
    expect(lotTypeLabel('venue_residential_TinyHome')).toEqual('Tiny Home Residence');
    expect(lotTypeLabel('venue_retail')).toEqual('Retail');
    expect(lotTypeLabel('venue_ForestPark')).toEqual('National Park');
    expect(lotTypeLabel('venue_ChaletGardens')).toEqual('Chalet Gardens');
    expect(lotTypeLabel('venue_library')).toEqual('Library');
    expect(lotTypeLabel('venue_karaoke')).toEqual('Karaoke Bar');
    expect(lotTypeLabel('venue_rentable_cabin')).toEqual('Vacation Rental');
    expect(lotTypeLabel('venue_dance_hall')).toEqual('Dance Hall');
  });
});

describe('lotFacts from the zone record', () => {
  it('passes the blurb, the bedroom and bathroom counts and the lot traits to the writer', () => {
    const facts = lotFacts(
      genericRow,
      {
        venue: 'venue_residential',
        owned: {},
        description: 'This cozy home is perfect for a small family.',
        bedrooms: 2,
        bathrooms: 1,
        lot_traits: ['Great Acoustics', 'Homey'],
      },
      '13 Acacia Avenue',
    );
    expect(facts).toEqual(
      [
        'Name: 13 Acacia Avenue',
        'Kind of place: a private home',
        'The game describes it as: This cozy home is perfect for a small family.',
        'Bedrooms: 2, bathrooms: 1',
        'Lot traits: Great Acoustics (the acoustics are perfect, a good place to play music), Homey (a homey feel that suits cooking, fixing things and gardening)',
      ].join('\n'),
    );
  });

  it('keeps bedroom counts off a venue and says nothing for an older mod build', () => {
    expect(
      lotFacts(genericRow, { venue: 'venue_gym', owned: {}, bedrooms: 0, bathrooms: 2 }, 'Pectoral Fitness'),
    ).toEqual(['Name: Pectoral Fitness', 'Kind of place: a gym'].join('\n'));
    expect(lotFacts(genericRow, { venue: 'venue_gym', owned: {} }, 'Pectoral Fitness')).not.toContain('describes');
  });
});

describe('lotFacts with rooms (mod builds from 2026-10-17)', () => {
  const home = { ...genericRow, id: 29017407 };

  it('writes a line per room floor, the rooms named from what is in them', () => {
    const facts = lotFacts(
      home,
      {
        venue: 'venue_residential',
        is_home: true,
        bedrooms: 2,
        bathrooms: 1,
        furnishings: ['object_fridge', 'object_barstool', 'object_bedDouble', 'object_punchingBag', 'object_toilet'],
        floor_furnishings: {
          '0': ['object_fridge', 'object_barstool', 'object_grill'],
          '1': ['object_bedDouble', 'object_punchingBag', 'object_toilet'],
        },
        rooms: [
          { level: 0, room: 0, outdoors: true, kinds: { object_grill: 1, object_easel: 1 } },
          {
            level: 0,
            room: 4,
            outdoors: false,
            kinds: { object_fridge: 1, object_barstool: 3, object_CoffeeMaker: 1 },
          },
          { level: 1, room: 7, outdoors: false, kinds: { object_bedDouble: 1, object_punchingBag: 1 } },
          { level: 1, room: 8, outdoors: false, kinds: { object_toilet: 1, object_shower: 1 } },
        ],
      },
      'Calle de la Promesa',
    );
    expect(facts).toContain('Floors: two stories');
    expect(facts).toContain(
      'Main floor: a kitchen with bar stools and a coffee maker; outside: a patio with an easel and a grill',
    );
    expect(facts).toContain('Second floor: a bedroom with a punching bag');
    expect(facts).not.toContain('a bathroom');
    expect(facts).toContain('Bedrooms: 2, bathrooms: 1');
    expect(facts).not.toContain('a bar');
    expect(facts).not.toContain('easels');
  });

  it('writes one Rooms line for a single story with named rooms, and a flat list for a lot with none', () => {
    const rooms: LotRoom[] = [
      { level: 0, room: 0, outdoors: true, kinds: { object_grill: 1 } },
      {
        level: 0,
        room: 4,
        outdoors: false,
        kinds: { object_stove: 1, object_sofa: 1, object_tv: 1, object_tableDining: 1 },
      },
    ];
    expect(lotFacts(home, { venue: 'venue_residential', rooms }, 'Tiny')).toContain(
      'Rooms: an open-plan kitchen and living room with a sofa, a TV and a dining table; outside: a patio with a grill',
    );
    const park = lotFacts(
      { ...genericRow, id: 562561093 },
      {
        venue: 'venue_Generic',
        venue_type: 'venue_ForestPark',
        rooms: [{ level: 0, room: 0, outdoors: true, kinds: { object_sitLove_parkWood: 4, object_picnicTable: 2 } }],
      },
      'Ward Park',
    );
    expect(park).toContain('Furnished with: benches, picnic tables');
    expect(park).not.toContain('Rooms:');
    expect(park).not.toContain('patio');
  });

  it("reads traits by their panel names with a clause each, a mod's without its creator prefix, and sets the lot challenges apart", () => {
    const facts = lotFacts(
      home,
      {
        venue: 'venue_residential',
        lot_traits: [
          'zoneModifier_lotTrait_GreatAcoustics',
          'zoneModifier_lotTrait_FreshAir',
          'TURBODRIVER:WickedWhims_ZoneModifier_LotTrait_Nudity_CasualNudity',
          'zoneModifier_lotTrait_BurglarTime',
          'zoneModifiers_lotTrait_CelebrityHomeLotTrait',
        ],
        lot_challenges: ['zoneModifier_lotTrait_BurglarTime'],
      },
      'Calle de la Promesa',
    );
    expect(facts).toContain(
      'Lot traits: Great Acoustics (the acoustics are perfect, a good place to play music), Bracing Breezes (oodles of fresh air, bracing for exercise), Casual Nudity, Celebrity Home (a celebrity home on the tour routes, with restricted access at the door); lot challenges: Heist Havoc (burglars like this lot, and the alarms have a mind of their own)',
    );
    expect(facts).not.toContain('zone Modifiers');
    // A challenge only the mod flagged, and one only the table knows
    expect(
      lotFacts(home, { venue: 'venue_residential', lot_traits: ['x_Quirk'], lot_challenges: ['x_Quirk'] }, 'Lot'),
    ).toContain('Lot challenges: x Quirk');
    expect(
      lotFacts(home, { venue: 'venue_residential', lot_traits: ['zoneModifier_lotTrait_Gremlins'] }, 'Lot'),
    ).toContain('Lot challenges: Gremlins (things break overnight, as if tiny goblins came out after dark)');
  });
});

describe('lotFacts neighborhood', () => {
  it("names a shipped lot's neighborhood, and a lot the table does not know by the reported world", () => {
    const blueVelvet = { ...genericRow, id: 90369424 };
    expect(lotFacts(blueVelvet, { venue: 'venue_bar' }, 'The Blue Velvet')).toContain(
      'Neighborhood: Crawdad Quarter, Willow Creek',
    );
    expect(lotFacts(genericRow, { venue: 'venue_bar', world_name: 'San Myshuno' }, 'New Bar')).toContain(
      'World: San Myshuno',
    );
  });
});

describe('lotFacts at a park whose active venue is Generic (Ward Park, 2026-10-16)', () => {
  const wardPark = { ...genericRow, id: 562561093 };

  it('names the lot type it is set to, calls its seating benches, and says nothing of one story', () => {
    const facts = lotFacts(
      wardPark,
      {
        venue: 'venue_Generic',
        venue_type: 'venue_ForestPark',
        furnishings: ['object_sitLove_parkWood', 'object_picnicTable', 'object_Trashcan_Outdoor_NoLid'],
        floor_furnishings: { '0': ['object_sitLove_parkWood', 'object_picnicTable'] },
        lot_traits: [
          'lotTrait_Generic_PeaceAndQuiet',
          'zoneModifier_lotTrait_FreshAir',
          'zoneModifier_pro_Quiet',
          'zoneModifier_PetWorld_CatFriendly',
        ],
      },
      'Ward Park',
    );
    expect(facts).toContain('Kind of place: a national park');
    expect(facts).toContain('Furnished with: benches, picnic tables');
    expect(facts).not.toContain('sofas');
    expect(facts).not.toContain('Floors');
    expect(facts).toContain(
      'Lot traits: Peace and Quiet (peaceful, good for reading; tension drains away), Bracing Breezes (oodles of fresh air, bracing for exercise), Quiet (never noisy, whatever the neighbors do), Cat Friendly (cats and their owners come by)',
    );
  });

  it('leaves the kind of place out when the only venue reported is Generic', () => {
    expect(lotFacts(wardPark, { venue: 'venue_Generic', owned: { bed: 0 } }, 'Ward Park')).not.toContain('Generic');
  });
});

describe('orderDrafts', () => {
  it('counts sentences the way the gate does', () => {
    expect(countSentences('A gym in Mt. Komorebi. Treadmills fill it. Planet Honey Pop! is next door.')).toBe(3);
    expect(countSentences('')).toBe(0);
  });

  it('puts first-try passes first, then the card closest to four sentences, then as written', () => {
    const one = 'One. Two.';
    const four = 'One. Two. Three. Four.';
    const three = 'One. Two. Three.';
    const ordered = orderDrafts([
      { text: one, attempt: 1 },
      { text: four, attempt: 2 },
      { text: three, attempt: 1 },
      { text: three, attempt: 1, later: true },
    ]);
    expect(ordered.map((draft) => draft.text)).toEqual([three, three, one, four]);
    expect(ordered[0]).not.toHaveProperty('later');
  });
});
