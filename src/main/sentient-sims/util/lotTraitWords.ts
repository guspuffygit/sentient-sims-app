import { plainName } from './lotFurnishings';

// Lot traits and lot challenges as the Build mode panel names them, with one short clause each
// in the lot's own terms. The mod sends the game's tuning names (zoneModifier_lotTrait_FreshAir,
// zoneModifier_lotTrait_BurglarTime) and those read wrong split into words ("Fresh Air" is
// Bracing Breezes on the panel, "Burglar Time" is Heist Havoc; live 2026-10-17). Names and
// descriptions follow the Sims wiki "Lot traits and challenges" page (2026-10-18); the clause
// says what the place is like, never the game rule behind it, so the writer can colour a
// sentence with it without explaining a mechanic.

export type LotTraitWords = {
  name: string;
  flavor?: string;
  challenge: boolean;
};

type Entry = [name: string, flavor?: string];

// Keyed by the tuning name with every prefix and category word stripped and lowercased
// (traitKey): zoneModifier_lotTrait_FreshAir -> freshair, zoneModifier_pro_Quiet -> quiet
const TRAITS: Record<string, Entry> = {
  // Base game
  greatacoustics: ['Great Acoustics', 'the acoustics are perfect, a good place to play music'],
  highspeedinternet: ['Fast Internet', 'a fast internet connection'],
  homey: ['Homey', 'a homey feel that suits cooking, fixing things and gardening'],
  sciencelair: ['Science Lair', 'secluded, with little to distract a mind at work'],
  convivial: ['Convivial', 'spacious but intimate, easy to talk in'],
  naturallight: ['Natural Light', 'the light is good for painting and photographs'],
  freshair: ['Bracing Breezes', 'oodles of fresh air, bracing for exercise'],
  notrespassing: ['Private Dwelling', 'a private place that keeps uninvited callers away'],
  teenhangout: ['Teen Neighborhood', 'teens hang around the streets nearby'],
  teenneighborhood: ['Teen Neighborhood', 'teens hang around the streets nearby'],
  clothingoptional: ['Clothing Optional', 'clothing is optional here'],
  regalresidence: ['Regal Residence', 'a luxurious home where the good life is lived'],
  // City Living
  chefskitchen: ["Chef's Kitchen", 'a kitchen fit for a chef'],
  neargoodschools: ['Good Schools', 'the local school is a good one'],
  meanvibe: ['Mean Vibe', 'a mean vibe hangs over the place'],
  homestudio: ['Home Studio', 'an artsy feel, good for painting, writing and woodwork'],
  sunnyaspect: ['Sunny Aspect', 'beautiful scenery that lifts the mood as the sun goes down'],
  pennypixies: ['Penny Pixies', 'loose change turns up in odd corners'],
  greatatmosphere: ['Party Place', 'parties go well here'],
  romanticatmosphere: ['Romantic Aura', 'a romantic aura'],
  greatsoil: ['Great Soil', 'the soil is rich and the garden thrives'],
  childsplay: ["Child's Play", 'a place where children learn fast'],
  onleyline: ['On Ley Line', 'built on a ley line, full of fertile earth energy'],
  gnomes: ['Gnomes', 'broken things mend themselves overnight, as if gnomes watch over the place'],
  // City Living apartments
  cheap: ['Cheap', 'the rent is cheap'],
  greatview: ['Great View', 'a beautiful view from the windows'],
  historical: ['Historical', 'a plaque to a famous former resident that can never come down'],
  livelyneighbors: ['Lively Neighbors', 'the neighbors party often'],
  lowdeposit: ['Low Deposit', 'a suspiciously low deposit'],
  needstlc: ['Needs TLC', 'a fixer-upper: pipes burst, lights fail, pests get in'],
  pricey: ['Pricey', 'the rent is high'],
  romanticfireplace: ['Romantic Fireplace', 'a beautiful fireplace with a flirty glow'],
  servicedapartment: ['Serviced Apartment', 'maid service comes with the rent'],
  quiet: ['Quiet', 'never noisy, whatever the neighbors do'],
  cursed: ['Cursed', 'things go wrong here more than they should'],
  // Vampires
  ondarkleyline: ['On A Dark Ley Line', 'dark energy runs under the lot'],
  registeredvampirelair: [
    'Registered Vampire Lair',
    'registered as a vampire lair; gifts from the League come by mail',
  ],
  vampirenexus: ['Vampire Nexus', 'a dark void envelops the lot and vampires are drawn to it'],
  // Cats & Dogs
  breedingground: ['Breeding Grounds', 'pets have large litters here'],
  catfriendly: ['Cat Friendly', 'cats and their owners come by'],
  cathangout: ['Cat Hangout', 'stray cats love the place'],
  dogfriendly: ['Dog Friendly', 'dogs and their owners come by'],
  doghangout: ['Dog Hangout', 'stray dogs hang around'],
  trainingground: ['Training Ground', 'a good place to train a pet'],
  // Jungle Adventure
  peaceandquiet: ['Peace and Quiet', 'peaceful, good for reading; tension drains away'],
  // Get Famous
  celebrityhomelottrait: ['Celebrity Home', 'a celebrity home on the tour routes, with restricted access at the door'],
  celebrityhome: ['Celebrity Home', 'a celebrity home on the tour routes, with restricted access at the door'],
  celebrityhangouthighfame: [
    'Hottest Spot in Town',
    'the hottest spot in town, for superstars and VIPs, at hyperinflated prices',
  ],
  celebrityhangoutlowfame: [
    'Up-and-Coming Hotspot',
    'an up-and-coming hotspot, cool before it was cool, with cheap drinks for the famous',
  ],
  // Island Living
  islandspirits: ['Island Spirits', 'ancient island spirits visit the lot'],
  oceanicparadise: ['Oceanic Paradise', 'the sea here teems with dolphins and rare fish'],
  // Discover University
  studyspot: ['Study Spot', 'a good place to study, quiet and focused'],
  universitystudenthangout: ['University Student Hang Out', 'cheap food and drink; university students flock here'],
  // Eco Lifestyle
  ecolot: ['Eco Lot', 'an eco-friendly lot'],
  geothermal: ['Geothermal', 'natural heat from the ground warms the pool and powers the place'],
  naturalwell: ['Natural Well', 'spring water runs under the lot, fresh from the tap'],
  // Lovestruck
  singleshangout: ['Singles Hangout', 'singles looking to mingle pass through'],
  // Life & Death
  onhallowedground: ['On Hallowed Grounds', 'lights flicker, TVs switch themselves on, cold spots: a touch of terror'],
  // Enchanted by Nature
  fairypassage: ['Fairy Passage', 'near an enchanted passage; fairies are drawn to it'],
  // Royalty & Legacy
  clandestine: ['Clandestine', 'what happens here stays here'],
};

const CHALLENGES: Record<string, Entry> = {
  // Base game
  offthegrid: ['Off-the-Grid', 'off the grid, with no mains power or water'],
  burglartime: ['Heist Havoc', 'burglars like this lot, and the alarms have a mind of their own'],
  scareseeker: ['Scare Seeker', 'something in the air draws anyone after a good scare'],
  // City Living
  quakezone: ['Quake Zone', 'the ground trembles now and then'],
  grody: ['Grody', 'sticky surfaces, filmy walls, leaking plumbing'],
  gremlins: ['Gremlins', 'things break overnight, as if tiny goblins came out after dark'],
  filthy: ['Filthy', 'it gets dirty fast, from clogged drains to grimy counters'],
  haunted: ['Spooky', 'wandering ghosts come by at night'],
  // Jungle Adventure
  creepycrawlies: ['Creepy Crawlies', 'spiders, bees and bats drop in uninvited'],
  // Island Living
  volcanicactivity: ['Volcanic Activity', 'near an active volcano: tremors, steam vents, the odd lava bomb'],
  // Eco Lifestyle
  landfilllot: ['Landfill Lot', 'a dump where trash piles up'],
  trashupdate: ['Reduce and Recycle', 'trash has to be sorted, and the cans fill up'],
  // Cottage Living
  simpleliving: ['Simple Living', 'cooking takes real ingredients, bought, grown or foraged'],
  foxes: ['Wild Foxes', 'wild foxes sneak about after the chickens and rabbits'],
  // Horse Ranch
  wildgrass: ['Wild Prairie Grass', 'wild prairie grass springs up and spreads'],
  // For Rent
  mold: ['Mold', 'damp in the air, and mold creeps in where it is left'],
  mueventonresidential: ['Maintenance Troubles', 'something always needs fixing'],
};

// The apartment "Haunted" con is the San Myshuno haunted apartment, a trait; lotTrait_Haunted
// is the Spooky challenge. Told apart before the key is stripped of its category word.
const APARTMENT_HAUNTED = /(^|_)con_haunted$/i;

// Creator and category prefixes: TURBODRIVER:WickedWhims_ZoneModifier_LotTrait_Nudity_CasualNudity,
// zoneModifiers_lotTrait_CelebrityHomeLotTrait, zoneModifier_pro_Quiet, zoneModifier_PetWorld_CatFriendly,
// lotTrait_Generic_PeaceAndQuiet
const TRAIT_PREFIX = /^([a-z0-9]+:)?(wicked_?whims_)?(zone_?modifiers?_)?(lot_?traits?_?)?(nudity_)?/i;
const TRAIT_CATEGORY = /^(generic|challenge|residential|venue|lot|pro|con|pet world|ep\d+|gp\d+|sp\d+) /i;

/** The tuning name read as words, for a trait the table does not know. */
export function lotTraitName(trait: string): string {
  let words = plainName(trait, TRAIT_PREFIX);
  while (TRAIT_CATEGORY.test(words)) {
    words = words.replace(TRAIT_CATEGORY, '');
  }
  return words;
}

export function traitKey(trait: string): string {
  return lotTraitName(trait)
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

/** The panel name, flavor clause and kind of a lot trait or challenge from its tuning name. */
export function lotTraitWords(trait: string): LotTraitWords {
  const key = traitKey(trait);
  if (APARTMENT_HAUNTED.test(trait)) {
    return { name: 'Haunted', flavor: 'something haunts the place', challenge: false };
  }
  const challenge = CHALLENGES[key] as Entry | undefined;
  if (challenge) {
    return { name: challenge[0], flavor: challenge[1], challenge: true };
  }
  const known = TRAITS[key] as Entry | undefined;
  if (known) {
    return { name: known[0], flavor: known[1], challenge: false };
  }
  return { name: lotTraitName(trait), challenge: false };
}

/** Every table entry, for the tests that pin them. */
export function allLotTraitWords(): Array<{ key: string } & LotTraitWords> {
  return [
    ...Object.entries(TRAITS).map(([key, [name, flavor]]) => ({ key, name, flavor, challenge: false })),
    ...Object.entries(CHALLENGES).map(([key, [name, flavor]]) => ({ key, name, flavor, challenge: true })),
  ];
}

/**
 * The facts line for a lot's traits: panel names with their clause, the challenges set apart.
 * A trait the mod reported under lot_challenges is a challenge even when the table does not
 * know it; a mod build without that list still gets the table's own split.
 */
export function lotTraitLine(
  traits: string[],
  reportedChallenges: string[] = [],
  options: { flavor?: boolean } = {},
): string | undefined {
  if (traits.length === 0) {
    return undefined;
  }
  const flagged = new Set(reportedChallenges);
  const seen = new Set<string>();
  const named: string[] = [];
  const hazards: string[] = [];
  for (const trait of traits) {
    const words = lotTraitWords(trait);
    if (seen.has(words.name)) {
      continue;
    }
    seen.add(words.name);
    const text = options.flavor !== false && words.flavor ? `${words.name} (${words.flavor})` : words.name;
    (words.challenge || flagged.has(trait) ? hazards : named).push(text);
  }
  if (named.length === 0) {
    return `Lot challenges: ${hazards.join(', ')}`;
  }
  return `Lot traits: ${named.join(', ')}${hazards.length > 0 ? `; lot challenges: ${hazards.join(', ')}` : ''}`;
}
