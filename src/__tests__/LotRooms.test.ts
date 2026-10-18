import { LotRoom } from 'main/sentient-sims/models/SimStateReport';
import { classifyRoom, floorRoomsPhrase, mergedKinds, roomLevels, roomLines } from 'main/sentient-sims/util/lotRooms';

// Rooms named from what is in them. The fixture is Calle de la Promesa as the writer should
// have seen it on 2026-10-17: the flat floor list had read its kitchen island as "a bar", one
// easel as "easels" and a bedroom with a punching bag as "a workout area".

const home = { isHome: true };
const venue = { isHome: false };

const room = (level: number, id: number | null, kinds: Record<string, number>, outdoors = false): LotRoom => ({
  level,
  room: id,
  outdoors,
  kinds,
});

const callePromesa: LotRoom[] = [
  room(
    0,
    0,
    {
      object_grill_basic: 1,
      object_tableDining_outdoor: 1,
      object_chair_dining_folding: 4,
      object_easel: 1,
      object_GardeningSoil: 3,
      object_Urnstone_Float: 2,
      object_sculpture_small: 1,
    },
    true,
  ),
  room(0, 11, {
    object_fridge_basic: 1,
    object_sink_kitchen: 1,
    object_CoffeeMaker_Low: 1,
    object_counter_island: 2,
    object_barstool_modern: 3,
    object_tableDining: 1,
    object_chair_dining: 4,
  }),
  room(0, 12, {
    object_sofa_modern: 2,
    object_armchair_modern: 2,
    object_tv_wall: 1,
    object_tableCoffee: 1,
    object_bookshelf_short: 1,
    object_speaker_wall: 2,
    object_painting_landscape: 3,
  }),
  room(1, 21, {
    object_bedDouble: 1,
    object_desk_basic: 1,
    object_computer_desktop: 1,
    object_punchingBag: 1,
    object_dresser: 1,
  }),
  room(1, 22, { object_bedSingle: 1, object_TableNightstand: 1 }),
  room(1, 23, { object_toilet_basic: 1, object_shower_tub: 1, object_sink_bath: 1 }),
  room(1, 24, { object_bookshelf_tall: 4, object_desk_basic: 1, object_speaker_wall: 1 }),
  room(2, 31, { object_bedDouble: 1, object_painting_portrait: 2 }),
  room(2, 32, { object_telescope: 1, object_chessTable: 1 }),
  room(3, 0, { object_vent_roof: 2 }, true),
];

describe('classifyRoom', () => {
  it('reads a kitchen from its appliances, not a bar from its stools', () => {
    const kitchen = classifyRoom(callePromesa[1].kinds, home);
    expect(kitchen.label).toEqual(['a kitchen', 'kitchens']);
  });

  it('keeps a bedroom a bedroom whatever else is in it', () => {
    expect(classifyRoom(callePromesa[3].kinds, home).label?.[0]).toBe('a bedroom');
    expect(classifyRoom({ object_bedDouble: 1, object_sofa: 1, object_tv: 1 }, home).label?.[0]).toBe('a bedroom');
    expect(classifyRoom({ object_bedsideTable: 1, object_sofa: 1 }, home).label).toBeUndefined();
  });

  it('tells an open-plan kitchen, a living room, a study and a library apart', () => {
    expect(classifyRoom({ object_stove: 1, object_sofa: 1, object_tableCoffee: 1 }, home).label?.[0]).toBe(
      'an open-plan kitchen and living room',
    );
    expect(classifyRoom({ object_sofa: 1, object_tv: 1, object_desk: 1 }, home).label?.[0]).toBe('a living room');
    expect(classifyRoom({ object_desk: 1, object_computer: 1, object_bookshelf: 1 }, home).label?.[0]).toBe('a study');
    expect(classifyRoom({ object_bookshelf: 3, object_armchair: 1 }, home).label?.[0]).toBe('a library');
    expect(classifyRoom({ object_bookshelf: 2, object_armchair: 1 }, home).label).toBeUndefined();
  });

  it('names bathrooms by the lot: a home bathroom, a venue restroom, a locker room with its showers kept', () => {
    expect(classifyRoom({ object_toilet: 1 }, home).label?.[0]).toBe('a bathroom');
    expect(classifyRoom({ object_toilet: 2 }, venue).label?.[0]).toBe('a restroom');
    expect(classifyRoom({ object_toilet: 1, object_shower: 1 }, venue).label?.[0]).toBe('a bathroom');
    const lockers = classifyRoom({ object_Locker_GP01: 8, object_shower_gym: 3 }, venue);
    expect(lockers.label?.[0]).toBe('a locker room');
    expect(lockers.hidden.some((signal) => signal.any.includes('shower'))).toBe(false);
  });

  it('calls a gym room by the lot and leaves the machines in view', () => {
    expect(classifyRoom({ object_treadmill: 2 }, home)).toEqual({ label: ['a home gym', 'home gyms'], hidden: [] });
    expect(classifyRoom({ object_treadmill: 2 }, venue).label?.[0]).toBe('a workout room');
    expect(classifyRoom({ object_bar_: 1, object_barstool: 4 }, venue).label?.[0]).toBe('a bar');
    expect(classifyRoom({ object_tableDining: 1, object_chair_dining: 4 }, home).label?.[0]).toBe('a dining room');
    expect(classifyRoom({ object_tableDining: 1, object_chair_dining: 4 }, venue).label?.[0]).toBe('a dining area');
  });
});

describe('floorRoomsPhrase', () => {
  it('hides what a room name already says and speaks in singular or plural, never a number', () => {
    const { text, groups, named } = floorRoomsPhrase(
      callePromesa.filter((entry) => entry.level === 0),
      home,
    );
    expect(text).toBe(
      'a kitchen with bar stools, a coffee maker, kitchen islands and a dining table; ' +
        'a living room with sofas, armchairs, a TV, a bookshelf, speakers and a coffee table; ' +
        'outside: a patio with an easel, a grill, gravestones, garden planters and a dining table',
    );
    expect(groups).toBe(3);
    expect(named).toBe(2);
  });

  it('reads the rooms that say most first, keeps a venue restroom, and drops a bare bathroom at a home', () => {
    const rooms = [
      room(0, 1, { object_toilet: 1 }),
      room(0, 2, { object_desk: 1, object_computer: 1 }),
      room(0, 3, { object_stove: 1, object_tableDining: 1 }),
      room(0, 4, { object_toilet: 1, object_hotTub: 1 }),
    ];
    expect(floorRoomsPhrase(rooms, home).text).toBe(
      'a kitchen with a dining table; a study; a bathroom with a hot tub',
    );
    expect(floorRoomsPhrase([room(0, 1, { object_toilet: 2 }), room(0, 2, { object_bar_: 1 })], venue).text).toBe(
      'a bar; a restroom',
    );
  });

  it('collapses same-name rooms to a count word and describes the ones with extras', () => {
    expect(
      floorRoomsPhrase(
        callePromesa.filter((entry) => entry.level === 1),
        home,
      ).text,
    ).toBe('two bedrooms, one with a punching bag, a computer and a desk; a library with a stereo and a desk');
  });

  it('shows a room nothing defines only when it holds two kinds, and lists no paintings at a home', () => {
    expect(
      floorRoomsPhrase(
        callePromesa.filter((entry) => entry.level === 2),
        home,
      ).text,
    ).toBe('a bedroom; a room with a chess table and a telescope');
    expect(floorRoomsPhrase([room(0, 5, { object_painting: 1 })], home)).toEqual({ text: '', groups: 0, named: 0 });
  });

  it('merges everything outdoors on a level into one place and invents no patio at a park', () => {
    const park = [
      room(0, 0, { object_sitLove_parkWood: 4, object_picnicTable: 2 }, true),
      room(0, 0, { object_fountain: 1 }, true),
    ];
    expect(floorRoomsPhrase(park, venue)).toEqual({
      text: 'outside: a fountain, benches and picnic tables',
      groups: 1,
      named: 0,
    });
    const garden = [room(0, 0, { object_GardeningSoil: 6, object_bench_garden: 1 }, true)];
    expect(floorRoomsPhrase(garden, home).text).toBe('outside: a garden with a bench');
    const pool = [room(0, 0, { object_swimmingPool: 1, object_loungeChair: 2 }, true)];
    expect(floorRoomsPhrase(pool, venue).text).toBe('outside: a pool with armchairs');
  });

  it('lists the objects whose room the game could not name without a room word', () => {
    const unknown = [room(0, null, { object_easel: 1, object_telescope: 1 })];
    expect(floorRoomsPhrase(unknown, home).text).toBe('an easel and a telescope');
    expect(floorRoomsPhrase([...unknown, room(0, 3, { object_bedDouble: 1 })], home).text).toBe(
      'a bedroom; elsewhere: an easel and a telescope',
    );
  });
});

describe('roomLines and roomLevels', () => {
  it('writes one line per room floor and leaves the roof out', () => {
    expect(roomLevels(callePromesa)).toEqual([0, 1, 2]);
    expect(roomLines(callePromesa, home)).toEqual([
      'Main floor: a kitchen with bar stools, a coffee maker, kitchen islands and a dining table; ' +
        'a living room with sofas, armchairs, a TV, a bookshelf, speakers and a coffee table; ' +
        'outside: a patio with an easel, a grill, gravestones, garden planters and a dining table',
      'Second floor: two bedrooms, one with a punching bag, a computer and a desk; a library with a stereo and a desk',
      'Third floor: a bedroom; a room with a chess table and a telescope',
    ]);
  });

  it('says nothing per floor for a single story and adds the rooms up', () => {
    const single = callePromesa.filter((entry) => entry.level === 0);
    expect(roomLines(single, home)).toEqual([]);
    expect(mergedKinds(single).object_chair_dining).toBe(4);
    expect(mergedKinds(single).object_tableDining).toBe(1);
  });
});
