import { describe, expect, it } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { LOCATION_DESCRIPTION_SYSTEM_PROMPT } from 'main/sentient-sims/pipeline/prompts/utility';
import { placeDescriptionProblems } from 'main/sentient-sims/util/lotDescription';
import { lotTraitLine, lotTraitWords } from 'main/sentient-sims/util/lotTraitWords';

// Lot trait experiment (2026-10-18): does a lot trait on the facts line reach the written
// description as character, without its name or its game rule, and does a clause after the
// name help or hurt? Writer-level A/B/C on 15 lots in the facts shape lotFacts writes (three
// of them straight from main.log), N samples each, then a blind judge that sees the same trait
// truth for every variant. Gated so `npm run check` never runs it:
//
//   LOT_TRAIT_EXPERIMENT=dry   no model: asserts the facts per (lot, variant)
//   LOT_TRAIT_EXPERIMENT=live  real OpenRouter calls, resumable JSONL + summary.md in LOT_OUT
//
// Filters: LOT_LOTS=calle,salty  LOT_VARIANTS=none,flavor  LOT_SAMPLES=3  LOT_LANES=4
// LOT_MODEL (writer) and LOT_JUDGE (judge). Key: OPENROUTER_KEY or the app's config.json (never printed).

const MODE = process.env.LOT_TRAIT_EXPERIMENT;
const OUT_DIR = process.env.LOT_OUT ?? path.join(os.tmpdir(), 'lot-traits');
const MODEL = process.env.LOT_MODEL ?? 'meta-llama/llama-3.3-70b-instruct';
const JUDGE = process.env.LOT_JUDGE ?? 'anthropic/claude-sonnet-4.5';
const MAX_DESCRIPTION_TOKENS = 220;

type Variant = 'none' | 'names' | 'flavor';
const VARIANTS: Variant[] = ['none', 'names', 'flavor'];

type Lot = {
  key: string;
  name: string;
  venue: string;
  facts: string[];
  traits: string[];
  challenges?: string[];
};

const LOTS: Lot[] = [
  {
    key: 'calle',
    name: 'Calle de la Promesa',
    venue: 'venue_residential',
    facts: [
      'Kind of place: a private home',
      'Neighborhood: Vista Hermosa, Ciudad Enamorada',
      'Floors: three stories',
      'Main floor: a kitchen with bar stools, a coffee maker and a dining table; a living room with sofas, an armchair, a TV, a bookshelf, a stereo and coffee tables; outside: a patio with an easel, grills, a gravestone, garden planters and dining tables',
      'Second floor: three bedrooms, one with a computer and desks, another with dining tables, another with a punching bag and a stereo',
      'Third floor: outside: a patio with a telescope and a dining table',
      'The game describes it as: Home is just a few bricks away on this lot, perfectly situated on the outskirts of Vista Hermosa. With stunning views and friendly neighbors, this charming little spot is ready and waiting for you.',
      'Bedrooms: 3, bathrooms: 2',
    ],
    traits: [
      'zoneModifier_lotTrait_GreatAcoustics',
      'zoneModifier_lotTrait_FreshAir',
      'zoneModifiers_lotTrait_CelebrityHomeLotTrait',
      'zoneModifier_lotTrait_BurglarTime',
    ],
    challenges: ['zoneModifier_lotTrait_BurglarTime'],
  },
  {
    key: 'pectoral',
    name: 'Pectoral Fitness',
    venue: 'venue_gym',
    facts: [
      'Kind of place: a gym',
      'Neighborhood: Starlight Boulevard, Del Sol Valley',
      'Floors: two stories',
      'Main floor: a dining area with sofas, a bookshelf and a desk; three locker rooms, one with a sofa and a coffee table, another with a sofa and a coffee table, another with swimming pools, sofas, coffee tables and dining tables; two bathrooms; six restrooms; outside: sculptures',
      'Second floor: a workout room with punching bags; two locker rooms, one with a bookshelf and desks, another with treadmills, workout machines and a stereo',
      'The speakers play: Pop',
      'The game describes it as: In order to reach the peak of celebrity status you need to look the part. That is where Pectoral Fitness comes in! We have the workouts that will make you sweat. Do you have what it takes to hang with the best of them?',
    ],
    traits: ['zoneModifier_lotTrait_CelebrityHangOut_LowFame'],
  },
  {
    key: 'ward',
    name: 'Ward Park',
    venue: 'venue_ForestPark',
    facts: [
      'Kind of place: a national park',
      'Neighborhood: Mirage Park, Del Sol Valley',
      'Furnished with: benches, a picnic table, a grill',
      'The game describes it as: Need an escape from the hustle and bustle of the celebrity lifestyle? Ward Park is the perfect place to clear your mind, relax, and listen to the sounds of water.',
    ],
    traits: ['lotTrait_Generic_PeaceAndQuiet', 'zoneModifier_PetWorld_DogHangout'],
  },
  {
    key: 'salty',
    name: 'Salty Paws Saloon',
    venue: 'venue_bar',
    facts: [
      'Kind of place: a bar',
      "Neighborhood: Whiskerman's Wharf, Brindleton Bay",
      'Floors: two stories',
      'Main floor: a bar with bar stools, a jukebox and dining tables; a restroom; outside: a deck with dining tables and grills',
      'Second floor: two restrooms',
    ],
    traits: ['zoneModifier_PetWorld_DogFriendly', 'zoneModifier_lotTrait_Convivial'],
  },
  {
    key: 'llama',
    name: 'The Shrieking Llama',
    venue: 'venue_bar',
    facts: [
      'Kind of place: a bar',
      'Neighborhood: Windslar, Windenburg',
      'Floors: two stories',
      'Main floor: a bar with bar stools, a dartboard, a foosball table and dining tables; a restroom',
      'Second floor: a lounge with sofas, armchairs and a fireplace; outside: a balcony with dining tables',
    ],
    traits: ['zoneModifier_lotTrait_GreatAcoustics', 'zoneModifier_lotTrait_Singles_Hangout'],
  },
  {
    key: 'honeypop',
    name: 'Planet Honey Pop!',
    venue: 'venue_karaoke',
    facts: [
      'Kind of place: a karaoke bar',
      'Neighborhood: Fashion District, San Myshuno',
      'Floors: two stories',
      'Main floor: a bar with bar stools, karaoke machines, sofas and dining tables; two restrooms',
      'Second floor: karaoke rooms with sofas and karaoke machines; a bar with bar stools',
      'The speakers play: Pop',
    ],
    traits: ['zoneModifier_lotTrait_CelebrityHangOut_HighFame', 'zoneModifier_lotTrait_GreatAcoustics'],
  },
  {
    key: 'chic',
    name: '1310 21 Chic Street',
    venue: 'venue_residential',
    facts: [
      'Kind of place: a private home',
      'Neighborhood: Fashion District, San Myshuno',
      'Rooms: a kitchen with a dining table; a living room with a sofa, a TV, a bookshelf and a coffee table; a bedroom with a desk and a computer; a bathroom',
      'Bedrooms: 1, bathrooms: 1',
    ],
    traits: ['zoneModifier_pro_GreatView', 'zoneModifier_con_LivelyNeighbors', 'zoneModifier_lotTrait_QuakeZone'],
    challenges: ['zoneModifier_lotTrait_QuakeZone'],
  },
  {
    key: 'umbrage',
    name: 'Umbrage Manor',
    venue: 'venue_residential',
    facts: [
      'Kind of place: a private home',
      'Neighborhood: Foundry Cove, Willow Creek',
      'Floors: two stories',
      'Main floor: a kitchen with a dining table; a living room with sofas, a fireplace, a piano and bookshelves; a study with a desk and a computer; a bathroom; outside: a garden with garden planters and a bench',
      'Second floor: three bedrooms, one with a desk, another with a crib; a bathroom',
      'Bedrooms: 3, bathrooms: 2',
    ],
    traits: ['zoneModifier_lotTrait_Homey', 'zoneModifier_lotTrait_GreatSoil', 'zoneModifier_lotTrait_Gremlins'],
    challenges: ['zoneModifier_lotTrait_Gremlins'],
  },
  {
    key: 'vonhaunt',
    name: 'Von Haunt Estate',
    venue: 'venue_museum',
    facts: [
      'Kind of place: a museum',
      'Neighborhood: Olde Platz, Windenburg',
      'Floors: two stories',
      'Main floor: a gallery with paintings and sculptures; a library with bookshelves and armchairs; a ballroom with a piano; two restrooms; outside: a garden with hedges, fountains, benches and gravestones',
      'Second floor: galleries with paintings; a bedroom with a canopy bed',
    ],
    traits: ['zoneModifier_lotTrait_Haunted', 'zoneModifier_lotTrait_NaturalLight'],
    challenges: ['zoneModifier_lotTrait_Haunted'],
  },
  {
    key: 'gnomesarms',
    name: "The Gnome's Arms",
    venue: 'venue_bar',
    facts: [
      'Kind of place: a bar',
      'Neighborhood: Finchwick, Henford-on-Bagley',
      'Rooms: a bar with bar stools, a dartboard, a fireplace and dining tables; a restroom; outside: a beer garden with dining tables and a grill',
    ],
    traits: ['zoneModifier_LotTraits_Foxes', 'zoneModifier_lotTrait_SimpleLiving', 'zoneModifier_lotTrait_Convivial'],
    challenges: ['zoneModifier_LotTraits_Foxes', 'zoneModifier_lotTrait_SimpleLiving'],
  },
  {
    key: 'lagoon',
    name: 'Lagoon Look',
    venue: 'venue_residential',
    facts: [
      'Kind of place: a private home',
      "Neighborhood: Mua Pel'am, Sulani",
      'Rooms: a living room with a sofa and a TV; a kitchen with a dining table; a bedroom; a bathroom; outside: a deck with a grill, deck chairs and a hammock',
      'Bedrooms: 1, bathrooms: 1',
    ],
    traits: [
      'zoneModifier_lotTrait_OceanicParadise',
      'zoneModifier_lotTrait_IslandSpirits',
      'zoneModifier_lotTrait_OffTheGrid',
    ],
    challenges: ['zoneModifier_lotTrait_OffTheGrid'],
  },
  {
    key: 'canal',
    name: 'Canal Corner',
    venue: 'venue_residential',
    facts: [
      'Kind of place: a private home',
      'Neighborhood: Conifer Station, Evergreen Harbor',
      'Floors: two stories',
      'Main floor: a kitchen with a dining table; a living room with a sofa, a TV and a bookshelf; a bathroom; outside: a garden with garden planters, a compost bin and a wind turbine',
      'Second floor: two bedrooms, one with a desk; a bathroom',
      'Bedrooms: 2, bathrooms: 2',
    ],
    traits: ['zoneModifier_lotTrait_EcoLot', 'zoneModifier_lotTrait_Geothermal', 'zoneModifier_lotTrait_LandfillLot'],
    challenges: ['zoneModifier_lotTrait_LandfillLot'],
  },
  {
    key: 'archive',
    name: 'Willow Creek Archive',
    venue: 'venue_library',
    facts: [
      'Kind of place: a library',
      'Neighborhood: Courtyard Lane, Willow Creek',
      'Floors: two stories',
      'Main floor: a library with bookshelves, armchairs, desks and computers; two restrooms',
      'Second floor: a reading room with bookshelves, sofas and a chess table; a study with desks and computers',
    ],
    traits: ['zoneModifier_lotTrait_StudySpot', 'lotTrait_Generic_PeaceAndQuiet'],
  },
  {
    key: 'movers',
    name: 'Movers & Shakers Gym',
    venue: 'venue_gym',
    facts: [
      'Kind of place: a gym',
      'Neighborhood: Parched Prospect, Oasis Springs',
      'Rooms: a workout room with treadmills, workout machines, punching bags and a stereo; a locker room with showers and lockers; two restrooms; outside: a pool with loungers and a basketball hoop',
      'The speakers play: Electronica',
    ],
    traits: ['zoneModifier_lotTrait_FreshAir', 'zoneModifier_lotTrait_UniversityStudentHangout'],
  },
  {
    key: 'magnolia',
    name: 'Magnolia Blossom Park',
    venue: 'venue_park',
    facts: [
      'Kind of place: a park',
      'Neighborhood: Sage Estates, Willow Creek',
      'Furnished with: benches, picnic tables, grills, a fishing spot, a playground slide, a chess table, a fountain, garden planters',
    ],
    traits: ['zoneModifier_lotTrait_ChildsPlay', 'zoneModifier_PetWorld_CatHangout', 'zoneModifier_lotTrait_GreatSoil'],
  },
];

export function factsFor(lot: Lot, variant: Variant): string {
  const lines = [`Name: ${lot.name}`, ...lot.facts];
  if (variant !== 'none') {
    const line = lotTraitLine(lot.traits, lot.challenges, { flavor: variant === 'flavor' });
    if (line) {
      lines.push(line);
    }
  }
  return lines.join('\n');
}

function truthFor(lot: Lot): string {
  return lot.traits
    .map((trait) => {
      const words = lotTraitWords(trait);
      return `- ${words.name}${words.challenge ? ' (lot challenge)' : ''}: ${words.flavor ?? 'no description'}`;
    })
    .join('\n');
}

const JUDGE_PROMPT = `You judge one short reference card for a place in The Sims 4 against the lot traits the place has. The card may or may not have been told about the traits. Answer with JSON only, no prose, in this exact shape:
{"traits":[{"name":"<trait name>","felt":0|1|2}],"named":true|false,"rule":true|false,"invented":true|false}
felt: 0 = nothing of this trait's character comes through in the card; 1 = a hint of it in the card's own words; 2 = the trait's character is clearly part of how the place is described.
named: the card uses a trait's panel name, or repeats its description clause nearly word for word.
rule: the card explains a game mechanic or effect (skill gains, moods, bills, visitors appearing, things breaking at a set hour).
invented: the card adds a sound, a smell, music, a person or an event that is in neither the facts nor the traits.`;

function loadOpenRouterKey(): string | undefined {
  if (process.env.OPENROUTER_KEY) return process.env.OPENROUTER_KEY;
  for (const folder of ['Electron', 'sentient-sims-app']) {
    try {
      const config = JSON.parse(
        fs.readFileSync(path.join(process.env.APPDATA ?? '', folder, 'config.json'), 'utf8'),
      ) as { openrouterKey?: string };
      if (config.openrouterKey) return config.openrouterKey;
    } catch {
      // no settings in this folder
    }
  }
  return undefined;
}

async function chat(key: string, model: string, system: string, user: string, maxTokens: number): Promise<string> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, 90_000);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
        signal: controller.signal,
      });
      const body = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      };
      if (!response.ok || body.error) {
        throw new Error(`${response.status} ${body.error?.message ?? ''}`);
      }
      return body.choices?.[0]?.message?.content ?? '';
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2_000 * attempt));
    } finally {
      clearTimeout(timer);
    }
  }
  return '';
}

type Verdict = { traits: { name: string; felt: number }[]; named: boolean; rule: boolean; invented: boolean };

function parseVerdict(text: string): Verdict | undefined {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return undefined;
  try {
    const parsed = JSON.parse(match[0]) as { traits?: { name?: unknown; felt?: unknown }[] } & Partial<Verdict>;
    return {
      traits: Array.isArray(parsed.traits)
        ? parsed.traits.map((trait) => ({
            name: typeof trait.name === 'string' ? trait.name : '',
            felt: Number(trait.felt) || 0,
          }))
        : [],
      named: parsed.named === true,
      rule: parsed.rule === true,
      invented: parsed.invented === true,
    };
  } catch {
    return undefined;
  }
}

type Run = {
  key: string;
  lot: string;
  variant: Variant;
  sample: number;
  description: string;
  problems: string[];
  verdict?: Verdict;
  judgeRaw?: string;
};

function envList<T extends string>(name: string, all: T[]): T[] {
  const raw = process.env[name];
  if (!raw) return all;
  const wanted = raw.split(',').map((item) => item.trim());
  return all.filter((item) => wanted.includes(item));
}

function summarize(runs: Run[]): string {
  const lines: string[] = [];
  lines.push('| variant | n | gate pass | felt avg | felt any | named | rule | invented | words |');
  lines.push('|---|---|---|---|---|---|---|---|---|');
  for (const variant of VARIANTS) {
    const mine = runs.filter((run) => run.variant === variant);
    if (mine.length === 0) continue;
    const judged = mine.filter((run) => run.verdict);
    const pct = (count: number, total: number) => (total ? `${Math.round((100 * count) / total)}%` : '-');
    const feltValues = judged.flatMap((run) => (run.verdict?.traits ?? []).map((trait) => trait.felt));
    const feltAvg = feltValues.length ? (feltValues.reduce((a, b) => a + b, 0) / feltValues.length).toFixed(2) : '-';
    const feltAny = judged.filter((run) => (run.verdict?.traits ?? []).some((trait) => trait.felt >= 1)).length;
    const words = mine.length
      ? Math.round(mine.reduce((sum, run) => sum + run.description.split(/\s+/).length, 0) / mine.length)
      : 0;
    lines.push(
      `| ${variant} | ${mine.length} | ${pct(mine.filter((run) => run.problems.length === 0).length, mine.length)} | ${feltAvg} | ${pct(feltAny, judged.length)} | ${pct(judged.filter((run) => run.verdict?.named).length, judged.length)} | ${pct(judged.filter((run) => run.verdict?.rule).length, judged.length)} | ${pct(judged.filter((run) => run.verdict?.invented).length, judged.length)} | ${words} |`,
    );
  }
  return lines.join('\n');
}

const describeExperiment = MODE ? describe : describe.skip;

describeExperiment('Lot trait experiment', () => {
  const lots = envList(
    'LOT_LOTS',
    LOTS.map((lot) => lot.key),
  ).map((key) => LOTS.find((lot) => lot.key === key) as Lot);
  const variants = envList('LOT_VARIANTS', VARIANTS);
  const samples = Number(process.env.LOT_SAMPLES ?? 3);
  const lanes = Number(process.env.LOT_LANES ?? 4);

  it('builds the facts per variant: no trait line, panel names, names with a clause', () => {
    expect(LOTS.length).toBeGreaterThanOrEqual(15);
    for (const lot of LOTS) {
      const none = factsFor(lot, 'none');
      const names = factsFor(lot, 'names');
      const flavor = factsFor(lot, 'flavor');
      expect(none).not.toContain('Lot traits');
      expect(none).not.toContain('Lot challenges');
      expect(names).toMatch(/\nLot (traits|challenges): /);
      expect(names).not.toContain('(');
      expect(flavor.length).toBeGreaterThan(names.length);
      for (const trait of lot.traits) {
        const words = lotTraitWords(trait);
        expect(words.flavor, `${lot.key} ${trait} is not in the table`).toBeTruthy();
        expect(names).toContain(words.name);
        expect(flavor).toContain(`${words.name} (${words.flavor})`);
      }
      expect(names).not.toMatch(/zone ?Modifier|lotTrait|_/);
    }
  });

  if (MODE === 'live') {
    it(
      'writes each lot with and without its traits and has them judged blind',
      async () => {
        const key = loadOpenRouterKey();
        expect(key, 'No OpenRouter key: set OPENROUTER_KEY or the app OpenRouter setting').toBeTruthy();
        fs.mkdirSync(OUT_DIR, { recursive: true });
        const runsPath = path.join(OUT_DIR, 'runs.jsonl');
        const done = new Map<string, Run>();
        if (fs.existsSync(runsPath)) {
          for (const line of fs.readFileSync(runsPath, 'utf8').split('\n').filter(Boolean)) {
            const run = JSON.parse(line) as Run;
            done.set(run.key, run);
          }
        }
        const jobs: { lot: Lot; variant: Variant; sample: number }[] = [];
        for (const lot of lots) {
          for (const variant of variants) {
            for (let sample = 1; sample <= samples; sample += 1) {
              if (!done.has(`${lot.key}/${variant}/${sample}`)) jobs.push({ lot, variant, sample });
            }
          }
        }
        process.stdout.write(`[traits] ${done.size} done, ${jobs.length} to run on ${MODEL}, judge ${JUDGE}\n`);
        let next = 0;
        const worker = async () => {
          while (next < jobs.length) {
            const job = jobs[next];
            next += 1;
            const runKey = `${job.lot.key}/${job.variant}/${job.sample}`;
            const facts = factsFor(job.lot, job.variant);
            const description = (
              await chat(
                key as string,
                MODEL,
                LOCATION_DESCRIPTION_SYSTEM_PROMPT,
                `Facts about ${job.lot.name}:\n${facts}`,
                MAX_DESCRIPTION_TOKENS,
              )
            ).trim();
            const problems = placeDescriptionProblems(description, job.lot.venue);
            const judgeRaw = await chat(
              key as string,
              JUDGE,
              JUDGE_PROMPT,
              `Lot traits of ${job.lot.name}:\n${truthFor(job.lot)}\n\nThe card:\n${description}`,
              400,
            );
            const run: Run = {
              key: runKey,
              lot: job.lot.key,
              variant: job.variant,
              sample: job.sample,
              description,
              problems,
              verdict: parseVerdict(judgeRaw),
              judgeRaw: judgeRaw.slice(0, 600),
            };
            done.set(runKey, run);
            fs.appendFileSync(runsPath, `${JSON.stringify(run)}\n`);
            process.stdout.write(`[traits] ${runKey} gate=${problems.length === 0 ? 'ok' : problems.join('/')}\n`);
          }
        };
        await Promise.all(Array.from({ length: Math.min(lanes, jobs.length) }, worker));
        const runs = Array.from(done.values()).filter(
          (run) => lots.some((lot) => lot.key === run.lot) && variants.includes(run.variant),
        );
        const summary = summarize(runs);
        fs.writeFileSync(
          path.join(OUT_DIR, 'summary.md'),
          `# Lot trait experiment\n\nwriter ${MODEL}, judge ${JUDGE}, ${runs.length} runs\n\n${summary}\n`,
        );
        process.stdout.write(`\n${summary}\n\nruns: ${runsPath}\n`);
        expect(runs.length).toBeGreaterThan(0);
      },
      3 * 60 * 60 * 1000,
    );
  }
});
