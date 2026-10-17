// The game's names for things, said in plain words. One place for it, used by both the
// <KNOWN_FACTS> block and the Facts dialog, so a sim and the player read the same words.
//
// The store keeps the game's own identifiers (trait_Pet_Glutton_Dog,
// trait_SimPreference_Likes_Activities_Cooking): the dossier diff needs a stable key, and
// the identifier is the only thing two mod builds are guaranteed to agree on. Everything
// here is rendering. The shapes were read off a live database on 2026-10-12 and are
// listed beside each rule; anything unrecognised falls back to a readable form of the raw
// name rather than being dropped, because a wrong-looking label is debuggable and a
// missing one is not.

import { FactPredicate } from '../pipeline/facts/predicates';

const SPECIES_WORDS: Record<string, string> = {
  DOG: 'Dog',
  CAT: 'Cat',
  SMALLDOG: 'Small Dog',
  FOX: 'Fox',
  HORSE: 'Horse',
};

// Tuning words that are abbreviations in the game files. NLS is the Natural Living skill
// from Enchanted by Nature (the mod's posture names posture_NLS_MeditateInNature and
// posture_NLS_SleepOnGround are that pack's); a player read "NLS" under likes and could
// not tell what it was (2026-10-13).
const ABBREVIATIONS: Record<string, string> = {
  NLS: 'Natural Living',
};

// 'HotHeaded' -> 'Hot Headed', 'Arts&Crafts' -> 'Arts & Crafts', 'Rock_Climbing' -> 'Rock Climbing'
export function words(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b[A-Z]+\b/g, (token) => ABBREVIATIONS[token] ?? token)
    .replace(/&/g, ' & ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

// 'ELDER' -> 'elder', 'YOUNGADULT' -> 'young adult', 'OLD_AGE' -> 'old age', 'SMALLDOG' -> 'small dog'
const ENUM_WORDS: Record<string, string> = {
  YOUNGADULT: 'young adult',
  SMALLDOG: 'small dog',
};

export function enumWords(value: string): string {
  const key = value.trim().toUpperCase();
  return ENUM_WORDS[key] ?? key.replace(/_/g, ' ').toLowerCase();
}

// Traits whose tuning name is not what the game calls them on screen. A sim says the
// on-screen word, so these matter in the prompt as much as in the window.
const TRAIT_NAMES: Record<string, string> = {
  // Renamed in the game years ago; the tuning kept the old name
  insane: 'Erratic',
  // The Lovestruck trait is "Lovebug" on screen
  lovestruck: 'Lovebug',
  hometurf: 'Loves Being Home',
  // Satisfaction-store rewards, said as what they do (Jaz, 2026-10-13)
  marketable: 'Crafts High Value Items',
  temperature_coldacclimation: 'Immune to Cold Weather',
  temperature_heatacclimation: 'Immune to Hot Weather',
  stormchaser: 'Loves Stormy Weather',
  naturalist: 'Immune to Fire',
  waterproof: 'Waterproof',
  // Seasons rewards named after what they resist, not after their tuning
  temperature_iceman: 'Iceproof',
  temperature_burningman: 'Heatproof',
  // "The Knack" is the child reward for repairs; the panel calls it Handy (Jaz, 2026-10-13)
  theknack: 'Handy',
  // Rewards whose panel name is not their tuning name (Jaz, 2026-10-13)
  freeservices: 'Receives Free Services',
  longevity: 'Long-lived',
  clubpresident: 'Natural Leader',
  morningperson: 'Morning Sim',
  familysim: 'Domestic',
  selfassured: 'Self-Assured',
  hotheaded: 'Hot-Headed',
  // Growing Together's Beloved is trait_Legendary in the files (Mara Bellweather had
  // "Legendary" in the window and "Beloved" on her panel, 2026-10-13)
  legendary: 'Beloved',
  nosyneighbor: 'Confidante',
};

// WickedWhims rewards: TURBODRIVER:WickedWhims_Trait_<System>_<Name>, with a Reward token
// before or after the name. The system (Attractiveness, Nudity, Sex) is the mod's filing,
// not part of the name the player sees.
const WICKED_WHIMS_SYSTEMS = /^(Attractiveness|Nudity|Sex|Personality|Reward|Trait)$/i;
const WICKED_WHIMS_NAMES: Record<string, string> = {
  nosweat: "Doesn't Sweat",
  fertilityissues: 'Hypofertile',
};

// A `phase` fact that is actually a childhood phase or a child's confidence. The game
// also types WickedWhims' Hypofertile as a PHASE, and that one is just a trait.
export function isChildPhase(raw: string): boolean {
  return /ChildhoodPhase_|ChildConfidence_/i.test(raw);
}

// trait_Pet_Glutton_Dog -> 'Glutton (Dog)'; trait_Infant_Cautious -> 'Cautious';
// trait_HotHeaded -> 'Hot Headed'; trait_Insane -> 'Erratic'. The species stays on a pet
// trait because the game has a Glutton for dogs and a Glutton for sims and they are not
// the same trait. Reward traits and phases pass through here too:
//   trait_Business_Savvy -> 'Business Savvy'; trait_Reward_Infant_TopNotch -> 'Top-Notch Infant';
//   trait_ChildSkillReward_Headstrong -> 'Headstrong'; trait_ChildhoodPhase_Clingy -> 'Clingy';
//   trait_ChildConfidence_High -> 'High Confidence';
//   TURBODRIVER:WickedWhims_Trait_Personality_Archetype_Lover_Major -> 'Lover'
//   TURBODRIVER:WickedWhims_Trait_Personality_Archetype_Sinister_Minor -> 'Sinister'
export function traitWords(raw: string): string {
  const archetype = /WickedWhims_Trait_Personality_Archetype_(.+?)_(Major|Minor)$/i.exec(raw);
  if (archetype) {
    // WickedWhims has a major and a minor impression; both read as the bare word
    return words(archetype[1]);
  }
  const wicked = /^TURBODRIVER:WickedWhims_Trait_(.+)$/i.exec(raw);
  if (wicked) {
    const name = wicked[1]
      .split('_')
      .filter((token) => !WICKED_WHIMS_SYSTEMS.test(token))
      .join('_');
    return WICKED_WHIMS_NAMES[name.toLowerCase()] ?? words(name);
  }
  let value = raw.replace(/^trait_/i, '');
  const pet = /^Pet_(.+?)_(Dog|Cat|SmallDog|Fox|Horse)$/i.exec(value);
  if (pet) {
    const species = SPECIES_WORDS[pet[2].toUpperCase()] ?? words(pet[2]);
    return `${words(pet[1])} (${species})`;
  }
  const topNotch = /^(?:Reward_)?(?:(Infant|Toddler|Child)_)?TopNotch(Infant|Toddler|Child|Foal)?$/i.exec(value);
  if (topNotch) {
    const stage = topNotch[1] || topNotch[2];
    return stage ? `Top-Notch ${words(stage)}` : 'Top-Notch';
  }
  const confidence = /^ChildConfidence_(.+)$/i.exec(value);
  if (confidence) {
    return `${words(confidence[1])} Confidence`;
  }
  const named = TRAIT_NAMES[value.toLowerCase()];
  if (named) {
    return named;
  }
  // A pet quirk is a fear or a fixation: trait_PetQuirk_Fear_Vacuum -> 'Afraid of Vacuum'
  const quirk = /^(?:Pet|Cat|Dog)Quirk_(Fear|Obsessed)_(.+)$/i.exec(value);
  if (quirk) {
    return quirk[1].toLowerCase() === 'fear' ? `Afraid of ${words(quirk[2])}` : `Obsessed with ${words(quirk[2])}`;
  }
  // The pack or system a reward came from is a prefix the panel never shows:
  // trait_NewInTown_InspiredExplorer -> 'Inspired Explorer',
  // trait_CorporateWorker_CharismaticCrooner -> 'Charismatic Crooner',
  // trait_Excursion_Mountaineer_Rank3 -> 'Capable Mountaineer' (the rank is the name)
  const mountaineer = /^Excursion_Mountaineer_Rank(\d)$/i.exec(value);
  if (mountaineer) {
    return (
      ['Novice Mountaineer', 'Capable Mountaineer', 'Expert Mountaineer'][Number(mountaineer[1]) - 1] ?? 'Mountaineer'
    );
  }
  value = value
    .replace(
      /^(ChildhoodPhase|ChildSkillReward|Reward|LifeSkills|Temperature|PetQuirk|CatQuirk|DogQuirk|NewInTown|CorporateWorker|Horse_Gameplay|MovingOn|MultiUnit_Aspiration|Nature|Entrepreneur|Doctor|Handyperson|JungleExplorer|ArchaeologyScholar|BeachBum)_/i,
      '',
    )
    .replace(/^(Infant|Toddler|Child|Teen|Pet|Dog|Cat|Horse)_/i, '');
  return TRAIT_NAMES[value.toLowerCase()] ?? words(value);
}

// Fears the panel names more fully than their tuning does: "Fear of the Dark", "Fear of
// Unfulfilled Dreams". A bare "Dark" or "Unfulfilled" in a list did not read as a fear.
const FEAR_NAMES: Record<string, string> = {
  dark: 'The Dark',
  unfulfilled: 'Unfulfilled Dreams',
  deadendjob: 'Dead-End Job',
  cowplant: 'Cowplants',
};

// trait_Fear_BeingCheatedOn -> 'Being Cheated On'. A fear typed by a player is kept as typed.
export function fearWords(raw: string): string {
  if (!/^trait_/i.test(raw)) {
    return raw;
  }
  const name = raw.replace(/^trait_(Fear_)?/i, '');
  return FEAR_NAMES[name.toLowerCase()] ?? words(name);
}

// What a like or dislike is OF. Read from the live table:
//   trait_SimPreference_Likes_Activities_Cooking    -> 'Cooking'
//   trait_SimPreference_Likes_Music_HipHop          -> 'Hip Hop music'
//   trait_SimPreference_Likes_Color_Blue            -> 'the colour Blue'
//   trait_SimPreference_Likes_Characteristic_Funny  -> 'Funny Sims'
//   trait_SimPreference_Likes_Communication_Jokes   -> 'Jokes (in conversation)'
//   trait_SimPreference_Likes_Decor_Boho            -> 'Boho decor'
//   trait_Attraction_Activities_Broke_TurnOn        -> 'Broke (turn-on)'
//   trait_Attraction_HairColor_Green_TurnOff        -> 'Green hair (turn-off)'
// The activity is the bare word because that is what a person says ("I like cooking");
// the others keep one word of context because a bare "Blue" or "Jokes" in a list of
// likes reads as nothing in particular.
export type PreferenceKind = 'likes' | 'dislikes' | 'turn-on' | 'turn-off';

// The Facts window's sub-heading for a like, and the bare words under it: the heading
// says "Colors", so the row says "Blue" and not "the colour Blue". Everything the live
// table holds (2026-10-12): Activities, Characteristic, Color, Communication, Music,
// Decor, Fashion for likes; Activities, Characteristics, Fashion, HairColor,
// SkillArchetypes, RomanceStyles for turn-ons.
// Characteristic words the game shows differently from its tuning. "Idealist" is
// what the files say; the Likes panel in the game says "Artsy" (Alex Moyer dislikes
// artsy Sims in game and her dossier says Characteristic_Idealist, 2026-10-13).
const CHARACTERISTIC_NAMES: Record<string, string> = {
  idealist: 'Artsy',
  kidenthusiast: 'Family-Oriented',
  optimist: 'Optimistic',
};

// The Lovestruck panel's own headings for a turn-on: Broke, Wealthy and Slacker are a
// "Way of Life" there, not activities, and so is Performer, which the files put under
// SkillArchetypes (Augustus St.Fleur's panel, 2026-10-13)
const ATTRACTION_GROUPS: Record<string, string> = {
  activities: 'Way of Life',
  characteristics: 'Characteristics',
  fashion: 'Fashion',
  haircolor: 'Hair Color',
  outfitcolor: 'Outfit Color',
  skillarchetypes: 'Skills',
  romancestyles: 'Romance Styles',
};
const WAY_OF_LIFE_SKILLS = /^Performer$/i;

function characteristicWords(value: string): string {
  return CHARACTERISTIC_NAMES[value.toLowerCase()] ?? words(value);
}

const PREFERENCE_GROUPS: Record<string, string> = {
  activities: 'Activities',
  characteristic: 'Types of Sims',
  characteristics: 'Types of Sims',
  color: 'Colors',
  communication: 'Conversation Topics',
  music: 'Music',
  decor: 'Decor',
  fashion: 'Fashion',
  haircolor: 'Hair Color',
  skillarchetypes: 'Skills',
  romancestyles: 'Romance Styles',
};

export function preferenceParts(raw: string): { group?: string; label: string } {
  const attraction = /^trait_Attraction_([A-Za-z]+)_(.+?)_(?:TurnOn|TurnOff)$/i.exec(raw);
  if (attraction) {
    const category = attraction[1].toLowerCase();
    const what = attraction[2];
    const group =
      category === 'skillarchetypes' && WAY_OF_LIFE_SKILLS.test(what)
        ? ATTRACTION_GROUPS.activities
        : (ATTRACTION_GROUPS[category] ?? words(attraction[1]));
    return { group, label: category === 'characteristics' ? characteristicWords(what) : words(what) };
  }
  const match = /^trait_SimPreference_(?:Likes|Dislikes)_([A-Za-z]+)_(.+)$/i.exec(raw);
  if (!match) {
    return { label: preferenceWords(raw) };
  }
  const category = match[1].toLowerCase();
  const what = words(match[2]);
  const group = PREFERENCE_GROUPS[category] ?? words(match[1]);
  return { group, label: group === 'Types of Sims' ? `${characteristicWords(match[2])} Sims` : what };
}

// Which list a like/dislike row belongs in. The store files Lovestruck turn-ons under
// `likes` and turn-offs under `dislikes` (the mod reads them off the same preference
// tracker), and a player reading "likes: Broke (turn-on)" between Cooking and Hip Hop
// asked for them to be their own thing.
export function preferenceKind(raw: string, predicate: 'likes' | 'dislikes'): PreferenceKind {
  const attraction = /^trait_Attraction_.*_(TurnOn|TurnOff)$/i.exec(raw);
  if (attraction) {
    return attraction[1].toLowerCase() === 'turnon' ? 'turn-on' : 'turn-off';
  }
  return predicate;
}

// A turn-on or turn-off without the "(turn-on)" tail, for a list that is already headed
// "Turn-ons": 'trait_Attraction_HairColor_Green_TurnOn' -> 'Green hair'
export function attractionWords(raw: string): string {
  return preferenceWords(raw).replace(/\s*\((turn-on|turn-off)\)$/, '');
}

export function preferenceWords(raw: string): string {
  const preference = /^trait_SimPreference_(?:Likes|Dislikes)_([A-Za-z]+)_(.+)$/i.exec(raw);
  if (preference) {
    const category = preference[1].toLowerCase();
    const what = words(preference[2]);
    switch (category) {
      case 'activities':
        return what;
      case 'music':
        return `${what} music`;
      case 'color':
        return `the colour ${what}`;
      case 'characteristic':
      case 'characteristics':
        // A like of "Funny" is a like of funny Sims, and that is the plain way to say it
        return `${characteristicWords(preference[2])} Sims`;
      case 'communication':
        return `${what} (in conversation)`;
      case 'decor':
        return `${what} decor`;
      case 'fashion':
        return `${what} fashion`;
      default:
        return what;
    }
  }
  const attraction = /^trait_Attraction_([A-Za-z]+)_(.+?)_(TurnOn|TurnOff)$/i.exec(raw);
  if (attraction) {
    const category = attraction[1].toLowerCase();
    const what = words(attraction[2]);
    const kind = attraction[3].toLowerCase() === 'turnon' ? 'turn-on' : 'turn-off';
    if (category === 'haircolor') {
      return `${what} hair (${kind})`;
    }
    if (category === 'fashion') {
      return `${what} fashion (${kind})`;
    }
    return `${what} (${kind})`;
  }
  return /^trait_/i.test(raw) ? words(raw.replace(/^trait_/i, '')) : raw;
}

// Skills whose tuning name is not what the game calls them on screen. A sim says the
// on-screen word, so these matter in the prompt as much as in the window.
const SKILL_NAMES: Record<string, string> = {
  homestylecooking: 'Cooking',
  bartending: 'Mixology',
  // The hidden climbing-wall skill is the Rock Climbing skill on screen
  treadmill_rock_climbingwall_climb: 'Rock Climbing',
};

// 'AdultMajor_HomestyleCooking (level 8)' -> 'Cooking (level 8)';
// 'Toddler_Communication (level 3)' -> 'Communication (level 3)'; 'Fitness (level 4)' stays.
export function skillWords(raw: string): string {
  const match = /^(.*?)\s*(\(level \d+\))?\s*$/.exec(raw);
  const name = (match?.[1] ?? raw)
    .replace(/^(AdultMajor|AdultMinor|Hidden|Milestone|Infant|Toddler|Child|Teen|Pet|Dog|Cat|Horse)_/gi, '')
    .replace(/^(AdultMajor|AdultMinor|Hidden|Milestone|Infant|Toddler|Child|Teen|Pet|Dog|Cat|Horse)_/gi, '');
  const level = match?.[2];
  const shown = SKILL_NAMES[name.toLowerCase()] ?? words(name);
  return level ? `${shown} ${level}` : shown;
}

// The career track as a person says it. 'career_Adult_Culinary' -> 'Culinary';
// 'career_Adult_NPC_Nanny' -> 'Nanny'; 'career_Adult_PartTime_Barista' -> 'Barista (part-time)';
// 'career_Adult_Freelancer_Artist' -> 'Freelance Artist'; 'career_Adult_Active_ActorCareer' -> 'Actor';
// 'careers_Adult_CorporateWorker' -> 'Corporate Worker'; 'career_Child_GradeSchool' -> 'Grade School'.
// A job typed by a player ("Pub Owner at The Gnome's Arms") is kept as typed.
export function careerTrackWords(raw: string): string {
  if (!/^careers?_/i.test(raw) && !/Career/.test(raw)) {
    return raw;
  }
  let value = raw.replace(/^careers?_(Adult|Teen|Child)_/i, '').replace(/^careers?_/i, '');
  let suffix = '';
  if (/^PartTime_/i.test(value)) {
    value = value.replace(/^PartTime_/i, '');
    suffix = ' (part-time)';
  }
  const freelance = /^Freelancer_/i.test(value);
  value = value
    .replace(/^(NPC|Active|Freelancer)_/i, '')
    .replace(/Career(_\d+)?$/i, '')
    .replace(/_\d+$/, '');
  // 'detectiveCareer_1' is the one lower-case track name in the live table
  const spaced = words(value);
  const track = spaced.charAt(0).toUpperCase() + spaced.slice(1);
  return `${freelance ? `Freelance ${track}` : track}${suffix}`;
}

// Branch names the game spells differently from their tuning
const CAREER_BRANCH_NAMES: Record<string, string> = {
  bodybuilder: 'Bodybuilder',
  proathlete: 'Professional Athlete',
};

// The branch a career track name carries, or undefined on the track every career starts
// on. Read off the mod's logs: 'Athletic_Track1' (no branch), 'Athletic_Track3_BodyBuilder'
// -> 'Bodybuilder', 'careerTrack3_Florist' -> 'Florist', 'careerTrack_NPC_Bartender' (none).
export function careerBranchWords(track: string | undefined): string | undefined {
  const match = track ? /Track(\d+)_(.+)$/i.exec(track) : null;
  if (!match || Number(match[1]) < 2) {
    return undefined;
  }
  return CAREER_BRANCH_NAMES[match[2].toLowerCase()] ?? words(match[2]);
}

// 'career_Adult_Culinary (level 4)' -> { track: 'Culinary', level: '4' };
// 'career_Adult_Athletic/Athletic_Track3_BodyBuilder (level 10)' -> { track: 'Athletic',
// branch: 'Bodybuilder', level: '10' }. The branch rides the claim after a slash so a
// change of branch reads as a new job the way a promotion does.
export function careerParts(raw: string): { track: string; branch?: string; level?: string } {
  const match = /^(.*?)\s*\(level (\d+)\)\s*$/.exec(raw);
  const [career, track] = (match ? match[1] : raw).split('/');
  return { track: careerTrackWords(career), branch: careerBranchWords(track), level: match?.[2] };
}

// 'Bodybuilder (Athletic, level 10)', 'Culinary (level 4)', 'Culinary'
export function jobTitleWords(raw: string): string {
  const { track, branch, level } = careerParts(raw);
  const inside = [branch ? track : undefined, level ? `level ${level}` : undefined].filter(Boolean).join(', ');
  return inside ? `${branch ?? track} (${inside})` : (branch ?? track);
}

// A business the sim owns, as the store keeps it: the name alone for a small business
// ('Vale Curios'), the kind after it for the others ('Chez Vale (restaurant)').
const BUSINESS_KINDS: Record<string, string> = {
  retail: 'retail store',
  restaurant: 'restaurant',
  vet: 'vet clinic',
};

export function businessText(name: string, type?: string): string {
  const kind = type ? BUSINESS_KINDS[type.trim().toLowerCase()] : undefined;
  return kind ? `${name} (${kind})` : name;
}

export function businessParts(raw: string): { name: string; kind: string } {
  const match = /^(.*?)\s*\((retail store|restaurant|vet clinic)\)\s*$/i.exec(raw);
  return match ? { name: match[1], kind: match[2].toLowerCase() } : { name: raw, kind: 'small business' };
}

// The base game names its aspiration tracks with a letter in the order Create a Sim lists
// them (Track_Family_A is Successful Lineage, confirmed on Tessa Vale 2026-10-13); packs
// name theirs. A letter not listed here falls back to the category alone.
const ASPIRATION_NAMES: Record<string, string> = {
  athletic_a: 'Bodybuilder',
  creativity_a: 'Painter Extraordinaire',
  creativity_b: 'Musical Genius',
  creativity_c: 'Bestselling Author',
  deviance_a: 'Public Enemy',
  deviance_b: 'Chief of Mischief',
  family_a: 'Successful Lineage',
  family_b: 'Big Happy Family',
  food_a: 'Master Chef',
  food_b: 'Master Mixologist',
  fortune_a: 'Fabulously Wealthy',
  fortune_b: 'Mansion Baron',
  knowledge_a: 'Renaissance Sim',
  knowledge_b: 'Nerd Brain',
  knowledge_c: 'Computer Whiz',
  love_a: 'Serial Romantic',
  love_b: 'Soulmate',
  nature_a: 'Freelance Botanist',
  nature_b: 'The Curator',
  nature_c: 'Angling Ace',
  popularity_a: 'Friend of the World',
  popularity_b: 'Party Animal',
  popularity_c: 'Joke Star',
  animal_a: 'Friend of the Animals',
  // The child aspirations are one per category
  mental: 'Whiz Kid',
  social: 'Social Butterfly',
  motor: 'Rambunctious Scamp',
};

// 'Track_Family_A' -> { name: 'Successful Lineage', category: 'Family' };
// 'Track_Creativity_MasterActor' -> { name: 'Master Actor', category: 'Creativity' };
// 'Track_Mental' -> { name: 'Whiz Kid', category: 'Mental' }; an unknown letter has no name.
export function aspirationParts(raw: string): { name?: string; category: string } {
  const track = /^Track_([A-Za-z]+)(?:_(.+))?$/i.exec(raw);
  if (!track) {
    return { category: words(raw.replace(/^aspiration_/i, '')) };
  }
  const category = words(track[1]);
  const name = track[2];
  const known = ASPIRATION_NAMES[`${track[1]}${name ? `_${name}` : ''}`.toLowerCase()];
  if (known) {
    return { name: known, category };
  }
  return { name: name && !/^[A-Z]$/i.test(name) ? words(name) : undefined, category };
}

// 'Track_Family_A' -> 'Successful Lineage'; an unknown letter falls back to the category
// ('Track_Popularity_Z' -> 'Popularity')
export function aspirationWords(raw: string): string {
  const { name, category } = aspirationParts(raw);
  return name ?? category;
}

// 'family_Target_IsSonOrDaughterOf_Actor' -> 'their child'. The bit is written from the
// ACTOR's side (the subject of the fact), so Target_Is<X>Of_Actor means the other sim is
// the subject's <X>. The romantic bits ('romantic-Married') are the game's relationship
// bits and say the same thing the spouse/fiance edges do.
export function familyBitWords(bit: string): string {
  const romantic = /^romantic-(.+)$/i.exec(bit);
  if (romantic) {
    return words(romantic[1]).toLowerCase();
  }
  const match = /family_Target_Is(.+?)Of_Actor/i.exec(bit);
  const role = match ? match[1] : undefined;
  if (!role) {
    return words(bit.replace(/^family_/, ''));
  }
  const lowered = role.toLowerCase();
  const table: Record<string, string> = {
    sonordaughter: 'their child',
    parent: 'their parent',
    siblings: 'their sibling',
    sibling: 'their sibling',
    // The game's actual sibling bit is family_Target_IsBrotherSisterOf_Actor; it rendered
    // as "your brother sister" in every live facts block until 2026-09-04
    brothersister: 'their sibling',
    brotherorsister: 'their sibling',
    grandparent: 'their grandparent',
    grandchild: 'their grandchild',
    auntuncle: 'their aunt or uncle',
    niecenephew: 'their niece or nephew',
    cousin: 'their cousin',
    spouse: 'their spouse',
    // The game keeps step relations OUT of genealogy - a stepparent appears in nobody's
    // family tree but their own - so the bit is the only record of one that exists. Live
    // 2026-09-05: Alex Moyer read to her stepson Ehren as "you live together" and nothing
    // more, while both his birth parents read as parents, and he spent the day guessing
    // what she was to him ("my dads", "two moms", "Daddy Jonah and Alex").
    stepparent: 'their stepparent',
    stepchild: 'their stepchild',
    stepsibling: 'their stepsibling',
  };
  return table[lowered] ?? `their ${words(role).toLowerCase()}`;
}

// The value of one fact in plain words, by predicate. The Facts dialog shows this; the
// prompt uses the same pieces inside its sentences.
export function factValueWords(predicate: string, objectText: string): string {
  switch (predicate) {
    case FactPredicate.TRAIT:
    case FactPredicate.REWARD_TRAIT:
    case FactPredicate.PHASE:
      return traitWords(objectText);
    case FactPredicate.FEAR:
      return fearWords(objectText);
    case FactPredicate.LIKES:
    case FactPredicate.DISLIKES:
      return preferenceWords(objectText);
    case FactPredicate.SKILL:
      return skillWords(objectText);
    case FactPredicate.JOB:
      return jobTitleWords(objectText);
    case FactPredicate.BUSINESS:
      return objectText;
    case FactPredicate.ASPIRATION:
      return aspirationWords(objectText);
    case FactPredicate.FAMILY_BIT:
      return familyBitWords(objectText).replace(/^their /, '');
    case FactPredicate.EX_PARTNER:
      return objectText;
    case FactPredicate.AGE_STAGE:
    case FactPredicate.GENDER:
    case FactPredicate.OCCULT:
    case FactPredicate.OCCULT_CURRENT:
    case FactPredicate.SPECIES:
    case FactPredicate.DEATH_TYPE:
      return /^[A-Z0-9_+ ]+$/.test(objectText.trim()) ? enumWords(objectText) : words(objectText);
    default:
      return objectText;
  }
}
