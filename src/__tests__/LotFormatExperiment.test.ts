import { describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { NoopEmbeddingService } from 'main/sentient-sims/services/EmbeddingService';
import { InteractionEventStatus, LLMExchange } from 'main/sentient-sims/models/InteractionEventResult';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { InteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { LocationEntity } from 'main/sentient-sims/db/entities/LocationEntity';
import { defaultLotDescription } from 'main/sentient-sims/descriptions/locationDescriptions';
import { DirectedGenerationOptions, parseSceneScores } from 'main/sentient-sims/services/AIService';
import { llamaTokenizer } from 'main/sentient-sims/tokens/llama/LLamaTokenizer';
import { mockApiContext } from './util';

// Lot description format experiment (2026-10-15). Six ways of writing the one LOCATION line
// a scene prompt carries, five lots, four events, N samples each, through the real directed
// pipeline on the players' default weights. Gated so `npm run check` never runs it:
//
//   LOT_FORMAT_EXPERIMENT=dry   mocked model: asserts the exact <LOCATION> line per (lot, format)
//   LOT_FORMAT_EXPERIMENT=live  real OpenRouter calls, resumable JSONL in LOT_OUT
//
// Filters: LOT_LOTS=salty,gym  LOT_VARIANTS=stock,card  LOT_EVENTS=chat,ask_place  LOT_SAMPLES=1
// LOT_LANES=4 parallel scenes. Key: OPENROUTER_KEY or the app's config.json (never printed).

const MODE = process.env.LOT_FORMAT_EXPERIMENT;
const OUT_DIR = process.env.LOT_OUT ?? path.join(os.tmpdir(), 'lot-format');
const MODEL = process.env.LOT_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:nitro';

type FormatName = 'stock' | 'minimal' | 'card' | 'long' | 'flowery' | 'kv';
const FORMATS: FormatName[] = ['stock', 'minimal', 'card', 'long', 'flowery', 'kv'];

type Lot = {
  key: string;
  id: number;
  name: string;
  lot_type: string;
  variants: Record<Exclude<FormatName, 'stock'>, string>;
};

const LOTS: Lot[] = [
  {
    key: 'salty',
    id: 390791172,
    name: 'Salty Paws Saloon',
    lot_type: 'Bar',
    variants: {
      minimal: "A small wooden bar on the pier at Whiskerman's Wharf in Brindleton Bay, with a deck over the water.",
      card: "Salty Paws Saloon is a small wooden bar on the pier at Whiskerman's Wharf, Brindleton Bay, strung with lights. Inside are worn wooden tables and a plain bar, and outside a deck with tables and barbecue grills over the water. The public restrooms are upstairs.",
      long: "Salty Paws Saloon is a small wooden bar on the pier at Whiskerman's Wharf in Brindleton Bay. Strings of lights run along the eaves and the railings of the deck. The inside is one room of worn wooden tables and a plain bar counter with bottles on the shelf behind it. A door at the back opens onto a wooden deck built out over the water, with more tables and two barbecue grills. The deck looks across the harbour to the fishing boats and the lighthouse. A staircase inside leads up to the public restrooms on the upper floor. Gulls sit on the pier posts outside, and the boards creak over the water. The Catscratch Cottage stands a few steps along the pier.",
      flowery:
        "Salty Paws Saloon, cradled by the ripples of the harbour and the whispers of the sea breeze, was a quaint establishment whose wooden deck and twinkling lights adorned the pier of Whiskerman's Wharf. It was a place where the air seemed to hum with stories, where fishermen, travellers and locals gathered to share tales over the clink of glasses. Inside, the intimate room was warm and inviting, its well-worn wooden tables and unpretentious bar promising libations to warm both body and soul, and the bartender greeted every guest with a nod and a story of their own. Outside, guests sat at tables beneath the stars while the scent of the ocean and the sizzle of the barbecues added flavour to the night air. The upper floor housed the public bathrooms, and as one ascended the stairs they could feel the echoes of the sea and the camaraderie that filled the space. Here, laughter resounded and glasses were raised in friendship. It was a sanctuary where the simple act of sharing a drink could forge bonds that transcended the tides.",
      kv: "Kind: small wooden bar.\nSetting: on the pier at Whiskerman's Wharf, Brindleton Bay, strung with lights.\nInside: worn wooden tables, a plain bar counter, stairs up to the public restrooms.\nOutside: a deck over the water with tables and barbecue grills.\nMood: scruffy, salty, unhurried.",
    },
  },
  {
    key: 'pupper',
    id: 3081175056,
    name: 'Pupperstone Park',
    lot_type: 'Park',
    variants: {
      minimal: 'A public park in Sable Square, Brindleton Bay, with a fenced dog agility course and a playground.',
      card: 'Pupperstone Park is a park in Sable Square, Brindleton Bay, with gravel paths winding under big trees. It has a fenced dog agility course of hoops and tunnels, a nautical-themed playground, picnic tables with grills, shaded chess tables and a restroom.',
      long: 'Pupperstone Park is a public park in Sable Square, Brindleton Bay. Gravel paths wind through it under big old trees. A fenced dog agility course of hoops, tunnels and ramps takes up one side of the lawn. Beside it is a playground built to look like a sailing ship, with a slide and a climbing frame. Picnic tables and barbecue grills stand near the paths. Two chess tables sit in the shade of the trees. Flower beds edge the lawn, and a small restroom building stands near the gate. From the far side of the park there is a view down to the bay.',
      flowery:
        "Pupperstone Park, nestled in the picturesque neighbourhood of Sable Square in Brindleton Bay, exuded a quaint charm. Lush green trees with expansive branches, a verdant lawn dotted with colourful flowerbeds and a cosy fenced area made this park a sanctuary for leisure and recreation. The canopy of trees sheltered the benches, while neat gravel paths wound through the park and invited visitors to a leisurely stroll. A noteworthy feature was the agility course designed for dogs, where four-legged friends could be seen leaping through hoops and tunnels while their owners cheered them on. Adjacent to this, a playground shaped like a sailing ship beckoned children, its sails a nod to Brindleton Bay's maritime heritage, and families relished alfresco meals at the picnic tables and grills. The chess tables under the trees offered a quieter corner where old friends traded moves and gossip. A discreetly placed toilet stall ensured the comfort of every visitor. It was a place that catered to the playful spirits of children and pets alike, and to the tranquillity sought by everyone else.",
      kv: 'Kind: public park.\nSetting: Sable Square, Brindleton Bay, gravel paths under big trees.\nInside: a small restroom building, nothing else under a roof.\nOutside: a fenced dog agility course of hoops and tunnels, a ship-shaped playground, picnic tables with grills, chess tables in the shade, flower beds.\nMood: open, breezy, dogs and kids.',
    },
  },
  {
    key: 'chateau',
    id: 3421044741,
    name: 'Chateau Frise',
    lot_type: 'Residence',
    variants: {
      minimal:
        'A large Dutch Colonial house with a pool in Cavalier Cove, Brindleton Bay, looking across the bay to the lighthouse.',
      card: 'Chateau Frise is a large Dutch Colonial house in Cavalier Cove, Brindleton Bay, with dormer windows, wraparound porches and a backyard swimming pool, with a view of the Brindleton lighthouse across the bay. The ground floor has a big living room opening onto the kitchen and an office with a medicine crafting table. Three bedrooms with balconies fill the second floor, and the third floor is one large open room.',
      long: 'Chateau Frise is a large Dutch Colonial house in Cavalier Cove, Brindleton Bay. It has a gambrel roof with dormer windows and porches that wrap around the front and sides. The backyard has a swimming pool with loungers, mature trees and a lawn running down towards the water. From the porches and the back windows there is a view across the bay to the Brindleton lighthouse. The ground floor is a big living room that opens onto the kitchen, with a dining table between them, and an office with a desk and a medicine crafting table. The second floor has three bedrooms, each with its own balcony, and two bathrooms. The third floor is one large open room under the roof with windows at both ends. A driveway runs up from the road to the front porch.',
      flowery:
        'Chateau Frise, perched gracefully in the idyllic surroundings of Cavalier Cove, presented a striking combination of Dutch Colonial architecture and modern luxury. The estate exuded an aura of tasteful elegance, where meticulous design met the warmth of a family home. Sloping roofs and classic dormer windows gave way to inviting porches that wrapped around the facade, where the family gathered on warm evenings and guests were welcomed with a glass of something cold. The backyard revealed an alluring swimming pool mirroring the sky, and the view of the Brindleton Light across the bay added an ethereal quality to every sunset. Inside, a spacious living room flowed seamlessly into an open-plan kitchen, where the aroma of home-cooked meals permeated the air, and a dedicated office with its medicine crafting table hinted at a curious, holistic mind. The second floor harboured a sanctuary of rest, three bedrooms each with a balcony, and the third floor was a single expansive room awaiting the dreams of whoever claimed it. Chateau Frise was not merely a house; it was a symphony of architecture, nature and refinement.',
      kv: 'Kind: large family house, Dutch Colonial.\nSetting: Cavalier Cove, Brindleton Bay, on the water with a view across the bay to the lighthouse.\nInside: a big living room opening onto the kitchen, an office with a medicine crafting table, three bedrooms with balconies upstairs, one large open room on the third floor.\nOutside: wraparound porches, dormer windows, a backyard swimming pool under mature trees.\nMood: grand, settled, well kept.',
    },
  },
  {
    key: 'orchid',
    id: 2311979033,
    name: 'Orchid A Go Go',
    lot_type: 'Lounge',
    variants: {
      minimal: 'A two-storey lounge in Del Sol Valley with a bar, a small stage and a velvet rope at the door.',
      card: 'Orchid A Go Go is a two-storey lounge in Del Sol Valley with exposed brick walls, dark wood floors and red accents. Downstairs a long bar and low seating surround a small stage with a microphone, a guitar and overhead lights, and a jukebox stands by the wall. Upstairs, balcony seating looks down over the main room. A velvet rope marks the entrance and hedges frame the outdoor patio.',
      long: 'Orchid A Go Go is a two-storey lounge in Del Sol Valley. A velvet rope on stands marks the entrance from the street. The main room has exposed brick walls, dark wood floors and red accents in the upholstery and lampshades. A long bar runs along one wall, with bottles lit from behind. Low tables and armchairs face a small stage with a microphone, a guitar on a stand and overhead spotlights. A jukebox stands near the stairs. Upstairs, a balcony with tables and couches looks down over the main room, with quieter corners at the back. Out the side door is a patio with tables, framed by clipped hedges.',
      flowery:
        "Orchid A Go Go was the kind of lounge where Del Sol Valley came to be seen, its exposed brick and dark wood floors glowing under rich red light. Downstairs, a long bar gleamed beside intimate seating areas, and the bartender shook cocktails for a crowd of hopefuls and regulars who drifted in past the velvet rope. A small stage with its microphone, guitar and overhead lighting waited for the night's performer, while a jukebox filled the pauses with something retro. Hedges framed the outdoor patio, where guests leaned close over their drinks and traded industry gossip. Upstairs, balcony seating overlooked the main room, its quieter corners perfect for conversations that might turn into someone's big break. The mood was casual glamour, equal parts ambition and nostalgia. It was a place of drinks, live entertainment and chances taken.",
      kv: 'Kind: two-storey lounge with live music.\nSetting: Del Sol Valley, a velvet rope at the door.\nInside: exposed brick, dark wood floors, red accents, a long bar, low seating around a small stage with a microphone and a guitar, a jukebox, balcony seating upstairs over the main room.\nOutside: a patio framed by hedges.\nMood: casual glamour, retro, a little exclusive.',
    },
  },
  {
    key: 'gym',
    id: 1993998339,
    name: 'Harbor Quarter Gym',
    lot_type: 'Gym',
    variants: {
      minimal: 'A multi-level public gym in Windenburg with a pool downstairs and a bar upstairs.',
      card: 'Harbor Quarter Gym is a multi-level public gym in Windenburg with a white-tiled lobby and a long blue reception desk. Downstairs are a red and a green locker room with showers and an open-roofed pool with a small outdoor seating area. The upper floors hold treadmills and weight machines, a mat-floored room with punching bags overlooking the town, and a red and white kitchen and bar with small tables.',
      long: "Harbor Quarter Gym is a multi-level public gym in Windenburg. The entrance lobby has white square floor tiles, grey stone walls and a long blue reception desk with a black counter. Downstairs are two locker rooms, one red and one green, each with showers and a bathroom. Across from them is a swimming pool with no roof over it, open to the sky, and doors out to a small seating area outside. The floor above the lobby is lined with treadmills and weight machines for every muscle group. One level higher is a room with rubber puzzle-mat flooring, more treadmills and two punching bags, with windows overlooking the town. Next to it is a room with parquet floors, small square white tables with red chairs, and a red and white kitchen and bar. The building stands on the harbour side of Windenburg's old town.",
      flowery:
        'The Harbor Quarter Gym, a bustling hub of fitness and community, stood proudly in the heart of Windenburg. Upon entering, the lobby greeted visitors with a polished blend of modernity and natural elements, where large white tiles contrasted with sleek grey stone and a long blue reception desk gleamed under soft light, its receptionist waving members through. Downstairs, two locker rooms in striking red and vibrant green offered weary gym-goers a refreshing respite, and across from them a glistening pool beckoned beneath the open sky. Ascending the stairs, the upper level revealed an array of state-of-the-art machines where regulars sculpted abs, glutes and lats to the rhythm of the treadmills. One level higher, a serene room overlooking the town boasted punching bags on rubbery puzzle mats, where a trainer barked encouragement at the evening class. In the adjoining room the atmosphere shifted to relaxation, parquet floors and small white tables with red chairs, where the bar staff poured protein shakes and members lingered to unwind. It was a place where the whole town came to sweat, to gossip and to feel alive.',
      kv: 'Kind: multi-level public gym.\nSetting: harbour side of Windenburg.\nInside: a white-tiled lobby with a long blue reception desk, red and green locker rooms with showers downstairs, treadmills and weight machines on the upper floors, a mat-floored room with punching bags overlooking the town, a red and white kitchen and bar with small tables.\nOutside: an open-roofed pool with a small seating area.\nMood: busy, bright, echoing.',
    },
  },
];

export function variantText(lot: Lot, format: FormatName): string {
  return format === 'stock' ? defaultLotDescription : lot.variants[format];
}

function locationFor(lot: Lot, format: FormatName): LocationEntity {
  return { id: lot.id, name: lot.name, lot_type: lot.lot_type, description: variantText(lot, format) };
}

export function expectedLocationBlock(lot: Lot, format: FormatName): string {
  return `<LOCATION>\n${lot.name} (${lot.lot_type}), ${variantText(lot, format)}\n</LOCATION>`;
}

// The two Scratch-test adults; no facts seeded, so only the LOCATION line varies
function sim(
  name: string,
  simId: string,
  traits: string[],
  mood: string,
  atHome: boolean,
  player: boolean,
): SentientSim {
  return {
    careers: [],
    name,
    age: SimAge.ADULT,
    sim_id: simId,
    gender: 'Male',
    traits,
    moods: [mood],
    is_ghost: false,
    grubby: false,
    in_pool: false,
    is_at_home: atHome,
    is_dying: false,
    is_human: true,
    is_inside_building: false,
    is_outside: false,
    is_pet: false,
    on_fire: false,
    on_home_lot: atHome,
    sleeping: false,
    is_pregnant: false,
    is_player_sim: player,
  };
}

const RICKY = 'Ricky Rickerson';
const RICHY = 'Richy Richardson';

function cast(lot: Lot): SentientSim[] {
  const atHome = lot.lot_type === 'Residence';
  return [
    sim(
      RICKY,
      '772948625141858300',
      ['trait_Evil', 'trait_Glutton', 'trait_CommitmentIssues'],
      'Mood_Confident',
      atHome,
      true,
    ),
    sim(
      RICHY,
      '772949305175180300',
      ['trait_Ambitious', 'trait_Romantic', 'trait_Outgoing'],
      'Mood_Happy',
      false,
      false,
    ),
  ];
}

type EventKind = 'chat' | 'gripe' | 'ask_day' | 'ask_place';
const EVENTS: EventKind[] = ['chat', 'gripe', 'ask_day', 'ask_place'];

type SceneSpec = { event: InteractionEvent; options: DirectedGenerationOptions };

function sceneFor(lot: Lot, kind: EventKind, playerSpeaker: string): SceneSpec {
  const [ricky, richy] = cast(lot);
  const base = {
    event_id: randomUUID(),
    event_type: SSEventType.INTERACTION,
    location_id: lot.id,
    relationships: { relationship_bits: [] },
    environment: { location_id: lot.id, world_id: 0, time: { second: 0, minute: 0, hour: 19, day: 2, week: 1 } },
  };
  switch (kind) {
    case 'chat':
      return {
        event: { ...base, sentient_sims: [ricky, richy], interaction_name: 'lot_format_chat' },
        options: { action: `${RICKY} and ${RICHY} are catching up on the week.`, saveMemory: true },
      };
    case 'gripe':
      return {
        event: { ...base, sentient_sims: [ricky, richy], interaction_name: 'lot_format_gripe' },
        options: {
          action: `${RICKY} complains to ${RICHY} about a coworker who keeps taking credit for his work.`,
          saveMemory: true,
        },
      };
    case 'ask_day':
      return {
        event: { ...base, sentient_sims: [ricky], interaction_name: 'lot_format_ask' },
        options: {
          playerLine: { speaker: playerSpeaker, text: 'How has your day been so far?' },
          saveMemory: true,
          suggestActionsOnly: true,
        },
      };
    case 'ask_place':
    default:
      return {
        event: { ...base, sentient_sims: [ricky], interaction_name: 'lot_format_ask' },
        options: {
          playerLine: { speaker: playerSpeaker, text: 'What do you think of this place?' },
          saveMemory: true,
          suggestActionsOnly: true,
        },
      };
  }
}

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

type StageTiming = { label: string; ms: number };

function freshContext(sessionId: string, lot: Lot, format: FormatName, live: boolean, key?: string) {
  const ctx: ApiContext = mockApiContext({ tiers: [] });
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
  ctx.db.loadDatabase({ sessionId, saveId: '1' });
  ctx.settings.set(SettingsEnum.GENERATED_DEFAULT_DESCRIPTIONS, false);
  ctx.settings.set(SettingsEnum.SCENE_MAX_ROUNDS, 1);
  if (live) {
    ctx.settings.aiProviderConfigs = [{ id: 'lot-exp', name: 'lot-exp', apiType: ApiType.OpenRouter, model: MODEL }];
    ctx.settings.defaultAiProviderConfigId = 'lot-exp';
    if (key) ctx.settings.openrouterKey = key;
  }
  vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());
  vi.spyOn(ctx.modelSettings, 'getModelSettings').mockResolvedValue({
    temperature: undefined,
    top_p: undefined,
    top_k: undefined,
    repetition_penalty: undefined,
    max_tokens: 32000,
  });
  vi.spyOn(ctx.ai, 'playTtsLines').mockReturnValue(undefined);
  // The stock variant cannot be stored through updateLocation, so the spy is the one
  // mechanism for all six formats
  vi.spyOn(ctx.locationRepository, 'getLocation').mockReturnValue(locationFor(lot, format));
  return ctx;
}

// Wraps runOneShot to time every stage; the original still runs (live) or a stub answers (dry)
function timeStages(ctx: ApiContext, stub?: (label: string, systemPrompt: string) => string) {
  const timings: StageTiming[] = [];
  const systemPrompts: Record<string, string> = {};
  const original = ctx.ai.runOneShot.bind(ctx.ai);
  vi.spyOn(ctx.ai, 'runOneShot').mockImplementation(async (label, systemPrompt, ...rest) => {
    systemPrompts[label] = systemPrompt;
    const startedAt = Date.now();
    if (stub) {
      const text = stub(label, systemPrompt);
      timings.push({ label, ms: 0 });
      return { exchange: { label, request: { messages: [], maxResponseTokens: 0 }, responseText: text }, text };
    }
    try {
      return await original(label, systemPrompt, ...rest);
    } finally {
      timings.push({ label, ms: Date.now() - startedAt });
    }
  });
  return { timings, systemPrompts };
}

function locationBlockSent(exchanges: LLMExchange[] | undefined): string | undefined {
  const briefing = exchanges?.find((exchange) => exchange.label === 'Director Briefing');
  const content = briefing?.request.messages.map((message) => message.content).join('\n') ?? '';
  return /<LOCATION>\n[\s\S]*?\n<\/LOCATION>/.exec(content)?.[0];
}

function sharedBriefing(briefingText: string): string {
  return /===\s*SCENE\s*===\s*([\s\S]*?)(?=\n\s*===\s*PROMPT FOR|$)/i.exec(briefingText)?.[1]?.trim() ?? '';
}

type RunRow = {
  key: string;
  lot: string;
  lotId: string;
  lotName: string;
  lotType: string;
  format: FormatName;
  event: EventKind;
  sample: number;
  status: string;
  model: string;
  variantText: string;
  variantChars: number;
  variantTokens: number;
  locationBlock?: string;
  dialogue?: string;
  briefing?: string;
  sharedBriefing?: string;
  fallbackUsed: boolean;
  scores?: Record<string, unknown>;
  stages: StageTiming[];
  totalMs: number;
  error?: string;
  at: string;
};

const jobKey = (lot: Lot, format: FormatName, event: EventKind, sample: number) =>
  `${lot.key}|${format}|${event}|${sample}`;

async function runScene(
  lot: Lot,
  format: FormatName,
  event: EventKind,
  sample: number,
  key: string | undefined,
): Promise<RunRow> {
  const ctx = freshContext(
    `lot-${lot.key}-${format}-${event}-${sample}-${randomUUID().slice(0, 8)}`,
    lot,
    format,
    true,
    key,
  );
  const { timings } = timeStages(ctx);
  const text = variantText(lot, format);
  const startedAt = Date.now();
  const row: RunRow = {
    key: jobKey(lot, format, event, sample),
    lot: lot.key,
    lotId: String(lot.id),
    lotName: lot.name,
    lotType: lot.lot_type,
    format,
    event,
    sample,
    status: 'ERROR',
    model: MODEL,
    variantText: text,
    variantChars: text.length,
    variantTokens: llamaTokenizer.encode(text).length,
    fallbackUsed: false,
    stages: timings,
    totalMs: 0,
    at: new Date().toISOString(),
  };
  try {
    const spec = sceneFor(lot, event, ctx.settings.playerSpeakerName);
    const timeout = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error('scene timed out after 240 s'));
      }, 240_000);
    });
    const result = await Promise.race([ctx.ai.runDirectedGeneration(spec.event, spec.options), timeout]);
    row.status = result.status;
    row.locationBlock = locationBlockSent(result.exchanges);
    row.dialogue = result.text;
    const briefing = result.exchanges?.find((exchange) => exchange.label === 'Director Briefing');
    row.briefing = briefing?.responseText;
    row.sharedBriefing = briefing ? sharedBriefing(briefing.responseText) : '';
    row.fallbackUsed = !briefing || briefing.responseText.trim().length === 0;
    const scores = result.exchanges?.find((exchange) => exchange.label === 'Scene Scores');
    if (scores) {
      row.scores = Object.fromEntries(
        parseSceneScores(
          scores.responseText,
          spec.event.sentient_sims.map((performer) => performer.name),
        ),
      );
    }
    if (result.status !== InteractionEventStatus.GENERATED) {
      row.error = `status ${result.status}`;
    }
  } catch (err) {
    row.error = err instanceof Error ? err.message : String(err);
  } finally {
    row.totalMs = Date.now() - startedAt;
    try {
      ctx.db.unloadDatabase();
    } catch {
      // already closed
    }
  }
  return row;
}

function envList<T extends string>(name: string, all: T[]): T[] {
  const raw = process.env[name];
  if (!raw) return all;
  const picked = raw.split(',').map((item) => item.trim()) as T[];
  const unknown = picked.filter((item) => !all.includes(item));
  if (unknown.length > 0) throw new Error(`${name}: unknown ${unknown.join(', ')} (choose from ${all.join(', ')})`);
  return picked;
}

const describeExperiment = MODE ? describe : describe.skip;

describeExperiment('Lot description format experiment', () => {
  const lots = LOTS.filter((lot) =>
    envList(
      'LOT_LOTS',
      LOTS.map((candidate) => candidate.key),
    ).includes(lot.key),
  );
  const formats = envList('LOT_VARIANTS', FORMATS);
  const events = envList('LOT_EVENTS', EVENTS);
  const samples = Number(process.env.LOT_SAMPLES ?? 3);
  const lanes = Number(process.env.LOT_LANES ?? 4);

  (MODE === 'dry' ? it : it.skip)(
    'dry run: the director sees the exact LOCATION line per lot and format, and a player line briefs one performer',
    async () => {
      for (const lot of lots) {
        for (const format of formats) {
          for (const event of ['chat', 'ask_place'] as EventKind[]) {
            const ctx = freshContext(`lot-dry-${lot.key}-${format}-${event}`, lot, format, false);
            const { timings, systemPrompts } = timeStages(ctx, (label) => {
              if (label === 'Scene Scores') {
                return JSON.stringify({
                  [RICKY]: { memory: 5, action: 1, action_reason: '', unfinished: false, continue: 1 },
                  [RICHY]: { memory: 5, action: 1, action_reason: '', unfinished: false, continue: 1 },
                });
              }
              if (label === 'Director Briefing') {
                return `=== SCENE ===\nA quiet beat at ${lot.name}.\n=== PROMPT FOR ${RICKY} ===\nPlay it straight.\n=== PROMPT FOR ${RICHY} ===\nPlay it straight.`;
              }
              if (label === 'Director Review') return '';
              return 'SAY: This place is fine.\nTHINK: It really is.';
            });
            const spec = sceneFor(lot, event, ctx.settings.playerSpeakerName);
            const result = await ctx.ai.runDirectedGeneration(spec.event, spec.options);
            expect(result.status, `${lot.key}/${format}/${event}`).toEqual(InteractionEventStatus.GENERATED);
            expect(systemPrompts['Director Briefing'], `${lot.key}/${format}/${event}`).toContain(
              expectedLocationBlock(lot, format),
            );
            const actors = timings.filter((stage) => stage.label.startsWith('Actor:'));
            expect(actors.length, `${lot.key}/${format}/${event} actors`).toEqual(event === 'chat' ? 2 : 1);
            ctx.db.unloadDatabase();
          }
        }
      }
    },
    600_000,
  );

  (MODE === 'live' ? it : it.skip)(
    'live run: every (lot, format, event, sample) through the real pipeline, resumable',
    async () => {
      const key = loadOpenRouterKey();
      expect(key, 'No OpenRouter key: set OPENROUTER_KEY or the app OpenRouter setting').toBeTruthy();
      fs.mkdirSync(OUT_DIR, { recursive: true });
      const runsPath = path.join(OUT_DIR, 'runs.jsonl');
      const done = new Set<string>();
      if (fs.existsSync(runsPath)) {
        fs.readFileSync(runsPath, 'utf8')
          .split('\n')
          .filter(Boolean)
          .forEach((line) => {
            const row = JSON.parse(line) as RunRow;
            if (row.status === (InteractionEventStatus.GENERATED as string)) done.add(row.key);
          });
      }
      const jobs: Array<{ lot: Lot; format: FormatName; event: EventKind; sample: number }> = [];
      for (let sample = 0; sample < samples; sample += 1) {
        lots.forEach((lot) => {
          formats.forEach((format) => {
            events.forEach((event) => {
              if (!done.has(jobKey(lot, format, event, sample))) jobs.push({ lot, format, event, sample });
            });
          });
        });
      }
      console.log(`[LotFormat] ${jobs.length} scenes to run (${done.size} already done), ${lanes} lanes, ${MODEL}`);
      let next = 0;
      let generated = 0;
      let failed = 0;
      const lane = async () => {
        while (next < jobs.length) {
          const job = jobs[next];
          next += 1;
          const row = await runScene(job.lot, job.format, job.event, job.sample, key);
          fs.appendFileSync(runsPath, `${JSON.stringify(row)}\n`);
          if (row.status === (InteractionEventStatus.GENERATED as string)) generated += 1;
          else failed += 1;
          console.log(
            `[LotFormat] ${row.key} ${row.status} ${(row.totalMs / 1000).toFixed(1)}s` +
              `${row.error ? ` (${row.error})` : ''} [${generated} ok, ${failed} failed, ${jobs.length - next} left]`,
          );
        }
      };
      await Promise.all(Array.from({ length: Math.min(lanes, jobs.length) }, lane));
      expect(failed).toBe(0);
    },
    6 * 60 * 60 * 1000,
  );
});
