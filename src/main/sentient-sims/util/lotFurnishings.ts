// The mod reports what a lot is furnished with as object tuning names per floor
// (object_Locker_GP01, object_fountain_large), the catalog style tags and the stereo
// stations. This turns them into the plain words the description writer gets. Kinds only,
// never counts: "lockers", not "eleven lockers".

// [name fragments, plain words]. First match wins, so the narrow fragments come first
// ("weightbench" before "bench", "pooltable" before "pool", "barstool" before "bar").
const FURNISHING_WORDS: Array<[string[], string]> = [
  [['pooltable', 'billiard'], 'a pool table'],
  [['hottub'], 'a hot tub'],
  [['swimmingpool', 'pool'], 'a swimming pool'],
  [['treadmill'], 'treadmills'],
  [['weightbench', 'workout', 'exercise', 'weightmachine', 'ellipt'], 'workout machines'],
  [['punchingbag', 'boxingbag'], 'punching bags'],
  [['climbingwall', 'rockclimb'], 'a climbing wall'],
  [['yogamat', 'yoga'], 'yoga mats'],
  [['locker'], 'lockers'],
  [['sauna'], 'a sauna'],
  [['massage'], 'massage tables'],
  [['shower'], 'showers'],
  [['toilet', 'urinal'], 'restrooms'],
  [['fountain'], 'a fountain'],
  [['viprope', 'velvetrope'], 'a velvet rope at the door'],
  [['spotlight', 'stagelight'], 'stage lights'],
  [['bench'], 'benches'],
  [['sofa', 'couch', 'loveseat', 'sectional', 'sitlove'], 'sofas'],
  [['armchair', 'chairliving', 'livingchair', 'loungechair', 'chairlounge', 'sitliving'], 'armchairs'],
  [['barstool'], 'bar stools'],
  [['bartend', 'object_bar_', 'barpro', 'barcounter', 'minibar'], 'a bar'],
  [['television', 'object_tv'], 'TVs'],
  [['computer'], 'computers'],
  [['bookshelf', 'bookcase'], 'bookshelves'],
  [['chess'], 'chess tables'],
  [['piano'], 'a piano'],
  [['guitar'], 'guitars'],
  [['violin'], 'a violin'],
  [['drum'], 'a drum kit'],
  [['djbooth', 'djmixer'], 'a DJ booth'],
  [['karaoke', 'microphone'], 'a microphone stand'],
  [['jukebox'], 'a jukebox'],
  [['stereo', 'speaker'], 'speakers'],
  [['dancefloor'], 'a dance floor'],
  [['easel'], 'easels'],
  [['painting', 'wallart'], 'paintings'],
  [['sculpture', 'statue'], 'sculptures'],
  [['displaycase', 'pedestal'], 'display cases'],
  [['telescope'], 'a telescope'],
  [['microscope'], 'a microscope'],
  [['chemistry'], 'a chemistry table'],
  [['woodwork'], 'a woodworking table'],
  [['arcade', 'pinball'], 'arcade machines'],
  [['videogame', 'gamingconsole', 'gameconsole'], 'game consoles'],
  [['foosball'], 'a foosball table'],
  [['bowling'], 'bowling lanes'],
  [['playground', 'monkeybar', 'junglegym', 'swingset'], 'a playground'],
  [['picnictable', 'picnic'], 'picnic tables'],
  [['grill', 'bbq', 'barbecue'], 'a grill'],
  [['firepit', 'campfire'], 'a fire pit'],
  [['fireplace'], 'a fireplace'],
  [['aquarium', 'fishtank'], 'an aquarium'],
  [['gravestone', 'tombstone'], 'gravestones'],
  [['planter', 'gardenplot'], 'garden planters'],
  [['tablecoffee', 'coffeetable'], 'coffee tables'],
  [['tabledining', 'diningtable', 'sitdining'], 'dining tables'],
  [['desk'], 'desks'],
  [['object_bed', 'beddouble', 'bedsingle'], 'beds'],
];

// Structure, lighting and small decor: on every lot, so they say nothing about it and no
// rule needs to be written for them
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
];

// Every home has these; on a venue they say what the place is for (a gym's showers)
const HOME_BASICS = new Set(['showers', 'restrooms', 'beds']);

// A level holds a room when it has at least this many kinds of real furnishing; a roof with
// vents and a stray chair does not count as a story
const MIN_ROOM_WORDS_PER_FLOOR = 2;

function furnishingWord(tuningName: string): string | undefined {
  const lowered = tuningName.toLowerCase();
  return FURNISHING_WORDS.find(([fragments]) => fragments.some((fragment) => lowered.includes(fragment)))?.[1];
}

function isStructural(tuningName: string): boolean {
  const lowered = tuningName.toLowerCase();
  return STRUCTURAL.some((fragment) => lowered.includes(fragment));
}

const ORDER = FURNISHING_WORDS.map(([, word]) => word);

function inTableOrder(words: Iterable<string>): string[] {
  return Array.from(new Set(words)).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
}

/**
 * The plain kinds of furnishing among these tuning names, in table order, and the names no
 * rule knows (structure and small decor are neither). Outdoors, sofas are park benches.
 */
export function furnishingWords(
  tuningNames: string[] | undefined,
  options: { isHome: boolean; outdoors?: boolean },
): { words: string[]; unmapped: string[] } {
  const words: string[] = [];
  const unmapped: string[] = [];
  (tuningNames ?? []).forEach((name) => {
    let word = furnishingWord(name);
    if (word === 'sofas' && options.outdoors) {
      word = 'benches';
    }
    if (!word) {
      if (!isStructural(name)) {
        unmapped.push(name);
      }
    } else if (!(options.isHome && HOME_BASICS.has(word))) {
      words.push(word);
    }
  });
  return { words: inTableOrder(words), unmapped };
}

/** The levels that hold real rooms, lowest first (-1 is a basement). */
export function roomFloors(floorFurnishings: Record<string, string[]> | undefined): number[] {
  return Object.entries(floorFurnishings ?? {})
    .filter(([, names]) => new Set(names.map(furnishingWord).filter(Boolean)).size >= MIN_ROOM_WORDS_PER_FLOOR)
    .map(([level]) => Number(level))
    .sort((a, b) => a - b);
}

const COUNT_WORDS = ['', 'one', 'two', 'three', 'four', 'five'];

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
  const stories = above > 1 ? `${COUNT_WORDS[above] ?? above} stories` : undefined;
  return [stories, basement ? 'a basement' : undefined].filter(Boolean).join(' and ');
}

const FLOOR_NAMES: Record<number, string> = { [-1]: 'Basement', 0: 'Main floor', 1: 'Second floor', 2: 'Third floor' };

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
      return words.length > 0 ? `${FLOOR_NAMES[level] ?? `Floor ${level + 1}`}: ${words.join(', ')}` : '';
    })
    .filter(Boolean);
}

// Words for the catalog's style tags; anything else is de-prefixed and split
const STYLE_WORDS: Record<string, string> = {
  Style_Shabby: 'Shabby Chic',
  Style_ShabbyChic: 'Shabby Chic',
  Style_MidCentury: 'Mid-Century',
  Style_Modern: 'Modern',
  Style_Mission: 'Mission',
  Style_Cosmolux: 'Cosmolux',
};
const IGNORED_STYLES = new Set(['Style_Basics', 'Style_Basic']);
// A style has to cover this share of the styled objects to say anything about the place
const STYLE_SHARE = 0.15;
const MAX_STYLES = 2;

export function plainName(name: string, prefix: RegExp): string {
  return name
    .replace(prefix, '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

/** The one or two decor styles most of the lot is furnished in. */
export function styleWords(styles: Record<string, number> | undefined): string[] {
  const entries = Object.entries(styles ?? {}).filter(([name]) => !IGNORED_STYLES.has(name));
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  return entries
    .filter(([, count]) => total > 0 && count / total >= STYLE_SHARE)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_STYLES)
    .map(([name]) => STYLE_WORDS[name] ?? plainName(name, /^style_/i));
}

/** The stations the lot's stereos are tuned to ("StereoChannel_Lullabies" -> "Lullabies"). */
export function musicWords(stations: string[] | undefined): string[] {
  const words = (stations ?? [])
    .map((name) => plainName(name.replace(/^.*?(channel|station|genre)_?/i, ''), /^$/))
    .filter((word) => word.length > 0 && !/^(off|none|on)$/i.test(word));
  return Array.from(new Set(words));
}
