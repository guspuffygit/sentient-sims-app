import { LotRoom } from '../models/SimStateReport';
import { countWord, floorName, furnishingWords, isRoomFloor, nameMatches } from './lotFurnishings';

// The mod groups a lot's objects by the game's own room id per level (mod builds from
// 2026-10-17). This names each room from what is in it, hides what the name already says
// (a bedroom's bed, a kitchen's stove), and writes one line per floor for the description
// writer. Why: a flat floor list read a kitchen island with stools as "a bar" and a bedroom
// with a punching bag as "a workout area" (Calle de la Promesa, 2026-10-17).

type Options = { isHome: boolean; outdoors?: boolean };

// Name fragments that tell a room apart; `not` keeps a bedside table from being a bed
type Signal = { any: string[]; not?: string[] };

const signal = (any: string[], not?: string[]): Signal => ({ any, not });

const BED = signal(['beddouble', 'bedsingle', 'bunkbed', 'object_bed'], ['bedside']);
const BEDROOM_FURNITURE = signal(['dresser', 'nightstand']);
const CRIB = signal(['crib', 'bassinet', 'changingtable', 'changing_table']);
const TOILET = signal(['toilet', 'urinal']);
const SHOWER = signal(['shower']);
const BATHTUB = signal(['bathtub']);
const LOCKER = signal(['locker']);
const KITCHEN = signal([
  'fridge',
  'stove',
  'oven',
  'counterisland',
  'counter_island',
  'kitchenisland',
  'microwave',
  'dishwasher',
]);
const APPLIANCES = signal(['fridge', 'stove', 'oven', 'microwave', 'dishwasher']);
const SOFA = signal(['sofa', 'couch', 'loveseat', 'sectional', 'sitlove']);
const LIVING = signal(['television', 'object_tv', 'tablecoffee', 'coffeetable', 'fireplace']);
const BAR = signal(['bartend', 'object_bar_', 'object_bar$', 'barpro', 'barcounter', 'minibar']);
const DESK = signal(['desk']);
const COMPUTER = signal(['computer']);
const BOOKSHELF = signal(['bookshelf', 'bookcase']);
const GYM = signal([
  'punchingbag',
  'boxingbag',
  'treadmill',
  'weightbench',
  'workout',
  'exercise',
  'weightmachine',
  'ellipt',
  'climbingwall',
  'rockclimb',
]);
const STUDIO = signal([
  'easel',
  'pottery',
  'woodwork',
  'piano',
  'guitar',
  'violin',
  'drum',
  'musicproduction',
  'djbooth',
  'djmixer',
]);
const SAUNA = signal(['sauna']);
const POOL = signal(['swimmingpool', 'pool'], ['pooltable']);
const DINING = signal(['tabledining', 'diningtable', 'chair_dining', 'diningchair', 'sitdining']);
const PATIO = signal(['grill', 'bbq', 'barbecue', 'picnic', 'firepit', 'campfire', 'tabledining', 'diningtable']);
const PLANTER = signal(['planter', 'gardenplot', 'gardeningsoil']);

function matches(lowered: string, { any, not }: Signal): boolean {
  return (
    any.some((fragment) => nameMatches(lowered, fragment)) &&
    !(not ?? []).some((fragment) => lowered.includes(fragment))
  );
}

/** [one, many]: "a bedroom" / "bedrooms" */
export type RoomLabel = [string, string];

export type RoomReading = { label?: RoomLabel; hidden: Signal[] };

/**
 * What an indoor room is, from the tuning names in it, and which of them its name already
 * says. Strong signals first (a bed makes a bedroom whatever else is there), then the
 * combinations, then furniture alone; no label for a room nothing defines.
 */
export function classifyRoom(kinds: Record<string, number>, options: Options): RoomReading {
  const names = Object.keys(kinds).map((name) => name.toLowerCase());
  const has = (which: Signal) => names.some((name) => matches(name, which));
  const total = (which: Signal) =>
    Object.entries(kinds).reduce((sum, [name, count]) => (matches(name.toLowerCase(), which) ? sum + count : sum), 0);
  const living = has(SOFA) && has(LIVING);
  if (has(BED)) {
    return { label: ['a bedroom', 'bedrooms'], hidden: [BED, BEDROOM_FURNITURE] };
  }
  if (has(CRIB)) {
    return { label: ['a nursery', 'nurseries'], hidden: [CRIB, BEDROOM_FURNITURE] };
  }
  if (has(LOCKER)) {
    return { label: ['a locker room', 'locker rooms'], hidden: [LOCKER] };
  }
  if (has(TOILET) || has(SHOWER) || has(BATHTUB)) {
    if (!options.isHome && !has(SHOWER) && !has(BATHTUB)) {
      return { label: ['a restroom', 'restrooms'], hidden: [TOILET] };
    }
    return { label: ['a bathroom', 'bathrooms'], hidden: [TOILET, SHOWER, BATHTUB] };
  }
  if (has(KITCHEN)) {
    const label: RoomLabel = living
      ? ['an open-plan kitchen and living room', 'open-plan kitchens and living rooms']
      : ['a kitchen', 'kitchens'];
    return { label, hidden: [APPLIANCES] };
  }
  if (has(BAR)) {
    return { label: ['a bar', 'bars'], hidden: [BAR] };
  }
  if (living) {
    return { label: ['a living room', 'living rooms'], hidden: [] };
  }
  if (has(DESK) && has(COMPUTER)) {
    return { label: ['a study', 'studies'], hidden: [DESK, COMPUTER] };
  }
  if (total(BOOKSHELF) >= 3) {
    return { label: ['a library', 'libraries'], hidden: [BOOKSHELF] };
  }
  if (has(GYM)) {
    return { label: options.isHome ? ['a home gym', 'home gyms'] : ['a workout room', 'workout rooms'], hidden: [] };
  }
  if (has(STUDIO)) {
    return { label: ['a studio', 'studios'], hidden: [] };
  }
  if (has(SAUNA)) {
    return { label: ['a sauna', 'saunas'], hidden: [SAUNA] };
  }
  if (has(POOL)) {
    return { label: ['an indoor pool', 'indoor pools'], hidden: [POOL] };
  }
  if (has(DINING)) {
    return {
      label: options.isHome ? ['a dining room', 'dining rooms'] : ['a dining area', 'dining areas'],
      hidden: [DINING],
    };
  }
  return { hidden: [] };
}

// Everything outdoors on a level is one place: a patio and a yard cannot be told apart. A
// pool names it anywhere; a patio or a garden only at a home, so a park gets no invented
// rooms
function classifyOutdoors(kinds: Record<string, number>, options: Options): { label?: string; hidden: Signal[] } {
  const names = Object.keys(kinds).map((name) => name.toLowerCase());
  const has = (which: Signal) => names.some((name) => matches(name, which));
  if (has(POOL)) {
    return { label: 'a pool', hidden: [POOL] };
  }
  if (options.isHome && has(PATIO)) {
    return { label: 'a patio', hidden: [] };
  }
  if (options.isHome && has(PLANTER)) {
    return { label: 'a garden', hidden: [PLANTER] };
  }
  return { hidden: [] };
}

function withoutHidden(kinds: Record<string, number>, hidden: Signal[]): Record<string, number> {
  return Object.fromEntries(
    Object.entries(kinds).filter(([name]) => !hidden.some((which) => matches(name.toLowerCase(), which))),
  );
}

/** Every room's kinds added up (tuning name -> count). */
export function mergedKinds(rooms: LotRoom[]): Record<string, number> {
  const merged: Record<string, number> = {};
  rooms.forEach((room) => {
    Object.entries(room.kinds).forEach(([name, count]) => {
      merged[name] = (merged[name] ?? 0) + count;
    });
  });
  return merged;
}

/** The levels whose rooms hold real furnishings, lowest first (-1 is a basement). */
export function roomLevels(rooms: LotRoom[]): number[] {
  const levels = Array.from(new Set(rooms.map((room) => room.level)));
  return levels
    .filter((level) => isRoomFloor(Object.keys(mergedKinds(rooms.filter((room) => room.level === level)))))
    .sort((a, b) => a - b);
}

// Rooms on a floor read in this order, the ones that say most about the place first; a bare
// bathroom at a home says nothing the bedroom and bathroom counts do not, so it is left out
const ROOM_ORDER = [
  'an open-plan kitchen and living room',
  'a kitchen',
  'a living room',
  'a dining room',
  'a dining area',
  'a bar',
  'a bedroom',
  'a nursery',
  'a study',
  'a library',
  'a home gym',
  'a workout room',
  'a studio',
  'an indoor pool',
  'a sauna',
  'a locker room',
  'a bathroom',
  'a restroom',
];

function roomOrder(label: RoomLabel): number {
  const index = ROOM_ORDER.indexOf(label[0]);
  return index < 0 ? ROOM_ORDER.length : index;
}

function listJoin(words: string[]): string {
  if (words.length <= 1) {
    return words.join('');
  }
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

/**
 * One level's rooms as a phrase: "a kitchen with bar stools and a coffee maker; two bedrooms,
 * one with a desk; a room with a telescope and sculptures; outside: a patio with a grill".
 * `named` counts the rooms given a name (or shown as "a room with"); `groups` every part.
 */
export function floorRoomsPhrase(rooms: LotRoom[], options: Options): { text: string; groups: number; named: number } {
  const parts: string[] = [];
  let named = 0;
  const labelled = new Map<string, { label: RoomLabel; items: string[][] }>();
  const unnamed: string[] = [];
  let elsewhere: string[] = [];
  rooms
    .filter((room) => !room.outdoors)
    .forEach((room) => {
      if (room.room === null) {
        elsewhere = furnishingWords(room.kinds, { isHome: options.isHome }).words;
        return;
      }
      const { label, hidden } = classifyRoom(room.kinds, options);
      const { words } = furnishingWords(withoutHidden(room.kinds, hidden), { isHome: options.isHome });
      if (label) {
        const entry = labelled.get(label[0]) ?? { label, items: [] };
        entry.items.push(words);
        labelled.set(label[0], entry);
      } else if (words.length >= 2) {
        unnamed.push(`a room with ${listJoin(words)}`);
      }
    });
  const ordered = Array.from(labelled.values()).sort((a, b) => roomOrder(a.label) - roomOrder(b.label));
  ordered.forEach(({ label, items: every }) => {
    const items = options.isHome && label[0] === 'a bathroom' ? every.filter((words) => words.length > 0) : every;
    if (items.length === 0) {
      return;
    }
    named += 1;
    if (items.length === 1) {
      parts.push(items[0].length > 0 ? `${label[0]} with ${listJoin(items[0])}` : label[0]);
      return;
    }
    const extras = items
      .filter((words) => words.length > 0)
      .map((words, index) => `${index === 0 ? 'one' : 'another'} with ${listJoin(words)}`);
    parts.push([`${countWord(items.length)} ${label[1]}`, ...extras].join(', '));
  });
  named += unnamed.length;
  parts.push(...unnamed);
  if (elsewhere.length > 0) {
    parts.push(parts.length > 0 ? `elsewhere: ${listJoin(elsewhere)}` : listJoin(elsewhere));
  }
  const outdoors = rooms.filter((room) => room.outdoors);
  if (outdoors.length > 0) {
    const kinds = mergedKinds(outdoors);
    const { label, hidden } = classifyOutdoors(kinds, options);
    const { words } = furnishingWords(withoutHidden(kinds, hidden), {
      isHome: options.isHome,
      outdoors: !options.isHome,
    });
    const text = label ? (words.length > 0 ? `${label} with ${listJoin(words)}` : label) : listJoin(words);
    if (text) {
      parts.push(`outside: ${text}`);
    }
  }
  return { text: parts.join('; '), groups: parts.length, named };
}

/** "Main floor: a kitchen with ...; outside: ..." per room floor, for a lot with more than one. */
export function roomLines(rooms: LotRoom[], options: Options): string[] {
  const levels = roomLevels(rooms);
  if (levels.length < 2) {
    return [];
  }
  return levels
    .map((level) => {
      const { text } = floorRoomsPhrase(
        rooms.filter((room) => room.level === level),
        options,
      );
      return text ? `${floorName(level)}: ${text}` : '';
    })
    .filter(Boolean);
}
