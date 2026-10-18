import { LocationEntity } from '../db/entities/LocationEntity';
import { LotBlock } from '../models/SimStateReport';
import { lotNeighborhood } from '../descriptions/lotNeighborhoods';
import { floorLines, floorsPhrase, furnishingWords, musicWords, plainName, roomFloors } from './lotFurnishings';
import { lotTraitLine } from './lotTraitWords';
import { floorRoomsPhrase, mergedKinds, roomLevels, roomLines } from './lotRooms';

// The facts a generated lot description is written from, and the gate it has to pass before
// it is stored. Both exist because of what the first version wrote into the save
// (2026-10-12): "She stands at 13 Acacia Avenue ... as she waits to be acknowledged by the
// home's occupant", "Pectoral Fitness is a residence that also serves as a gym", and ten rows
// named "the home" written from no facts at all. A description is stored ONCE and then rides
// in every scene prompt set on that lot, so it may only carry what is permanent about the
// place: its kind, where it is, and what it is furnished with. The live situations and the
// repair state are moments and never reach the writer.
// Trial and judging behind every rule: the "Lot Description Trial" artifact, 2026-10-12. The
// 3-4 sentence card shape itself won the "Lot Description Shapes" experiment of 2026-10-15
// (360 scenes, six shapes, blind judge): best grounding, fewest invented people, 92 tokens.

// The lot type, as the writer's kind of place and as the Lot Type column. Keys are the venue
// tuning names lowercased (the game mixes case: venue_gym, venue_ForestPark); labels are the
// names Manage Worlds shows. A venue with no entry is matched by pattern, else de-prefixed and
// split ("venue_ChaletGardens" -> "Chalet Gardens") rather than dropped.
const VENUES: Partial<Record<string, { kind: string; label: string }>> = {
  venue_residential: { kind: 'a private home', label: 'Residence' },
  venue_gym: { kind: 'a gym', label: 'Gym' },
  venue_cemetery: { kind: 'a cemetery', label: 'Cemetery' },
  venue_library: { kind: 'a public library', label: 'Library' },
  venue_museum: { kind: 'a museum', label: 'Museum' },
  venue_park: { kind: 'a public park', label: 'Park' },
  venue_bar: { kind: 'a bar', label: 'Bar' },
  venue_lounge: { kind: 'a lounge', label: 'Lounge' },
  venue_club: { kind: 'a nightclub', label: 'Nightclub' },
  venue_pool: { kind: 'a public pool', label: 'Pool' },
  venue_cafe: { kind: 'a café', label: 'Café' },
  venue_reccenter: { kind: 'a recreation center', label: 'Recreation Center' },
  venue_playground: { kind: 'a playground', label: 'Playground' },
  venue_restaurant: { kind: 'a restaurant', label: 'Restaurant' },
  venue_retail: { kind: 'a shop', label: 'Retail' },
  venue_karaoke: { kind: 'a karaoke bar', label: 'Karaoke Bar' },
  venue_artscenter: { kind: 'an arts center', label: 'Arts Center' },
  venue_spa: { kind: 'a spa', label: 'Spa' },
  venue_vet: { kind: 'a veterinary clinic', label: 'Vet Clinic' },
  venue_hospital: { kind: 'a hospital', label: 'Hospital' },
  venue_doctorclinic: { kind: 'a hospital', label: 'Hospital' },
  venue_police_station: { kind: 'a police station', label: 'Police Station' },
  venue_policestation: { kind: 'a police station', label: 'Police Station' },
  venue_science_lab: { kind: 'a science lab', label: 'Science Lab' },
  venue_scientistlab: { kind: 'a science lab', label: 'Science Lab' },
  venue_acting_studio: { kind: 'a film studio', label: 'Film Studio' },
  venue_actingstudio: { kind: 'a film studio', label: 'Film Studio' },
  venue_university_student_commons: { kind: 'a university student commons', label: 'Student Commons' },
  venue_forestpark: { kind: 'a national park', label: 'National Park' },
  venue_national_park: { kind: 'a national park', label: 'National Park' },
  venue_rentable_cabin: { kind: 'a rentable vacation cabin', label: 'Vacation Rental' },
  venue_rentable_vacation_generic: { kind: 'a vacation rental', label: 'Vacation Rental' },
  venue_onsen: { kind: 'an onsen bathhouse', label: 'Onsen Bathhouse' },
  venue_mountainexcursion: { kind: 'a stage of the mountain climb', label: 'Mountain Excursion' },
  venue_hiddenglade: { kind: 'a hidden glade', label: 'Hidden Glade' },
  venue_hidden_glade: { kind: 'a hidden glade', label: 'Hidden Glade' },
  venue_hiddencave: { kind: 'a hidden cave', label: 'Hidden Cave' },
  venue_hiddenalienworld: { kind: 'an alien world', label: 'Alien Planet' },
  venue_hermit: { kind: 'a cabin deep in the woods', label: 'Deep Woods' },
  venue_grimlot: { kind: 'the Grim Reaper offices', label: 'Netherworld' },
  venue_ruins: { kind: 'ruins', label: 'Ruins' },
};

// Lot types whose tuning names are not known yet, by what the name has to contain
const VENUE_PATTERNS: Array<[RegExp, { kind: string; label: string }]> = [
  [/haunt/i, { kind: 'a haunted house', label: 'Haunted House Residence' }],
  [/tiny/i, { kind: 'a tiny home', label: 'Tiny Home Residence' }],
  [/wedding/i, { kind: 'a wedding venue', label: 'Wedding Venue' }],
  [/playground/i, { kind: 'a playground', label: 'Playground' }],
  [/rec_?center|recreation/i, { kind: 'a recreation center', label: 'Recreation Center' }],
];

// Lots that are mostly outdoors: their sofas are park benches
const OUTDOOR_VENUE = /park|playground|cemetery|glade|ruins|bluff|forest|woods|hermit|campground|excursion/i;

function venueEntry(venue: string): { kind: string; label: string } {
  const known = VENUES[venue.toLowerCase()] ?? VENUE_PATTERNS.find(([pattern]) => pattern.test(venue))?.[1];
  if (known) {
    return known;
  }
  const words = plainName(venue, /^venue_/i);
  return { kind: words.toLowerCase(), label: words.replace(/\b(\w)/g, (letter) => letter.toUpperCase()) };
}

export function venueKind(venue: string): string {
  return venueEntry(venue).kind;
}

export function lotTypeLabel(venue: string): string {
  return venueEntry(venue).label;
}

// Plain, haunted and tiny homes alike
function isResidential(venue: string | undefined): boolean {
  return venue !== undefined && lotTypeLabel(venue).endsWith('Residence');
}

/**
 * The lot's type: the one it is set to in Manage Worlds, else the active venue unless that
 * is only Generic (Ward Park, a National Park, reported venue_Generic as its active venue).
 */
export function lotVenue(lot: LotBlock | undefined): string | undefined {
  if (lot?.venue_type) {
    return lot.venue_type;
  }
  return lot?.venue && !/generic$/i.test(lot.venue) ? lot.venue : undefined;
}

/**
 * Whether the lot block says anything a description could be built from. Without it the
 * writer only has the repository's defaults ("the home", "Residence") and still writes
 * three sentences; ten such rows were in the save by 2026-10-12.
 */
export function lotHasFacts(lot?: LotBlock): boolean {
  if (!lot) {
    return false;
  }
  if (lot.venue || lot.venue_type || (lot.furnishings?.length ?? 0) > 0) {
    return true;
  }
  return Object.values(lot.owned ?? {}).some((count) => count > 0);
}

// The mod's full furnishing list, or on a mod build without one the ownership classes it counts
export function lotFurnishingNames(lot: LotBlock | undefined): string[] {
  if (lot?.furnishings) {
    return lot.furnishings;
  }
  return Object.entries(lot?.owned ?? {})
    .filter(([, count]) => count > 0)
    .map(([kind]) => (kind === 'tv' ? 'television' : kind));
}

export function lotFacts(location: LocationEntity, lot: LotBlock | undefined, zoneName?: string): string {
  const facts: string[] = [];
  facts.push(`Name: ${zoneName || location.name || 'unnamed lot'}`);
  const venue = lotVenue(lot);
  if (venue) {
    facts.push(`Kind of place: ${venueKind(venue)}`);
  } else if (location.lot_type && !location.is_generic) {
    // The repository's fallback row says 'Residence' for ANY unknown lot; only a lot_type a
    // person or the game actually set is worth repeating
    facts.push(`Kind of place: ${location.lot_type}`);
  }
  const where = lotNeighborhood(location.id);
  if (where?.neighborhood) {
    facts.push(`Neighborhood: ${where.neighborhood}, ${where.world}`);
  } else if (where?.world || lot?.world_name) {
    facts.push(`World: ${where?.world ?? lot?.world_name}`);
  }
  if (lot?.is_home) {
    facts.push("This is the household's own home.");
  }
  const options = {
    isHome: isResidential(venue) || lot?.is_home === true,
    outdoors: venue !== undefined && OUTDOOR_VENUE.test(venue),
  };
  const rooms = lot?.rooms && lot.rooms.length > 0 ? lot.rooms : undefined;
  const levels = rooms ? roomLevels(rooms) : lot?.floor_furnishings ? roomFloors(lot.floor_furnishings) : lot?.floors;
  const floors = floorsPhrase(levels);
  if (floors) {
    facts.push(`Floors: ${floors}`);
  }
  // Room by room when the mod names rooms, floor by floor when there is more than one, as a
  // person would show someone round; a lot with no room worth a name keeps the flat list
  const furnishings = lotFurnishingNames(lot);
  const onFloor = rooms && levels?.length === 1 ? rooms.filter((room) => room.level === levels[0]) : rooms;
  const perFloor = onFloor ? roomLines(onFloor, options) : floorLines(lot?.floor_furnishings, options);
  const roomsLine = onFloor ? floorRoomsPhrase(onFloor, options) : undefined;
  const { words } = furnishingWords(onFloor ? mergedKinds(onFloor) : furnishings, options);
  if (perFloor.length > 0) {
    facts.push(...perFloor);
  } else if (roomsLine && (roomsLine.groups >= 2 || roomsLine.named >= 1)) {
    facts.push(`Rooms: ${roomsLine.text}`);
  } else if (words.length > 0) {
    facts.push(`Furnished with: ${words.join(', ')}`);
  } else if (furnishings.length > 0) {
    facts.push('Furnished with: nothing notable beyond the basics');
  }
  const music = musicWords(lot?.music);
  if (music.length > 0) {
    facts.push(`The speakers play: ${music.join(', ')}`);
  }
  // The zone's own record (mod builds from 2026-10-15): the game's blurb often names the
  // residents, so the prompt's no-people rules apply to it like anything else
  if (lot?.description?.trim()) {
    facts.push(`The game describes it as: ${lot.description.trim()}`);
  }
  if (options.isHome && ((lot?.bedrooms ?? 0) > 0 || (lot?.bathrooms ?? 0) > 0)) {
    facts.push(`Bedrooms: ${lot?.bedrooms ?? 0}, bathrooms: ${lot?.bathrooms ?? 0}`);
  }
  // Panel names with a clause each (util/lotTraitWords); the lot challenges (Heist Havoc,
  // Gremlins) are set apart so the writer knows which ones are hazards
  const traitLine = lotTraitLine(lot?.lot_traits ?? [], lot?.lot_challenges);
  if (traitLine) {
    facts.push(traitLine);
  }
  return facts.join('\n');
}

// A person in the place, or a point of view. "stands" only counts with a she/he subject:
// "an easel stands in one area" is an easel (false positive found in the trial).
const PERSON_POV =
  /\b(she|he|her|his|him|herself|himself|you|your|yourself|someone|somebody|a visitor|the visitor|visitors? (?:who|is|are|have|has)|a guest|the guest|as one (?:walks|enters|stands|moves|steps)|as people|as they|one can(?:not)? help)\b|\b(?:she|he) stands\b|\bis standing\b/i;
// A passing moment written down as if it were the place
const PRESENT_MOMENT =
  /\b(currently|right now|at the moment|at this moment|just arrived|has yet to|yet to come|waits?|waiting|awaits?|being greeted|greeted|greeting|is leaving|are leaving|prepares? to leave|preparing to leave|about to leave|unacknowledged|acknowledg\w+|awkward|has just|have just|today|tonight|this evening)\b/i;
// "a residence that also serves as a gym": the repository's Residence placeholder reconciled
// with the real venue. Only meaningful on a lot that is NOT a home ("a residential lot that
// serves as the household's own home" is a home; second false positive found in the trial).
const VENUE_AS_RESIDENCE =
  /\bresiden(?:ce|tial)\b[^.]{0,40}\b(also|that serves|doubles|functions|serves as|bar|gym|park|library|museum|cemetery|lounge|club|venue)\b|\b(bar|gym|park|library|museum|cemetery|lounge|club)\b[^.]{0,30}\bresiden/i;

/**
 * Why a generated lot description must not be stored, as a list of tags; empty means it may.
 * This is the safety net behind the prompt and the facts, not the fix: in the trial the fixed
 * prompt passed it 36 of 36 times on the production model. The length gate allows 1-4
 * sentences: the card shape is 3-4, and a shorter card is still a card.
 */
export function placeDescriptionProblems(text: string, venue?: string): string[] {
  const problems: string[] = [];
  if (PERSON_POV.test(text)) {
    problems.push('person_pov');
  }
  if (PRESENT_MOMENT.test(text)) {
    problems.push('present_moment');
  }
  if (!isResidential(venue) && VENUE_AS_RESIDENCE.test(text)) {
    problems.push('venue_as_residence');
  }
  // "Mt. Komorebi" is one word of a sentence, not the end of one, and neither is the "!" in
  // "Planet Honey Pop! is a karaoke bar": a sentence ends where a capital follows
  const sentences = text
    .trim()
    .replace(/\bMt\.\s/g, 'Mt ')
    .split(/(?<=[.!?])\s+(?=["'(A-Z0-9])/)
    .filter((sentence) => sentence.length > 0);
  if (sentences.length < 1 || sentences.length > 4) {
    problems.push('length');
  }
  return problems;
}
