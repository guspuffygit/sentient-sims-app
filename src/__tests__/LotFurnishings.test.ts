import {
  floorLines,
  floorsPhrase,
  furnishingWords,
  kindCount,
  musicWords,
  roomFloors,
  setPlayerFurnishingWords,
} from 'main/sentient-sims/util/lotFurnishings';

const venue = { isHome: false };

describe('furnishingWords', () => {
  it('names each kind once, in a fixed order, and keeps the names it has no words for', () => {
    expect(
      furnishingWords(
        [
          'object_Locker_GP01',
          'object_locker_tall',
          'object_fountain_large',
          'object_sofa_modern',
          'object_Easter_Egg',
        ],
        venue,
      ),
    ).toEqual({ words: ['lockers', 'a fountain', 'sofas'], unmapped: ['object_Easter_Egg'] });
  });

  it('reads the narrow fragment before the broad one', () => {
    expect(furnishingWords(['object_weightBench_GP01', 'object_PoolTable', 'object_bench_park'], venue).words).toEqual([
      'a pool table',
      'workout machines',
      'benches',
    ]);
  });

  it("leaves a home's showers and toilets out and keeps a venue's", () => {
    const names = ['object_shower_tub', 'object_toilet_basic', 'object_piano_upright'];
    expect(furnishingWords(names, { isHome: true }).words).toEqual(['a piano']);
    expect(furnishingWords(names, venue).words).toEqual(['showers', 'restrooms', 'a piano']);
  });

  it('calls outdoor seating benches, and never reports doors, lights, plants or effects as unknown', () => {
    expect(furnishingWords(['object_sitLove_parkWood'], { isHome: false, outdoors: true }).words).toEqual(['benches']);
    expect(
      furnishingWords(
        [
          'object_door_double',
          'object_light_wall',
          'object_plant_non_gardening_generic',
          'object_Ponds_VFXObject_Lilypad_1x1',
        ],
        venue,
      ).unmapped,
    ).toEqual([]);
  });

  it("reads a park's restroom building as a restroom (Hanamigawa Koen, 2026-10-18)", () => {
    expect(furnishingWords(['object_PublicBathroom_EP10GEN'], venue)).toEqual({ words: ['restrooms'], unmapped: [] });
  });

  it('knows the lounge and gym pieces seen at Studio PBP and Pectoral Fitness (2026-10-16)', () => {
    expect(
      furnishingWords(
        ['object_barProC4x1_01', 'object_Door_VIPRope', 'lighting_Spotlight', 'objcet_tableCoffee'],
        venue,
      ).words,
    ).toEqual(['a velvet rope at the door', 'stage lights', 'a bar', 'coffee tables']);
  });

  it('knows the furnishings main.log listed with no plain words (2026-10-17)', () => {
    const names = [
      'object_bar',
      'object_triviaBox',
      'object_CoffeeMaker_Low',
      'object_stove_electric',
      'object_stoveHood',
      'object_Urnstone_Float',
      'object_GardeningSoil',
      'object_bonsai',
      'object_CostumeBox',
      'object_Ottoman',
      'object_bathtub_EP10BATHboxy',
      'object_dresser_StandardRoute',
      'object_TableNightstand',
    ];
    expect(furnishingWords(names, venue)).toEqual({
      words: [
        'a bar',
        'a trivia box',
        'a coffee maker',
        'a kitchen',
        'gravestones',
        'garden planters',
        'a bonsai tree',
        'a costume trunk',
        'ottomans',
        'a bathtub',
        'dressers',
        'nightstands',
      ],
      unmapped: [],
    });
    expect(furnishingWords(names, { isHome: true }).words).not.toContain('a kitchen');
    expect(furnishingWords(['object_barrel_wine'], venue).words).toEqual([]);
  });

  it('speaks in the singular or the plural by count, and in the plural when it has no counts', () => {
    expect(
      furnishingWords(
        { object_easel: 1, object_Locker_GP01: 8, object_locker_tall: 3, object_sofa_a: 1, object_sofa_b: 1 },
        venue,
      ).words,
    ).toEqual(['lockers', 'sofas', 'an easel']);
    expect(furnishingWords({ object_sitLove_parkWood: 1 }, { isHome: false, outdoors: true }).words).toEqual([
      'a bench',
    ]);
    expect(furnishingWords(['object_easel'], venue).words).toEqual(['easels']);
    expect(furnishingWords({ object_bathtub: 1, object_piano: 1 }, { isHome: true }).words).toEqual(['a piano']);
  });

  it('files dining chairs with their table, never as a kind of their own', () => {
    expect(furnishingWords(['object_chair_dining', 'object_sitDining_01'], venue)).toEqual({ words: [], unmapped: [] });
    expect(furnishingWords({ object_tableDining: 1, object_chair_dining: 6 }, venue).words).toEqual(['a dining table']);
  });

  it('never reports alarms, gates, ladders or a closet as unknown', () => {
    expect(
      furnishingWords(
        [
          'fire_alarm',
          'object_gate',
          'object_buildLadders',
          'object_closetVenue',
          'object_fire_ash',
          'object_tableGeneric',
        ],
        venue,
      ).unmapped,
    ).toEqual([]);
  });
});

// The dev build's Lot Words panel: a player's words for an exact tuning name win over the table
describe('player furnishing words', () => {
  afterEach(() => {
    setPlayerFurnishingWords({});
  });

  it('words a name the table does not know, singular or plural by count, after the table', () => {
    setPlayerFurnishingWords({ object_dish_stack: { one: 'a dish rack', many: 'dish racks' } });
    expect(furnishingWords({ object_piano: 1, object_Dish_Stack: 3 }, venue)).toEqual({
      words: ['a piano', 'dish racks'],
      unmapped: [],
    });
    expect(furnishingWords({ object_dish_stack: 1 }, venue).words).toEqual(['a dish rack']);
    expect(kindCount(['object_dish_stack', 'object_piano'])).toBe(2);
  });

  it('says nothing about a name left out, even one the table knows', () => {
    setPlayerFurnishingWords({ object_dish_stack: null, object_bench_park: null });
    expect(furnishingWords(['object_dish_stack', 'object_bench_park', 'object_piano'], venue)).toEqual({
      words: ['a piano'],
      unmapped: [],
    });
  });

  it('adds to the table kind a player word repeats', () => {
    setPlayerFurnishingWords({ object_tikiBar: { one: 'a bar', many: 'bars' } });
    expect(furnishingWords({ object_tikiBar: 1, object_bar_EP07: 1 }, venue).words).toEqual(['bars']);
  });
});

describe('roomFloors', () => {
  it('counts a level only when it holds real furnishings, not a roof of vents', () => {
    expect(
      roomFloors({
        '0': ['swimmingPool', 'object_Locker_GP01', 'object_light_wall'],
        '1': ['object_treadmill', 'object_punchingBag', 'object_computer_desk'],
        '2': ['object_vent_roof', 'object_light_wall'],
        '3': ['object_duct_exhaust', 'object_sitDining_01'],
      }),
    ).toEqual([0, 1]);
  });
});

describe('floorsPhrase', () => {
  it('counts the stories above ground, names a basement, and says nothing for a single story', () => {
    expect(floorsPhrase([0])).toBeUndefined();
    expect(floorsPhrase([0, 1])).toEqual('two stories');
    expect(floorsPhrase([-1, 0, 1])).toEqual('two stories and a basement');
    expect(floorsPhrase(undefined)).toBeUndefined();
  });
});

describe('floorLines', () => {
  it('lists what is on each room floor of a lot with more than one', () => {
    expect(
      floorLines(
        {
          '0': ['swimmingPool', 'object_Locker_GP01'],
          '1': ['object_treadmill', 'object_punchingBag'],
          '2': ['object_vent_roof'],
        },
        venue,
      ),
    ).toEqual(['Main floor: a swimming pool, lockers', 'Second floor: treadmills, punching bags']);
    expect(floorLines({ '0': ['object_bench_park', 'object_fountain'] }, venue)).toEqual([]);
  });
});

describe('musicWords', () => {
  it('reads the station off the state name', () => {
    expect(musicWords(['StereoStation_Retro', 'Stereo_Station_Retro', 'StereoStation_Off'])).toEqual(['Retro']);
    expect(musicWords(['StereoChannel_Lullabies', 'StereoChannel_ElectronicaDance'])).toEqual([
      'Lullabies',
      'Electronica Dance',
    ]);
  });
});
