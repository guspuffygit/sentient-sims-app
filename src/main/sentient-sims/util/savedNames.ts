// The mapping browser publishes an interaction's wording to every user of the mod, and
// the text it offers is built from this save: the game renders a pie-menu label with the
// player's own sims in it ("Play with Elliot Jr"), and a hand-written description can
// name anyone. Names have leaked this way before - the August 2026 description sweep
// found "Tav", "Lae'zel" and "Mattia Sartoris" sitting in the shared database, carried
// there from other people's saves.
//
// So every publish is checked against the names in the loaded save first. This is the
// last gate rather than the only one: the mod already sends a name-free template for the
// suggested line. It catches what the template cannot - a pet, a renamed object, a name
// somebody typed themselves.

export type SavedNameHit = {
  name: string;
  // The name as the save spells it, rather than one first or last name on its own
  whole: boolean;
};

// Short words are somebody's name far less often than they are an ordinary word - a sim
// called "Bo" must not make "bother" unpublishable
const MIN_NAME_LENGTH = 3;

// A save holds hundreds of townies, and EA's surnames are everyday words (Story, Street,
// House, Winter, King, True). One such word on its own says nothing about anyone, however
// it is capitalised; a full name with one of them in it still counts.
const COMMON_WORDS = new Set([
  'the',
  'and',
  'but',
  'for',
  'with',
  'from',
  'into',
  'over',
  'out',
  'off',
  'all',
  'any',
  'one',
  'two',
  'new',
  'old',
  'big',
  'good',
  'bad',
  'evil',
  'best',
  'true',
  'fair',
  'free',
  'rich',
  'wise',
  'young',
  'little',
  'long',
  'short',
  'strong',
  'sweet',
  'happy',
  'lucky',
  'sunny',
  'bright',
  'dark',
  'light',
  'story',
  'house',
  'home',
  'street',
  'lane',
  'park',
  'hill',
  'lake',
  'river',
  'wood',
  'woods',
  'field',
  'stone',
  'rock',
  'page',
  'bell',
  'dawn',
  'day',
  'night',
  'moon',
  'sun',
  'star',
  'sky',
  'sea',
  'rain',
  'snow',
  'storm',
  'summer',
  'winter',
  'autumn',
  'spring',
  'north',
  'south',
  'east',
  'west',
  'world',
  'life',
  'love',
  'time',
  'way',
  'hope',
  'joy',
  'faith',
  'grace',
  'rose',
  'ivy',
  'lily',
  'holly',
  'violet',
  'olive',
  'sage',
  'pepper',
  'honey',
  'ginger',
  'amber',
  'ruby',
  'pearl',
  'jade',
  'crystal',
  'diamond',
  'gold',
  'silver',
  'blue',
  'white',
  'black',
  'brown',
  'green',
  'gray',
  'grey',
  'red',
  'wolf',
  'fox',
  'bear',
  'hunter',
  'baker',
  'cook',
  'carter',
  'mason',
  'miller',
  'smith',
  'walker',
  'fisher',
  'turner',
  'angel',
  'king',
  'queen',
  'prince',
  'duke',
  'earl',
  'bishop',
  'dean',
  'major',
  'price',
  'worth',
  'man',
  'girl',
  'boy',
  'god',
  'someone',
  'something',
  'nothing',
]);

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Full names first, then their parts: "Elliot Bennett" is worth reporting as itself rather
// than as two separate hits, and a first name alone is how a label usually reads
function candidates(names: string[]): SavedNameHit[] {
  const seen = new Map<string, SavedNameHit>();
  names.forEach((name) => {
    const full = name.trim();
    if (full.length >= MIN_NAME_LENGTH && !seen.has(full)) {
      seen.set(full, { name: full, whole: true });
    }
    full
      .split(/\s+/)
      .filter((part) => part.length >= MIN_NAME_LENGTH && !COMMON_WORDS.has(part.toLowerCase()))
      .forEach((part) => {
        if (!seen.has(part)) {
          seen.set(part, { name: part, whole: false });
        }
      });
  });
  return Array.from(seen.values()).sort((a, b) => b.name.length - a.name.length);
}

/**
 * The names from the save that appear in the text, longest match first, on word boundaries
 * ("Art" does not match "party" but does match "art's"). A full name matches in any case; a
 * first or last name on its own only as the text capitalises it, since "art at the easel"
 * is about painting even when a sim is called Art.
 */
export function findSavedNameHits(text: string | undefined, names: string[]): SavedNameHit[] {
  if (!text) {
    return [];
  }
  const found: SavedNameHit[] = [];
  let remaining = text;
  candidates(names).forEach((candidate) => {
    const escaped = escapeForRegex(candidate.name);
    const flags = candidate.whole ? 'iu' : 'u';
    if (new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, flags).test(remaining)) {
      found.push(candidate);
      // Blank the hit so a full name is not then reported again as its first name
      remaining = remaining.replace(new RegExp(escaped, `g${flags}`), ' ');
    }
  });
  return found;
}

export function findSavedNames(text: string | undefined, names: string[]): string[] {
  return findSavedNameHits(text, names).map((hit) => hit.name);
}
