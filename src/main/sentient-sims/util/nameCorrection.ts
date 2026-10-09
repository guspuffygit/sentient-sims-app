// V-7: STT dictionary. Whisper hears "Lily" for Lillie, "Meika" for Mika, "Chapman" for
// Chatman (all observed live 08-04..08-14). Two layers: the transcription request carries
// a `prompt` of the names in play (a soft bias every OpenAI-compatible whisper honours or
// ignores silently), and a post-pass snaps near-miss tokens to known names.
import { isPlaceholderName } from './simAliases';

export function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }
  let previous = new Array<number>(b.length + 1);
  let current = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) {
    previous[j] = j;
  }
  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    [previous, current] = [current, previous];
  }
  return previous[b.length];
}

// Whisper truncates the prompt at ~224 tokens; keep the hint short and name-dense
const PROMPT_MAX_CHARS = 700;

// Names go in tightest-scope-first order so the on-lot sims survive truncation
export function buildTranscriptionPrompt(nameGroups: (string | null | undefined)[][]): string | undefined {
  const seen = new Set<string>();
  const ordered: string[] = [];
  nameGroups.forEach((group) => {
    group.forEach((name) => {
      const trimmed = name?.trim();
      if (trimmed && !seen.has(trimmed.toLowerCase())) {
        seen.add(trimmed.toLowerCase());
        ordered.push(trimmed);
      }
    });
  });
  if (ordered.length === 0) {
    return undefined;
  }
  let prompt = `Names in this scene: ${ordered.join(', ')}.`;
  while (prompt.length > PROMPT_MAX_CHARS && ordered.length > 1) {
    ordered.pop();
    prompt = `Names in this scene: ${ordered.join(', ')}.`;
  }
  return prompt;
}

// Loose phonetic normalization so "Lily" and "Lillie" (or "Meika"/"Mika") compare close:
// doubled letters collapse, y/ie -> i, ph -> f, ck -> k, silent-w wr -> r ("Wren" is
// heard as "Ren"/"Rin", live 08-27), and a silent final e drops ("Adrienne" for Adrian,
// live 09-23)
export function phonetic(text: string): string {
  return text
    .toLowerCase()
    .replace(/([^aeiou])e\b/g, '$1')
    .replace(/wr/g, 'r')
    .replace(/ph/g, 'f')
    .replace(/ck/g, 'k')
    .replace(/ie\b/g, 'i')
    .replace(/y/g, 'i')
    .replace(/(.)\1+/g, '$1');
}

// Everyday speech a sentence starts with, which capitalization alone cannot tell from a
// name. Live 08-27 the player's "Well,"/"Kay"/"Hey" became Wells/Kai/Huy and the sims were
// addressed by the wrong name (and 09-24 "Welp" became Wells). A word in here is never
// FUZZY-matched; an exact vocabulary hit still wins first, so a sim actually named Will or
// Grace is untouched.
const COMMON_WORDS = new Set(
  `about after again all also and any anyway are ask back bad because been before being both boy
   but bye call came can cant come cool could damn day did does doing done dont down dude each
   even ever every eyes face fine first for from game geez get give going gonna good gosh got
   gotta great guess had has hate have hay heck hell hello help her here hey him his hmm home
   hope how huh its just kay keep kind know less let lets like listen little look lot love made
   make man many may maybe mean more most much must nah need never new next nice nope not now off
   okay old once one only ooh other our out over own play please put really right said same say
   see she should sim sims some sorry stay still stop sure take talk tell than thank thanks that
   the their them then there these they thing think this those time too two umm use used very
   wait walk want wanna was watch way well were what when where which while who why will with
   wont work would wow whoa yeah yep yes yet you your
   actually alright already always another answer anyone anything around away awesome
   basically better bring calm careful check chill dear easy either enough everyone everything
   excuse follow forget forgive found gone guys happy hear heard hold honestly hurry idea
   inside instead later leave listen maybe mind minute moment morning night nobody nothing
   nowhere obviously outside perfect perhaps probably quick quiet ready remember seriously
   simply someone something somewhere sounds speak start thanks though today tonight totally
   trust truly until upstairs whatever whenever wherever whether whose yours yourself
   alien bluff chat main mainly party people real stream streamer twitch world
   ahh aww meh oops phew psst shh ugh welp whoops yikes yup`.split(/\s+/),
);

// "Aliens", "Looks", "Mainly": inflections of everyday words are everyday words too
function isCommonWord(lowered: string): boolean {
  if (COMMON_WORDS.has(lowered)) {
    return true;
  }
  const stems = [
    lowered.replace(/s$/, ''),
    lowered.replace(/es$/, ''),
    lowered.replace(/ly$/, ''),
    lowered.replace(/ing$/, ''),
    lowered.replace(/ed$/, ''),
  ];
  return stems.some((stem) => stem !== lowered && stem.length >= 3 && COMMON_WORDS.has(stem));
}

// Contraction endings that never close a name ("Aren't" became Brent, live 09-22)
const CONTRACTION = /[’'](t|re|ve|ll|d|m)$/;

// Whisper keeps a name's first sound even when it garbles the rest (Lily/Lillie,
// Meika/Mika, Ren/Wren). A different first sound is a different word: "People" ->
// Temple, "Looks" -> Socks, "San" -> Ian (live 09-17..09-22)
function firstSound(text: string): string {
  return text.replace(/^c/, 'k').charAt(0);
}

// The game's worlds. Whisper has never heard of them and spells what it hears: "Dale Sol
// Valley" for Del Sol Valley (live 09-27), and the sims then remember the wrong place
export const SIMS_WORLDS = [
  'Willow Creek',
  'Oasis Springs',
  'Newcrest',
  'Magnolia Promenade',
  'Windenburg',
  'San Myshuno',
  'Forgotten Hollow',
  'Brindleton Bay',
  'Del Sol Valley',
  'StrangerVille',
  'Sulani',
  'Glimmerbrook',
  'Britechester',
  'Evergreen Harbor',
  'Mt. Komorebi',
  'Henford-on-Bagley',
  'Tartosa',
  'Moonwood Mill',
  'Copperdale',
  'San Sequoia',
  'Chestnut Ridge',
  'Tomarang',
  'Ciudad Enamorada',
  'Ravenwood',
  'Nordhaven',
  'Innisgreen',
  'Gibbi Point',
  'Granite Falls',
  'Selvadorada',
  'Batuu',
  'Sixam',
];

// Words of a world name are places, not near-miss sims: "Sol" must not become Sal
const WORLD_WORDS = new Set(
  SIMS_WORLDS.flatMap((world) => world.toLowerCase().split(/[\s.-]+/)).filter((word) => word.length >= 3),
);

// Letters only, phonetically loosened, spaces gone: "Stranger Ville" is StrangerVille
function placeKey(text: string): string {
  return phonetic(
    text
      .toLowerCase()
      .replace(/[^a-z\s-]/g, '')
      .replace(/-/g, ' '),
  ).replace(/\s+/g, '');
}

const WORLD_KEYS = SIMS_WORLDS.map((world) => ({ world, key: placeKey(world) }));

// Snap a capitalized run of one to three words ("Dale Sol Valley", "Mount Komorebi") to
// the world it is one or two sounds away from. Same guards as the name pass: the first
// sound must agree, everyday words never match alone, and a tie changes nothing.
export function correctPlaces(transcript: string): string {
  if (!transcript) {
    return transcript;
  }
  const words = [...transcript.matchAll(/[A-Za-z][A-Za-z'’-]*/g)].map((match) => ({
    text: match[0],
    start: match.index,
    end: match.index + match[0].length,
  }));
  let result = '';
  let cursor = 0;
  let i = 0;
  while (i < words.length) {
    const first = words[i];
    let snapped: { world: string; count: number } | undefined;
    if (first.text[0] === first.text[0].toUpperCase()) {
      for (let count = Math.min(3, words.length - i); count >= 1 && !snapped; count -= 1) {
        const run = words.slice(i, i + count);
        // Only words joined by spaces or hyphens form one place: "Dale, Sol" does not
        const joined = run.every((word, k) => k === 0 || /^[\s-]+$/.test(transcript.slice(run[k - 1].end, word.start)));
        if (!joined || (count === 1 && isCommonWord(first.text.toLowerCase()))) {
          continue;
        }
        const heard = placeKey(run.map((word) => word.text).join(' '));
        let best = Number.POSITIVE_INFINITY;
        let matches: string[] = [];
        WORLD_KEYS.forEach(({ world, key }) => {
          const distance = levenshtein(heard, key);
          if (distance < best) {
            best = distance;
            matches = [world];
          } else if (distance === best) {
            matches.push(world);
          }
        });
        const allowed = heard.length <= 8 ? 1 : 2;
        if (matches.length === 1 && best <= allowed && firstSound(heard) === firstSound(placeKey(matches[0]))) {
          snapped = { world: matches[0], count };
        }
      }
    }
    if (snapped) {
      result += transcript.slice(cursor, first.start) + snapped.world;
      cursor = words[i + snapped.count - 1].end;
      i += snapped.count;
    } else {
      i += 1;
    }
  }
  return result + transcript.slice(cursor);
}

// Snap tokens within a small edit distance of a known first/last name to that name.
// Conservative on purpose: never touch common speech, never touch exact dictionary words
// (a token that IS a known name stays), and require the candidate to be clearly closest.
//
// The pool is deliberately WIDE (participants included): players pause the game to talk,
// and while paused the state report carries no sims — a scene-scoped pool went empty at
// exactly the moment it was needed (live 08-27: "Margot" stayed uncorrected). The
// wrong-name snaps that motivated scoping were sentence-initial fillers, and the
// COMMON_WORDS guard handles those directly.
// Tie-breaks (J7, the 2026-09-04 playtest handoff, cause 7): "Rin" is phonetic distance 1 from BOTH
// Wren ("ren") and Rainn ("rain"), so the clearly-closest rule let it through uncorrected
// and the sims copied the misspelling into memory. Three keys settle a phonetic tie
// before giving up: same phonetic length as what was heard (a vowel swap, not a dropped
// syllable), then the raw spelling, then presence on the lot (the caller passes the names
// in play). A tie that survives all three stays untouched.
export function correctNames(transcript: string, knownNames: string[], onLotNames: string[] = []): string {
  const vocabulary = new Map<string, string>(); // lowercase -> canonical
  knownNames.forEach((full) => {
    if (isPlaceholderName(full)) {
      // "Sim 153" would otherwise contribute "Sim" as a name candidate
      return;
    }
    full
      .split(/\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length >= 3)
      .forEach((part) => {
        vocabulary.set(part.toLowerCase(), part);
      });
  });
  if (vocabulary.size === 0 || !transcript) {
    return transcript;
  }
  const canonical = [...vocabulary.values()];
  const onLot = new Set<string>();
  onLotNames.forEach((full) => {
    full
      .split(/\s+/)
      .map((part) => part.trim().toLowerCase())
      .filter((part) => part.length >= 3)
      .forEach((part) => onLot.add(part));
  });
  return transcript.replace(/[A-Za-z][A-Za-z'’-]{2,}/g, (token) => {
    const lowered = token.toLowerCase().replace(/[’']s$/, '');
    if (vocabulary.has(lowered)) {
      return token;
    }
    // Only capitalized tokens are name candidates; a lowercase word is prose
    if (token[0] !== token[0].toUpperCase()) {
      return token;
    }
    // Sentence-initial capitalization is indistinguishable from a name, so everyday
    // speech needs its own guard
    if (isCommonWord(lowered) || WORLD_WORDS.has(lowered)) {
      return token;
    }
    // "It's" -> Ito's, "He's" -> Lee's (live 09-17..09-22): a contraction is not a name,
    // and a possessive needs a stem long enough to be one
    if (CONTRACTION.test(token.toLowerCase()) || lowered.length < 3) {
      return token;
    }
    const spoken = phonetic(lowered);
    // One edit covers every real mishearing seen live (Meika, Chapman, Nauki, Margot,
    // Rin); two let "Mainly" become Mayumi and "Aliens" become Alena
    const allowed = spoken.length <= 8 ? 1 : 2;
    const best = closestName(lowered, spoken, canonical, onLot);
    if (best && best.distance <= allowed && firstSound(spoken) === firstSound(phonetic(best.name))) {
      const possessive = /[’']s$/.test(token) ? token.slice(-2) : '';
      return `${best.name}${possessive}`;
    }
    return token;
  });
}

// The single closest candidate by phonetic distance, with the J7 tie-breaks; undefined
// when the phonetic tie cannot be settled (never guess between two equal names).
function closestName(
  lowered: string,
  spoken: string,
  canonical: string[],
  onLot: Set<string>,
): { name: string; distance: number } | undefined {
  let bestDistance = Number.POSITIVE_INFINITY;
  let tied: string[] = [];
  canonical.forEach((name) => {
    const distance = levenshtein(spoken, phonetic(name));
    if (distance < bestDistance) {
      bestDistance = distance;
      tied = [name];
    } else if (distance === bestDistance) {
      tied.push(name);
    }
  });
  if (tied.length === 0) {
    return undefined;
  }
  if (tied.length > 1) {
    // A substitution beats an insertion: "rin" heard for "ren" (Wren) is one vowel off,
    // "rin" for "rain" (Rainn) is a syllable short, and Whisper mishears vowels far more
    // often than it drops them. Keep the candidates whose phonetic length matches.
    const sameLength = tied.filter((name) => phonetic(name).length === spoken.length);
    if (sameLength.length > 0) {
      tied = sameLength;
    }
  }
  if (tied.length > 1) {
    // Then raw spelling: the phonetic layer threw away letters that may tell the names apart
    let rawBest = Number.POSITIVE_INFINITY;
    let rawTied: string[] = [];
    tied.forEach((name) => {
      const raw = levenshtein(lowered, name.toLowerCase());
      if (raw < rawBest) {
        rawBest = raw;
        rawTied = [name];
      } else if (raw === rawBest) {
        rawTied.push(name);
      }
    });
    tied = rawTied;
  }
  if (tied.length > 1) {
    // Then whoever is actually here
    const present = tied.filter((name) => onLot.has(name.toLowerCase()));
    if (present.length === 1) {
      tied = present;
    }
  }
  return tied.length === 1 ? { name: tied[0], distance: bestDistance } : undefined;
}
