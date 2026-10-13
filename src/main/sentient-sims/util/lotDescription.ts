import { LocationEntity } from '../db/entities/LocationEntity';
import { LotBlock } from '../models/SimStateReport';

// The facts a generated lot description is written from, and the gate it has to pass before
// it is stored. Both exist because of what the first version wrote into the save
// (2026-10-12): "She stands at 13 Acacia Avenue ... as she waits to be acknowledged by the
// home's occupant", "Pectoral Fitness is a residence that also serves as a gym", and ten rows
// named "the home" written from no facts at all. A description is stored ONCE and then rides
// in every scene prompt set on that lot, so it may only carry what is permanent about the
// place: its kind, whose home it is, and what it is furnished for. The live situations, the
// repair state and the bathroom inventory are moments or noise and never reach the writer.
// Trial and judging behind every rule: the "Lot Description Trial" artifact, 2026-10-12.

// The mod reports the venue tuning name; the writer gets plain words. Anything unmapped is
// de-prefixed ("venue_rentable_cabin" -> "rentable cabin") rather than dropped.
export const VENUE_KIND: Record<string, string> = {
  venue_residential: 'a private home',
  venue_gym: 'a gym',
  venue_cemetery: 'a cemetery',
  venue_library: 'a public library',
  venue_museum: 'a museum',
  venue_park: 'a public park',
  venue_bar: 'a bar',
  venue_lounge: 'a lounge',
  venue_club: 'a nightclub',
  venue_pool: 'a public pool',
  venue_cafe: 'a cafe',
  venue_restaurant: 'a restaurant',
  venue_retail: 'a shop',
  venue_rentable_cabin: 'a rentable vacation cabin',
  venue_karaoke: 'a karaoke bar',
  venue_artscenter: 'an arts center',
  venue_spa: 'a spa',
  venue_vet: 'a veterinary clinic',
  venue_hospital: 'a hospital',
  venue_police_station: 'a police station',
  venue_science_lab: 'a science lab',
  venue_acting_studio: 'a film studio',
  venue_university_student_commons: 'a university student commons',
  venue_national_park: 'a national park',
  venue_hidden_glade: 'a hidden glade',
  venue_ruins: 'ruins',
};

// Object ownership classes the mod counts (perception/ss_lot_state.py OWNERSHIP_CLASSES),
// grouped into what they say the place is FOR. Fridge, toilet, shower and mailbox are on
// every lot and said nothing but "toilets and a stereo seem out of place among the
// gravestones", so they are deliberately absent.
const THEMES: Array<[string, string[]]> = [
  ['art', ['easel']],
  ['music', ['piano', 'guitar', 'violin', 'stereo']],
  ['reading and study', ['bookshelf', 'computer']],
];
const PLURAL: Record<string, string> = {
  easel: 'easels',
  piano: 'pianos',
  guitar: 'guitars',
  violin: 'violins',
  stereo: 'stereos',
  bookshelf: 'bookshelves',
  computer: 'computers',
};
const COUNT_WORDS = ['', 'a', 'two', 'three', 'four', 'five', 'six'];

function countPhrase(kind: string, count: number): string {
  if (count === 1) {
    return `a ${kind}`;
  }
  const word = count < COUNT_WORDS.length ? COUNT_WORDS[count] : String(count);
  return `${word} ${PLURAL[kind] ?? `${kind}s`}`;
}

export function venueKind(venue: string): string {
  return VENUE_KIND[venue] ?? venue.replace(/^venue_/, '').replace(/_/g, ' ');
}

// The app's Lot Type column, in the words the shipped defaults use ("Bar", "Library").
const LOT_TYPE: Record<string, string> = {
  venue_residential: 'Residence',
  venue_rentable_cabin: 'Vacation Rental',
};

export function lotTypeLabel(venue: string): string {
  const words =
    LOT_TYPE[venue] ??
    venueKind(venue)
      .replace(/^(an?|the) /, '')
      .replace(/^(public|private) /, '');
  return words.charAt(0).toUpperCase() + words.slice(1).replace(/ (\w)/g, (_, c: string) => ` ${c.toUpperCase()}`);
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
  if (lot.venue) {
    return true;
  }
  return Object.values(lot.owned ?? {}).some((count) => count > 0);
}

export function lotFacts(location: LocationEntity, lot: LotBlock | undefined, zoneName?: string): string {
  const facts: string[] = [];
  facts.push(`Name: ${zoneName || location.name || 'unnamed lot'}`);
  if (lot?.venue) {
    facts.push(`Kind of place: ${venueKind(lot.venue)}`);
  } else if (location.lot_type && !location.is_generic) {
    // The repository's fallback row says 'Residence' for ANY unknown lot; only a lot_type a
    // person or the game actually set is worth repeating
    facts.push(`Kind of place: ${location.lot_type}`);
  }
  if (lot?.is_home) {
    facts.push("This is the household's own home.");
  }
  const owned = lot?.owned ?? {};
  const themes: string[] = [];
  THEMES.forEach(([theme, kinds]) => {
    const parts = kinds.filter((kind) => owned[kind] > 0).map((kind) => countPhrase(kind, owned[kind]));
    if (parts.length > 0) {
      themes.push(`${theme} (${parts.join(', ')})`);
    }
  });
  if (themes.length > 0) {
    facts.push(`Furnished for: ${themes.join('; ')}`);
  } else if (Object.values(owned).some((count) => count > 0)) {
    facts.push('Furnished for: nothing notable beyond the basics');
  }
  // Typed as a number by the record, absent at runtime on a lot with no bed
  const beds = owned.bed > 0 ? owned.bed : 0;
  if (beds > 0 && lot?.venue === 'venue_residential') {
    facts.push(`Sleeps: ${beds}`);
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
 * prompt passed it 36 of 36 times on the production model.
 */
export function placeDescriptionProblems(text: string, venue?: string): string[] {
  const problems: string[] = [];
  if (PERSON_POV.test(text)) {
    problems.push('person_pov');
  }
  if (PRESENT_MOMENT.test(text)) {
    problems.push('present_moment');
  }
  if (venue !== 'venue_residential' && VENUE_AS_RESIDENCE.test(text)) {
    problems.push('venue_as_residence');
  }
  const sentences = text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.length > 0);
  if (sentences.length < 1 || sentences.length > 4) {
    problems.push('length');
  }
  return problems;
}
