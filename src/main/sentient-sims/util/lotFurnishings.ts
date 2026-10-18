// The mod reports what a lot is furnished with as object tuning names (object_Locker_GP01,
// object_fountain_large), per floor and per room with counts, and the stereo stations. This
// turns them into the plain words the description writer gets: singular or plural by count,
// never a number ("an easel", "lockers", not "eleven lockers"). A bare list of names (older
// mod builds) carries no counts and reads each kind as a lot usually has it.

// [name fragments, one, many]. First match wins, so the narrow fragments come first
// ("weightbench" before "bench", "pooltable" before "pool", "barstool" before "bar"). A
// fragment ending in $ has to end the name ("object_bar", never "object_barrel").
const FURNISHING_WORDS: Array<[string[], string, string]> = [
  [['pooltable', 'billiard'], 'a pool table', 'pool tables'],
  [['hottub'], 'a hot tub', 'hot tubs'],
  [['swimmingpool', 'pool'], 'a swimming pool', 'swimming pools'],
  [['treadmill'], 'a treadmill', 'treadmills'],
  [['weightbench', 'workout', 'exercise', 'weightmachine', 'ellipt'], 'a workout machine', 'workout machines'],
  [['punchingbag', 'boxingbag'], 'a punching bag', 'punching bags'],
  [['climbingwall', 'rockclimb'], 'a climbing wall', 'climbing walls'],
  [['yogamat', 'yoga'], 'a yoga mat', 'yoga mats'],
  [['locker'], 'a locker', 'lockers'],
  [['sauna'], 'a sauna', 'saunas'],
  [['massage'], 'a massage table', 'massage tables'],
  [['shower'], 'a shower', 'showers'],
  [['toilet', 'urinal', 'publicbathroom'], 'a restroom', 'restrooms'],
  [['fountain'], 'a fountain', 'fountains'],
  [['viprope', 'velvetrope'], 'a velvet rope at the door', 'velvet ropes at the door'],
  [['spotlight', 'stagelight'], 'a stage light', 'stage lights'],
  [['bench'], 'a bench', 'benches'],
  [['sofa', 'couch', 'loveseat', 'sectional', 'sitlove'], 'a sofa', 'sofas'],
  [['armchair', 'chairliving', 'livingchair', 'loungechair', 'chairlounge', 'sitliving'], 'an armchair', 'armchairs'],
  [['barstool'], 'a bar stool', 'bar stools'],
  [['bartend', 'object_bar_', 'object_bar$', 'barpro', 'barcounter', 'minibar'], 'a bar', 'bars'],
  [['triviabox'], 'a trivia box', 'trivia boxes'],
  [['coffeemaker', 'espresso'], 'a coffee maker', 'coffee makers'],
  [['counterisland', 'counter_island', 'kitchenisland'], 'a kitchen island', 'kitchen islands'],
  [['stove', 'oven'], 'a kitchen', 'a kitchen'],
  [['television', 'object_tv'], 'a TV', 'TVs'],
  [['computer'], 'a computer', 'computers'],
  [['bookshelf', 'bookcase'], 'a bookshelf', 'bookshelves'],
  [['chess'], 'a chess table', 'chess tables'],
  [['piano'], 'a piano', 'pianos'],
  [['guitar'], 'a guitar', 'guitars'],
  [['violin'], 'a violin', 'violins'],
  [['drum'], 'a drum kit', 'drum kits'],
  [['djbooth', 'djmixer'], 'a DJ booth', 'DJ booths'],
  [['karaoke', 'microphone'], 'a microphone stand', 'microphone stands'],
  [['jukebox'], 'a jukebox', 'jukeboxes'],
  [['musicproduction'], 'a music production station', 'music production stations'],
  [['stereo', 'speaker'], 'a stereo', 'speakers'],
  [['dancefloor'], 'a dance floor', 'a dance floor'],
  [['easel'], 'an easel', 'easels'],
  [['pottery'], 'a pottery wheel', 'pottery wheels'],
  [['painting', 'wallart'], 'a painting', 'paintings'],
  [['sculpture', 'statue'], 'a sculpture', 'sculptures'],
  [['displaycase', 'pedestal'], 'a display case', 'display cases'],
  [['telescope'], 'a telescope', 'telescopes'],
  [['microscope'], 'a microscope', 'microscopes'],
  [['chemistry'], 'a chemistry table', 'chemistry tables'],
  [['woodwork'], 'a woodworking table', 'woodworking tables'],
  [['arcade', 'pinball'], 'an arcade machine', 'arcade machines'],
  [['videogame', 'gamingconsole', 'gameconsole'], 'a game console', 'game consoles'],
  [['foosball'], 'a foosball table', 'foosball tables'],
  [['bowling'], 'a bowling lane', 'bowling lanes'],
  [['playground', 'monkeybar', 'junglegym', 'swingset'], 'a playground', 'a playground'],
  [['picnictable', 'picnic'], 'a picnic table', 'picnic tables'],
  [['grill', 'bbq', 'barbecue'], 'a grill', 'grills'],
  [['firepit', 'campfire'], 'a fire pit', 'fire pits'],
  [['fireplace'], 'a fireplace', 'fireplaces'],
  [['aquarium', 'fishtank'], 'an aquarium', 'aquariums'],
  [['gravestone', 'tombstone', 'urnstone'], 'a gravestone', 'gravestones'],
  [['planter', 'gardenplot', 'gardeningsoil'], 'a garden planter', 'garden planters'],
  [['bonsai'], 'a bonsai tree', 'bonsai trees'],
  [['costumebox', 'costumetrunk'], 'a costume trunk', 'costume trunks'],
  [['tablecoffee', 'coffeetable'], 'a coffee table', 'coffee tables'],
  [['tabledining', 'diningtable'], 'a dining table', 'dining tables'],
  [['ottoman'], 'an ottoman', 'ottomans'],
  [['desk'], 'a desk', 'desks'],
  [['bathtub'], 'a bathtub', 'bathtubs'],
  [['crib', 'bassinet'], 'a crib', 'cribs'],
  [['changingtable', 'changing_table'], 'a changing table', 'changing tables'],
  [['object_bed', 'beddouble', 'bedsingle', 'bunkbed'], 'a bed', 'beds'],
  [['dresser'], 'a dresser', 'dressers'],
  [['nightstand'], 'a nightstand', 'nightstands'],
];

// Structure, lighting and small decor: on every lot, so they say nothing about it and no
// rule needs to be written for them. Dining chairs go with their table.
const STRUCTURAL = [
  'door',
  'stairs',
  'arch',
  'light',
  'lamp',
  'rug',
  'plant',
  'flower',
  'trashcan',
  'mirror',
  'half_wall',
  'halfwall',
  'prototype',
  'sink',
  'counter',
  'book',
  'curtain',
  'tableend',
  'endtable',
  'window',
  'wall',
  'fence',
  'column',
  'railing',
  'vent',
  'duct',
  'sign',
  'clutter',
  'deco',
  'mailbox',
  'fridge',
  'trash',
  'shelf',
  'clock',
  'fire_alarm',
  'firealarm',
  'smokedetector',
  'fire_ash',
  'gate',
  'ladder',
  'closet',
  'vfx',
  'tablegeneric',
  'chair_dining',
  'diningchair',
  'sitdining',
];

// What a lot has one of as a rule, so a bare list (no counts) reads it in the singular
const USUALLY_ONE = new Set([
  'a pool table',
  'a hot tub',
  'a swimming pool',
  'a climbing wall',
  'a sauna',
  'a fountain',
  'a velvet rope at the door',
  'a bar',
  'a trivia box',
  'a coffee maker',
  'a kitchen island',
  'a kitchen',
  'a piano',
  'a violin',
  'a drum kit',
  'a DJ booth',
  'a microphone stand',
  'a jukebox',
  'a music production station',
  'a dance floor',
  'a pottery wheel',
  'a telescope',
  'a microscope',
  'a chemistry table',
  'a woodworking table',
  'a foosball table',
  'a playground',
  'a grill',
  'a fire pit',
  'a fireplace',
  'an aquarium',
  'a bonsai tree',
  'a costume trunk',
  'a bathtub',
  'a crib',
  'a changing table',
]);

// Every home has these, and paintings and sculptures hang in every room of one; on a venue
// they say what the place is for (a gym's showers, a museum's sculptures). Applied to the
// flat list and to each room alike
const HOME_BASICS = new Set([
  'a shower',
  'a restroom',
  'a bed',
  'a bathtub',
  'a kitchen',
  'a dresser',
  'a nightstand',
  'a painting',
  'a sculpture',
]);

// A level holds a room when it has at least this many kinds of real furnishing; a roof with
// vents and a stray chair does not count as a story
const MIN_ROOM_WORDS_PER_FLOOR = 2;

/** Whether a lowercased tuning name carries a fragment; a trailing $ anchors it to the end. */
export function nameMatches(lowered: string, fragment: string): boolean {
  return fragment.endsWith('$') ? lowered.endsWith(fragment.slice(0, -1)) : lowered.includes(fragment);
}

function ruleIndex(tuningName: string): number {
  const lowered = tuningName.toLowerCase();
  return FURNISHING_WORDS.findIndex(([fragments]) => fragments.some((fragment) => nameMatches(lowered, fragment)));
}

function isStructural(tuningName: string): boolean {
  const lowered = tuningName.toLowerCase();
  return STRUCTURAL.some((fragment) => lowered.includes(fragment));
}

/** The number of kinds of real furnishing among these names (structure and decor are none). */
export function kindCount(tuningNames: string[]): number {
  return new Set(tuningNames.map(ruleIndex).filter((rule) => rule >= 0)).size;
}

/** Tuning names alone (counts unknown) or tuning name -> count. */
export type FurnishingCounts = string[] | Record<string, number>;

/**
 * The plain kinds of furnishing among these tuning names, in table order, and the names no
 * rule knows (structure and small decor are neither). With counts, one of a kind reads in
 * the singular; a bare list reads as a lot usually has it. Outdoors, sofas are park benches.
 */
export function furnishingWords(
  names: FurnishingCounts | undefined,
  options: { isHome: boolean; outdoors?: boolean },
): { words: string[]; unmapped: string[] } {
  const counted = names !== undefined && !Array.isArray(names);
  const entries: Array<[string, number]> = Array.isArray(names)
    ? names.map((name) => [name, 1])
    : Object.entries(names ?? {});
  const totals = new Map<number, number>();
  const unmapped: string[] = [];
  entries.forEach(([name, count]) => {
    const rule = ruleIndex(name);
    if (rule < 0) {
      if (!isStructural(name)) {
        unmapped.push(name);
      }
      return;
    }
    totals.set(rule, (totals.get(rule) ?? 0) + count);
  });
  const words = Array.from(totals.entries())
    .sort(([a], [b]) => a - b)
    .filter(([rule]) => !(options.isHome && HOME_BASICS.has(FURNISHING_WORDS[rule][1])))
    .map(([rule, total]) => {
      const [, one, many] = FURNISHING_WORDS[rule];
      const single = counted ? total === 1 : USUALLY_ONE.has(one);
      if (options.outdoors && one === 'a sofa') {
        return single ? 'a bench' : 'benches';
      }
      return single ? one : many;
    });
  return { words: Array.from(new Set(words)), unmapped };
}

/** Whether a level's names make it a story worth mentioning. */
export function isRoomFloor(tuningNames: string[]): boolean {
  return kindCount(tuningNames) >= MIN_ROOM_WORDS_PER_FLOOR;
}

/** The levels that hold real rooms, lowest first (-1 is a basement). */
export function roomFloors(floorFurnishings: Record<string, string[]> | undefined): number[] {
  return Object.entries(floorFurnishings ?? {})
    .filter(([, names]) => isRoomFloor(names))
    .map(([level]) => Number(level))
    .sort((a, b) => a - b);
}

const COUNT_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/** "two", "ten", and "many" past that: the writer never gets a figure. */
export function countWord(count: number): string {
  return COUNT_WORDS[count] ?? 'many';
}

/** "two stories and a basement"; nothing for a single story, which is not worth a word. */
export function floorsPhrase(levels: number[] | undefined): string | undefined {
  if (!levels || levels.length === 0) {
    return undefined;
  }
  const above = levels.filter((level) => level >= 0).length;
  const basement = levels.some((level) => level < 0);
  if (above <= 1 && !basement) {
    return undefined;
  }
  const stories = above > 1 ? `${countWord(above)} stories` : undefined;
  return [stories, basement ? 'a basement' : undefined].filter(Boolean).join(' and ');
}

const FLOOR_NAMES: Record<number, string> = { [-1]: 'Basement', 0: 'Main floor', 1: 'Second floor', 2: 'Third floor' };

export function floorName(level: number): string {
  return FLOOR_NAMES[level] ?? `Floor ${level + 1}`;
}

/** "Main floor: a swimming pool, lockers" per room floor, for a lot with more than one. */
export function floorLines(
  floorFurnishings: Record<string, string[]> | undefined,
  options: { isHome: boolean; outdoors?: boolean },
): string[] {
  const floors = roomFloors(floorFurnishings);
  if (floors.length < 2) {
    return [];
  }
  return floors
    .map((level) => {
      const { words } = furnishingWords(floorFurnishings?.[String(level)], options);
      return words.length > 0 ? `${floorName(level)}: ${words.join(', ')}` : '';
    })
    .filter(Boolean);
}

export function plainName(name: string, prefix: RegExp): string {
  return name
    .replace(prefix, '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

/** The stations the lot's stereos are tuned to ("StereoChannel_Lullabies" -> "Lullabies"). */
export function musicWords(stations: string[] | undefined): string[] {
  const words = (stations ?? [])
    .map((name) => plainName(name.replace(/^.*?(channel|station|genre)_?/i, ''), /^$/))
    .filter((word) => word.length > 0 && !/^(off|none|on)$/i.test(word));
  return Array.from(new Set(words));
}
