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

// Short words are somebody's name far less often than they are an ordinary word - a sim
// called "Bo" must not make "bother" unpublishable
const MIN_NAME_LENGTH = 3;

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// A full name first, then the parts: "Elliot Bennett" is worth reporting as itself rather
// than as two separate hits, and a first name alone is how a label usually reads
function candidates(names: string[]): string[] {
  const parts = new Set<string>();
  names.forEach((name) => {
    const full = name.trim();
    if (full.length >= MIN_NAME_LENGTH) {
      parts.add(full);
    }
    full
      .split(/\s+/)
      .filter((part) => part.length >= MIN_NAME_LENGTH)
      .forEach((part) => parts.add(part));
  });
  return Array.from(parts).sort((a, b) => b.length - a.length);
}

/**
 * The names from the save that appear in the text, longest match first. Case-insensitive
 * and on word boundaries, so "Art" does not match "party" but does match "art's".
 */
export function findSavedNames(text: string | undefined, names: string[]): string[] {
  if (!text) {
    return [];
  }
  const found: string[] = [];
  let remaining = text;
  candidates(names).forEach((name) => {
    const escaped = escapeForRegex(name);
    if (new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, 'iu').test(remaining)) {
      found.push(name);
      // Blank the hit so a full name is not then reported again as its first name
      remaining = remaining.replace(new RegExp(escaped, 'giu'), ' ');
    }
  });
  return found;
}
