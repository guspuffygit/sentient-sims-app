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

// 'HotHeaded' -> 'Hot Headed', 'Arts&Crafts' -> 'Arts & Crafts', 'Rock_Climbing' -> 'Rock Climbing'
export function words(value: string): string {
  return value
    .replace(/_/g, ' ')
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

// trait_Pet_Glutton_Dog -> 'Glutton (Dog)'; trait_Infant_Cautious -> 'Cautious';
// trait_HotHeaded -> 'Hot Headed'. The species stays on a pet trait because the game has a
// Glutton for dogs and a Glutton for sims and they are not the same trait.
export function traitWords(raw: string): string {
  let value = raw.replace(/^trait_/i, '');
  const pet = /^Pet_(.+?)_(Dog|Cat|SmallDog|Fox|Horse)$/i.exec(value);
  if (pet) {
    const species = SPECIES_WORDS[pet[2].toUpperCase()] ?? words(pet[2]);
    return `${words(pet[1])} (${species})`;
  }
  value = value.replace(/^(Infant|Toddler|Child|Teen|Pet|Dog|Cat|Horse)_/i, '');
  return words(value);
}

// trait_Fear_BeingCheatedOn -> 'Being Cheated On'. A fear typed by a player is kept as typed.
export function fearWords(raw: string): string {
  return /^trait_/i.test(raw) ? words(raw.replace(/^trait_(Fear_)?/i, '')) : raw;
}

// What a like or dislike is OF. Read from the live table:
//   trait_SimPreference_Likes_Activities_Cooking    -> 'Cooking'
//   trait_SimPreference_Likes_Music_HipHop          -> 'Hip Hop music'
//   trait_SimPreference_Likes_Color_Blue            -> 'the colour Blue'
//   trait_SimPreference_Likes_Characteristic_Funny  -> 'Funny (in people)'
//   trait_SimPreference_Likes_Communication_Jokes   -> 'Jokes (in conversation)'
//   trait_SimPreference_Likes_Decor_Boho            -> 'Boho decor'
//   trait_Attraction_Activities_Broke_TurnOn        -> 'Broke (turn-on)'
//   trait_Attraction_HairColor_Green_TurnOff        -> 'Green hair (turn-off)'
// The activity is the bare word because that is what a person says ("I like cooking");
// the others keep one word of context because a bare "Blue" or "Jokes" in a list of
// likes reads as nothing in particular.
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
        return `${what} (in people)`;
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

// 'AdultMajor_HomestyleCooking (level 8)' -> 'Homestyle Cooking (level 8)';
// 'Toddler_Communication (level 3)' -> 'Communication (level 3)'; 'Fitness (level 4)' stays.
export function skillWords(raw: string): string {
  const match = /^(.*?)\s*(\(level \d+\))?\s*$/.exec(raw);
  const name = (match?.[1] ?? raw)
    .replace(/^(AdultMajor|AdultMinor|Hidden|Milestone|Infant|Toddler|Child|Teen|Pet|Dog|Cat|Horse)_/gi, '')
    .replace(/^(AdultMajor|AdultMinor|Hidden|Milestone|Infant|Toddler|Child|Teen|Pet|Dog|Cat|Horse)_/gi, '');
  const level = match?.[2];
  return level ? `${words(name)} ${level}` : words(name);
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

// 'career_Adult_Culinary (level 4)' -> { track: 'Culinary', level: '4' }
export function careerParts(raw: string): { track: string; level?: string } {
  const match = /^(.*?)\s*\(level (\d+)\)\s*$/.exec(raw);
  return { track: careerTrackWords(match ? match[1] : raw), level: match?.[2] };
}

// 'Track_Popularity_A' -> 'Popularity'; 'Track_Creativity_MasterActor' -> 'Master Actor (Creativity)';
// 'Track_Mental' -> 'Mental'; 'aspiration_Something' -> 'Something'. The game names most
// tracks with a letter the player never sees, so the category is the readable part.
export function aspirationWords(raw: string): string {
  const track = /^Track_([A-Za-z]+)(?:_(.+))?$/i.exec(raw);
  if (track) {
    const category = words(track[1]);
    const name = track[2];
    if (!name || /^[A-Z]$/i.test(name)) {
      return category;
    }
    return `${words(name)} (${category})`;
  }
  return words(raw.replace(/^aspiration_/i, ''));
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
      return traitWords(objectText);
    case FactPredicate.FEAR:
      return fearWords(objectText);
    case FactPredicate.LIKES:
    case FactPredicate.DISLIKES:
      return preferenceWords(objectText);
    case FactPredicate.SKILL:
      return skillWords(objectText);
    case FactPredicate.JOB: {
      const { track, level } = careerParts(objectText);
      return level ? `${track} (level ${level})` : track;
    }
    case FactPredicate.ASPIRATION:
      return aspirationWords(objectText);
    case FactPredicate.FAMILY_BIT:
      return familyBitWords(objectText).replace(/^their /, '');
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
