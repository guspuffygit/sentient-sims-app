import log from 'electron-log';
import {
  formatAction,
  formatSentientSim,
  formatDateTime,
  formatSeason,
  formatWeather,
} from '../formatter/PromptFormatter';
import { InteractionEvent, SSEvent, SSEventType, SSRelationships } from '../models/InteractionEvents';
import { getSystemPrompt } from '../systemPrompts';
import { ApiType } from '../models/ApiType';
import { FormattedMemoryMessage, PreFormattedMemoryMessage, PromptRequest } from '../models/OpenAIRequestBuilder';
import { SentientSim } from '../models/SentientSim';
import { MemoryEntity } from '../db/entities/MemoryEntity';
import { ChatCompletionMessageRole } from '../models/ChatCompletionMessageRole';
import { ModelSettings } from '../modelSettings';
import { defaultRelationshipBitDescriptions } from '../descriptions/relationshipDescriptions';
import { LocationEntity } from '../db/entities/LocationEntity';
import { PromptHistoryMode } from '../models/PromptHistoryMode';
import { ApiContext } from './ApiContext';
import { postureDescriptions, PostureType } from '../descriptions/postureDescriptions';
import { buildAlsoPresentBlock } from '../util/alsoPresent';
import { isAdultAge, keepIntimateRowForScene } from '../util/intimateScene';
import { ObjectDescription, objectDescriptions } from '../descriptions/objectDescriptions';
import { memoryRecallText } from '../util/memoryRecallText';

// Per-Sim fact blocks are separated by a newline, so a model reading the prompt sees them
// as separate points of view rather than one run-on list.
const FACT_BLOCK_SEPARATOR = '\n';

export type GenerationOptions = {
  action?: string;
  preAction?: string;
  prePreAction?: string;
  preAssistantPreResponse?: string;
  assistantPreResponse?: string;
  stopTokens?: string[];
  sexCategoryType?: number;
  sexLocationType?: number;
  continue?: boolean;
  promptHistoryMode?: PromptHistoryMode;
  // Overrides the player's maxResponseTokens for this one generation (WickedWhims writes a
  // whole scene in one call)
  maxResponseTokens?: number;
  // Air the scene as generated, without runDirectorReview
  skipReview?: boolean;
};

const maxGroupSizeLength = 1700;

// How many retrieved memories ride along in the prompt, and how long each is allowed to
// be — six short lines of history, never a second transcript.
const relevantMemoryCount = 6;
// J1: a Sim's own most recent diaries in a briefing. The old world-wide gather showed up
// to seven rows of anyone's; three per performer keeps a two-Sim scene at the same size.
const reflectionsPerSim = 3;

export type ReflectionsBySim = { sim: SentientSim; reflections: MemoryEntity[] };
const maxRelevantMemoryLength = 280;

// How long a canceled-outcome row stays in the verbatim scene transcript. Recent enough to
// stop a sim retrying an impossible action; short enough that failed bookkeeping doesn't
// ride along in every later prompt (live, "grab_snack was canceled" followed the story for
// the rest of the session). The rows stay in the DB for retrieval either way.
const canceledOutcomeSceneWindowMs = 10 * 60 * 1000;

// A memory row can hold several kinds of text; pick the most factual one and keep it short.
export function summarizeMemory(memory: MemoryEntity): string {
  // A reply to the player recalls with the line that prompted it (memoryRecallText)
  const text = memoryRecallText(memory).replace(/\s+/g, ' ').trim();
  if (text.length <= maxRelevantMemoryLength) {
    return text;
  }
  return `${text.slice(0, maxRelevantMemoryLength).trimEnd()}…`;
}

export type PromptRequestBuilderOptions = GenerationOptions & {
  apiType: ApiType;
  modelSettings: ModelSettings;
};

export class PromptRequestBuilderService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  formatSims(
    sentientSims: SentientSim[],
    location: LocationEntity,
    relationships?: SSRelationships,
    // A sexual act renders no descriptions: a parent's names their children ("has become a
    // second parent to Elliot's son"), and nothing about a child may reach that prompt
    options: { omitDescriptions?: boolean } = {},
  ): string[] {
    const participants = this.ctx.participantRepository.getParticipants(
      sentientSims.map((sentientSim) => {
        try {
          return { id: sentientSim.sim_id, fullName: sentientSim.name };
        } catch (err: any) {
          log.error('Help!!', err);
          log.error(JSON.stringify(sentientSim, null, 2));
          throw err;
        }
      }),
    );

    const formattedParticipants: string[] = [];
    const sims = new Map<string, SentientSim>();

    sentientSims.forEach((sentientSim) => {
      sims.set(sentientSim.sim_id, sentientSim);

      let storedDescription: string | undefined;
      participants.forEach((participant) => {
        if (participant.id === sentientSim.sim_id) {
          storedDescription = participant.description;
          if (participant.description) {
            sentientSim.description = participant.description;
          }
        }
      });

      // V-6: an undescribed character is the richest they will ever be right here — the
      // live SentientSim carries the traits/likes/career the generator needs. Fire and
      // forget: this prompt still goes out with no description, the NEXT one has one.
      this.ctx.defaultDescriptions.considerSim(sentientSim, storedDescription);

      const keptDescription = sentientSim.description;
      if (options.omitDescriptions) {
        sentientSim.description = undefined;
      }
      formattedParticipants.push(
        `<CHARACTER_IN_INTERACTION>\n${formatSentientSim(sentientSim, {
          traitConsistencyNote: this.ctx.settings.directedScenesEnabled,
        })}\n</CHARACTER_IN_INTERACTION>`,
      );
      sentientSim.description = keptDescription;
    });

    const relationshipDescriptions: string[] = [];
    // TODO: Fix relationship bits from interaction mapping
    if (relationships && relationships.relationship_bits) {
      relationships.relationship_bits.forEach((bit) => {
        if (defaultRelationshipBitDescriptions.has(bit.name)) {
          const bitDescription = defaultRelationshipBitDescriptions.get(bit.name);
          if (!bitDescription?.ignored && bitDescription?.description) {
            const simOne = sims.get(bit.sim_one_id);
            const simTwo = sims.get(bit.sim_two_id);
            // Group events carry pairwise bits for the whole conversation; a bit whose
            // sims aren't both in this (possibly narrowed) event can't be described
            if (!simOne || !simTwo) {
              return;
            }
            relationshipDescriptions.push(formatAction(bitDescription.description, [simOne, simTwo], location));
          }
        }
      });
    }

    if (relationshipDescriptions.length > 0) {
      formattedParticipants.push(`<RELATIONSHIPS>\n${relationshipDescriptions.join(' ')}\n</RELATIONSHIPS>`);
    }

    return formattedParticipants;
  }

  formatSimPostures(sentientSims: SentientSim[]) {
    const formattedPositions: string[] = [];
    sentientSims.forEach((sentientSim) => {
      const positionStrings: string[] = [`${sentientSim.name} is`];
      if (sentientSim.body_posture && sentientSim.body_posture in postureDescriptions) {
        const bodyPosturePosition = postureDescriptions[sentientSim.body_posture];
        if (bodyPosturePosition.ignored !== true && bodyPosturePosition.description) {
          positionStrings.push(bodyPosturePosition.description);
        }
        if (sentientSim.posture_linked_sim) {
          positionStrings.push(`with ${sentientSim.posture_linked_sim.name}`);
        }

        let objectDescription: ObjectDescription | undefined;
        if (sentientSim.target_part_owner_name && sentientSim.target_part_owner_name in objectDescriptions) {
          // This is an explicit description of a specific object
          objectDescription = objectDescriptions[sentientSim.target_part_owner_name];
        } else if (
          sentientSim.target_slot_type_set_name &&
          sentientSim.target_slot_type_set_name in objectDescriptions
        ) {
          // This ia a more generic description of a slot_type
          objectDescription = objectDescriptions[sentientSim.target_slot_type_set_name];
        } else if (sentientSim.target_name && sentientSim.target_name in objectDescriptions) {
          // This is fallback to target_name
          objectDescription = objectDescriptions[sentientSim.target_name];
        }
        if (
          objectDescription &&
          objectDescription.ignored !== true &&
          objectDescription.description &&
          bodyPosturePosition.posture_type !== PostureType.FINAL
        ) {
          positionStrings.push(`at the ${objectDescription.description}`);
        }
      }

      if (positionStrings.length > 1) {
        formattedPositions.push(positionStrings.join(' '));
      }
    });

    if (formattedPositions.length > 0) {
      return formattedPositions.join(', ');
    }

    return undefined;
  }

  // Only the current scene's raw memories are replayed verbatim. Everything from earlier scenes
  // is represented by the distilled reflections in the <PAST_REFLECTIONS> block instead.
  // With an event, rows are also cut to what its performers may see (intimateScene).
  getMemories(event?: SSEvent) {
    const scene = this.ctx.sceneService.getCurrentScene();
    if (!scene) {
      return [];
    }

    const rows = this.ctx.memoryRepository.getSceneMemories(scene.locationId, scene.startedAt);
    const cutoff = Date.now() - canceledOutcomeSceneWindowMs;
    const recent = rows.filter((memory) => {
      if (memory.event_type !== 'outcome') {
        return true;
      }
      // 'was canceled' matches CognitionController's outcomeVerb() exactly; success and
      // failure outcomes keep flowing into scene context — they read naturally
      if (!memory.observation || !memory.observation.includes('was canceled')) {
        return true;
      }
      if (!memory.timestamp) {
        return false;
      }
      const storedAt = Date.parse(`${memory.timestamp.replace(' ', 'T')}Z`);
      return !Number.isNaN(storedAt) && storedAt >= cutoff;
    });
    return event ? this.scopeSceneRowsToPerformers(recent, event) : recent;
  }

  // The scene is the whole lot's history, so a sexual act replays to whoever acts next
  // there - a toddler's bedtime included (live 2026-09-23, see util/intimateScene). A
  // WickedWhims event is told only from rows its own performers are alone in; any other
  // event keeps everything except sexual-act rows it has no business seeing. Without a
  // participant lookup (a stub context) every sexual-act row is dropped and a WickedWhims
  // event gets no history at all: the safe way to fail.
  private scopeSceneRowsToPerformers(rows: MemoryEntity[], event: SSEvent): MemoryEntity[] {
    const isAct = event.event_type === SSEventType.WICKED_WHIMS;
    const intimateRows = rows.filter((row) => row.event_type === SSEventType.WICKED_WHIMS);
    if (!isAct && intimateRows.length === 0) {
      return rows;
    }
    const performerIds = new Set(event.sentient_sims.map((sim) => sim.sim_id));
    const performersAdult = event.sentient_sims.every((sim) => isAdultAge(sim.age));
    let participants = new Map<string, string[]>();
    try {
      participants = this.ctx.memoryRepository.getParticipantIdsForMemories(
        (isAct ? rows : intimateRows).map((row) => row.id).filter((id): id is string => id !== undefined),
      );
    } catch {
      participants = new Map();
    }
    const allowed = (row: MemoryEntity) =>
      keepIntimateRowForScene(participants.get(row.id ?? '') ?? [], performerIds, performersAdult);
    return rows.filter((row) => (isAct || row.event_type === SSEventType.WICKED_WHIMS ? allowed(row) : true));
  }

  // J1 (2026-09-04): each performer's OWN most recent reflections, newest first. A
  // reflection is one Sim's private diary; until now the block was gathered world-wide (the
  // three most recent overall plus two at this location, whatever the author), so a briefing
  // for Milo carried Tessa's day at another lot and the actors played it as shared history
  // (the 2026-09-04 playtest handoff, cause 1). Same owner rule as getSceneMemories: one Sim's private
  // head never reaches another Sim's performance. Rows with no owner appear for nobody.
  getReflections(event: SSEvent): ReflectionsBySim[] {
    return event.sentient_sims.map((sim) => ({
      sim,
      reflections: this.ctx.memoryRepository.getRecentReflectionsByOwner(sim.sim_id, reflectionsPerSim),
    }));
  }

  // One <PAST_REFLECTIONS> block per Sim who has any, labelled by speaker in a multi-Sim
  // scene the way knownFactsForScene labels facts, so the director can keep each diary in
  // its owner's private briefing. A solo scene keeps the unlabelled tag.
  private buildReflectionsBlock(reflectionsBySim: ReflectionsBySim[]): string | undefined {
    const withRows = reflectionsBySim.filter((entry) => entry.reflections.length > 0);
    if (withRows.length === 0) {
      return undefined;
    }
    const labelled = reflectionsBySim.length > 1;

    const blocks = withRows.map(({ sim, reflections }) => {
      const lines = reflections.map((reflection) => {
        const location = this.ctx.locationRepository.getLocation({ id: reflection.location_id });
        return `[At ${location.name}] ${reflection.content}`;
      });
      return [
        labelled ? `<PAST_REFLECTIONS speaker="${sim.name}">` : '<PAST_REFLECTIONS>',
        ...lines,
        '</PAST_REFLECTIONS>',
      ].join('\n');
    });

    return [
      ...blocks,
      labelled
        ? 'Each block is one character’s own distilled memories of past scenes, private to them: fold a diary only into its owner’s briefing, never into the shared scene or another actor’s briefing. Draw on them only when relevant; do not recap them.'
        : 'These are the character’s distilled memories of past scenes. Draw on them only when relevant; do not recap them.',
    ].join('\n');
  }

  // Older memories that score as relevant to this moment (Block 5 retrieval). The current
  // scene's rows and the reflections already shown are excluded so this block only ever
  // adds information the prompt doesn't have yet.
  async getRelevantMemories(event: SSEvent, queryText: string, excludeMemoryIds: string[]): Promise<MemoryEntity[]> {
    try {
      const retrieved = await this.ctx.memoryRetrieval.retrieve({
        participantIds: event.sentient_sims.map((sentientSim) => sentientSim.sim_id),
        queryText,
        k: relevantMemoryCount,
        excludeMemoryIds,
        // The director stages the scene for everyone present, so any present sim's
        // private monologue rows may inform it — actors still only see their briefings
        ownerScope: event.sentient_sims.map((sentientSim) => sentientSim.sim_id),
      });
      return retrieved.map((result) => result.memory);
    } catch (error) {
      log.error('[Memory] Retrieval failed, continuing without relevant memories', error);
      return [];
    }
  }

  /**
   * One facts block per Sim in the scene, each written from that Sim's point of view and
   * labelled with their name. A single shared block would be a small omniscient director
   * again: an actor would see what the other Sim privately knows.
   *
   * Never throws - a scene with no facts is the pre-3.1 prompt, which is a fine
   * degradation; a scene that fails to build is a silent Sim.
   */
  private knownFactsForScene(event: SSEvent): string | undefined {
    try {
      const others = event.sentient_sims.map((sim) => sim.sim_id);
      const blocks = event.sentient_sims
        .map((sim) => {
          const facts = this.ctx.semanticMemory.recall(sim.sim_id, {
            mentionedSimIds: others.filter((id) => id !== sim.sim_id),
          });
          // Multi-Sim scenes need to say whose facts these are; a solo scene does not.
          return facts && event.sentient_sims.length > 1
            ? facts.replace('<KNOWN_FACTS>', `<KNOWN_FACTS speaker="${sim.name}">`)
            : facts;
        })
        .filter(Boolean);
      return blocks.length > 0 ? blocks.join(FACT_BLOCK_SEPARATOR) : undefined;
    } catch (error) {
      log.warn('[Facts] scene fact recall failed; building the scene without facts', error);
      return undefined;
    }
  }

  private buildRelevantMemoriesBlock(memories: MemoryEntity[]): string | undefined {
    if (memories.length === 0) {
      return undefined;
    }

    const lines = memories.map((memory) => {
      const location = this.ctx.locationRepository.getLocation({ id: memory.location_id });
      return `[At ${location.name}] ${summarizeMemory(memory)}`;
    });

    return [
      '<RELEVANT_MEMORIES>',
      ...lines,
      '</RELEVANT_MEMORIES>',
      'These are past moments the characters genuinely remember. Draw on them only when relevant; do not recap them.',
    ].join('\n');
  }

  groupMemories(memories: MemoryEntity[]): FormattedMemoryMessage[] {
    const messages: PreFormattedMemoryMessage[] = [];

    const locations: Record<number, LocationEntity> = {};

    const addMessage = (role: ChatCompletionMessageRole, text: string, locationId: number, includeLocation = true) => {
      if (!(locationId in locations)) {
        locations[locationId] = this.ctx.locationRepository.getLocation({
          id: locationId,
        });
      }

      const location = locations[locationId];

      // Combine messages from the same role
      if (messages.length > 0 && messages[messages.length - 1].role === role) {
        if (
          messages[messages.length - 1].content.length < maxGroupSizeLength &&
          location.id === messages[messages.length - 1].location &&
          includeLocation === messages[messages.length - 1].includeLocation
        ) {
          messages[messages.length - 1].content += ` ${text.trim()}`;
          return;
        }
        if (role === 'assistant') {
          // If you let assistant run for too long, after about 500 tokens it starts to repeat
          // This helps give it a kick
          messages.push({
            content: 'Continue talking and interacting',
            role: 'user',
            location: locationId,
            includeLocation: false,
          });
        }
      }

      if (role === 'assistant') {
        messages.push({
          content: text,
          role,
          location: locationId,
          includeLocation,
        });
      } else {
        messages.push({
          content: includeLocation ? `At ${location.name} (${location.lot_type}), ${text}` : text,
          role,
          location: locationId,
          includeLocation,
        });
      }
    };

    memories.forEach((memory) => {
      if (memory.pre_action && memory.pre_action.trim()) {
        addMessage('user', `(${memory.pre_action})`, memory.location_id, false);
      }

      if (memory.action && memory.action.trim()) {
        addMessage('user', memory.action, memory.location_id);
      }

      if (memory.observation && memory.observation.trim()) {
        addMessage('user', memory.observation, memory.location_id);
      }

      if (memory.content && memory.content.trim()) {
        addMessage('assistant', memory.content, memory.location_id);
      }
    });

    const formattedMessages: FormattedMemoryMessage[] = [];
    messages.forEach((message) => formattedMessages.push({ content: message.content, role: message.role }));
    return formattedMessages;
  }

  private buildDirectorBlock(event: SSEvent): string {
    const interactionName = (event as Partial<InteractionEvent>).interaction_name ?? '';

    let sceneTone: string;
    let sceneObjective: string;

    if (/romantic/i.test(interactionName)) {
      sceneTone = 'warm and flirtatious';
      sceneObjective =
        'Show romantic interest through small gestures and careful word choice — nothing too bold or dramatic.';
    } else if (/mean|fight|argue/i.test(interactionName)) {
      sceneTone = 'tense and pointed';
      sceneObjective =
        'Let the friction show through clipped words and guarded body language — no screaming, no blowups.';
    } else if (/funny|joke|humor/i.test(interactionName)) {
      sceneTone = 'light and playful';
      sceneObjective = 'Deliver the moment with timing — a dry line, a laugh, a raised eyebrow. Keep it brief.';
    } else if (/mischief|prank/i.test(interactionName)) {
      sceneTone = 'mischievous and sly';
      sceneObjective =
        'Play up the mischief with a smirk and deliberate phrasing — the other character may not know what hit them.';
    } else {
      sceneTone = 'natural and conversational';
      sceneObjective = 'Let the exchange happen organically — genuine reaction and everyday social texture.';
    }

    const multipleCharacters = event.sentient_sims.length >= 2;
    const lines = [
      `Tone: ${sceneTone}.`,
      `Scene objective: ${sceneObjective}`,
      'Delivery notes are optional — use one when it sharpens how a line lands. Pure dialogue is fine when the words carry themselves.',
      'Delivery notes describe how a character sounds or feels, not what they physically do. Keep them under eight words.',
      'Do not invent physical actions, furniture, props, or activities unless already established in the scene.',
      multipleCharacters
        ? 'Include at least one back-and-forth exchange: each character speaks at least once, and the character who spoke first responds again. Keep it to three to six lines total.'
        : 'Length: two to four lines total. Cut anything that does not pull its weight.',
    ];

    return `<DIRECTOR>\n${lines.join('\n')}\n</DIRECTOR>`;
  }

  private buildSceneGuidance(): string {
    const lines = [
      'Keep this scene grounded in everyday life.',
      "Avoid sudden major revelations, dramatic escalations, or events that would fundamentally alter the characters' lives.",
      'Do not invent new facts about characters, locations, or past events not already established.',
      'Responses should be natural and conversational — not cinematic, not poetic, not melodramatic.',
      'If the scene is already in progress, continue it mid-flow — do not re-describe the setting, re-introduce the characters, or restate what has already happened.',
    ];
    return `<SCENE_GUIDANCE>\n${lines.join(' ')}\n</SCENE_GUIDANCE>`;
  }

  async buildPromptRequest(event: SSEvent, options: PromptRequestBuilderOptions): Promise<PromptRequest> {
    const location = this.ctx.locationRepository.getLocation({
      id: event.environment.location_id,
    });

    // V-6: "The Residence" for every lot in the save. The state report's lot block (venue,
    // ownership, conditions) plus the world name is everything the app knows about a place.
    const reportedLot = this.ctx.simStateCache.getReport()?.lot;
    // Only describe the lot the report is actually about — an event from another lot (a
    // memory replay, a travelling sim) must not borrow this one's facts. Match on lot_id:
    // location_id IS the lot id, and the report's zone_id is a different handle entirely.
    const sameLot = reportedLot?.lot_id !== undefined && reportedLot.lot_id === String(event.environment.location_id);
    this.ctx.defaultDescriptions.considerLocation(
      location,
      sameLot ? reportedLot : undefined,
      sameLot ? reportedLot.lot_name : undefined,
    );

    const dateTime = formatDateTime(event.environment);
    const season = formatSeason(event.environment);
    const weather = formatWeather(event.environment);
    const postures = this.formatSimPostures(event.sentient_sims);

    let formattedAction;
    if (options.action) {
      formattedAction = formatAction(
        options.action,
        event.sentient_sims,
        location,
        options.sexCategoryType,
        options.sexLocationType,
        postures,
      );
    }

    let formattedPreAction;
    if (options.preAction) {
      formattedPreAction = formatAction(
        options.preAction,
        event.sentient_sims,
        location,
        options.sexCategoryType,
        options.sexLocationType,
        postures,
      );
    }

    let formattedAssistantPreResponse = '';
    if (options.assistantPreResponse) {
      formattedAssistantPreResponse = formatAction(
        options.assistantPreResponse,
        event.sentient_sims,
        location,
        options.sexCategoryType,
        options.sexLocationType,
        postures,
      );
    }

    let formattedPrePreAction = '';
    if (options.prePreAction) {
      log.debug('It has prePreAction');
      formattedPrePreAction = formatAction(
        options.prePreAction,
        event.sentient_sims,
        location,
        options.sexCategoryType,
        options.sexLocationType,
        postures,
      );
      log.debug(`formattedPrePreAction: ${formattedPrePreAction}`);
    }

    const formattedStopTokens: string[] = [];
    options.stopTokens?.forEach((stopToken) => {
      formattedStopTokens.push(
        formatAction(
          stopToken,
          event.sentient_sims,
          location,
          options.sexCategoryType,
          options.sexLocationType,
          postures,
        ),
      );
    });

    let formattedPreAssistantPreResponse = '';
    if (options.preAssistantPreResponse) {
      log.debug('It has preAssistantPreResponse');
      formattedPreAssistantPreResponse = formatAction(
        options.preAssistantPreResponse,
        event.sentient_sims,
        location,
        options.sexCategoryType,
        options.sexLocationType,
        postures,
      );
      log.debug(`preAssistantPreResponse: ${formattedPreAssistantPreResponse}`);
    }

    const directedScenes = this.ctx.settings.directedScenesEnabled;
    const systemPrompt = getSystemPrompt(event.event_type, options.apiType, directedScenes);
    const formattedSystemPrompt = formatAction(
      systemPrompt,
      event.sentient_sims,
      location,
      options.sexCategoryType,
      options.sexLocationType,
      postures,
    );

    // A sexual act is told from its performers alone: no lot roster (it put a toddler in
    // the 09-23 prompt), and none of the everyday director notes, which asked for "two to
    // four lines, natural and conversational" and pulled the model into the house's last
    // conversation instead of the act.
    const isIntimateAct = event.event_type === SSEventType.WICKED_WHIMS;
    const sims = this.formatSims(event.sentient_sims, location, event.relationships, {
      omitDescriptions: isIntimateAct,
    });
    // J3: who else is on this lot (people and pets, species where the mod says), right
    // after the character blocks, so "which cats are here" has a roster to answer from.
    // Only for the lot the report is about; another lot's event renders nothing here.
    const alsoPresent = isIntimateAct
      ? undefined
      : buildAlsoPresentBlock(
          this.ctx.simStateCache.getReport(),
          event.environment.location_id,
          event.sentient_sims.map((sim) => sim.sim_id),
        );
    if (alsoPresent) {
      sims.push(alsoPresent);
    }
    if (directedScenes && !isIntimateAct) {
      sims.push(this.buildDirectorBlock(event));
      sims.push(this.buildSceneGuidance());
    }

    // Diaries, retrieved recollections and the facts list stay out of a sexual act too. On
    // 09-23 all three were about the household's toddler (bedtime stories, "you live with
    // Elliot Jr"), and they are the context the model reached for.
    const reflectionsBySim = isIntimateAct ? [] : this.getReflections(event);
    const reflections = reflectionsBySim.flatMap((entry) => entry.reflections);
    const reflectionsBlock = this.buildReflectionsBlock(reflectionsBySim);
    if (reflectionsBlock) {
      sims.push(reflectionsBlock);
    }

    const memories = this.getMemories(event);
    const groupedMemories = this.groupMemories(memories);

    // Retrieval query: what is about to happen plus who is involved. Scene rows and shown
    // reflections are already in the prompt, so they are excluded from retrieval.
    const queryText = [formattedPreAction ?? formattedAction ?? '', ...event.sentient_sims.map((sim) => sim.name)]
      .join(' ')
      .trim();
    const excludeMemoryIds = [...memories, ...reflections]
      .map((memory) => memory.id)
      .filter((id): id is string => id !== undefined);
    const relevantMemories = isIntimateAct ? [] : await this.getRelevantMemories(event, queryText, excludeMemoryIds);
    const relevantMemoriesBlock = this.buildRelevantMemoriesBlock(relevantMemories);
    if (relevantMemoriesBlock) {
      sims.push(relevantMemoriesBlock);
    }

    // <KNOWN_FACTS> for the Sims in this scene (Phase 3.1). Without it the actor path was
    // the one place a Sim spoke with no ground truth at all, and it showed: asked who he
    // lived with, Travis named two people who do not exist (self-knowledge battery,
    // 2026-09-03, 1/9). Facts go BEFORE the memories block for the same reason as in the
    // tick - what is true should survive a truncation that costs a recollection.
    const factsBlock = isIntimateAct ? undefined : this.knownFactsForScene(event);
    if (factsBlock) {
      sims.splice(relevantMemoriesBlock ? sims.length - 1 : sims.length, 0, factsBlock);
    }

    const currentScene = this.ctx.sceneService.getCurrentScene();
    log.info(
      `[Memory] Scene ${currentScene ? `${currentScene.sceneId} (location ${currentScene.locationId})` : 'none'}: ` +
        `${memories.length} scene memories, ${reflections.length} reflections ` +
        `[${reflections.map((reflection) => reflection.id).join(', ')}], ` +
        `${relevantMemories.length} retrieved [${relevantMemories.map((memory) => memory.id).join(', ')}]`,
    );
    const formattedLocation = formatAction(
      '<LOCATION>\n{location} ({location_type}), {location_description}\n</LOCATION>',
      event.sentient_sims,
      location,
      options.sexCategoryType,
      options.sexLocationType,
      postures,
    );

    const maxResponseTokens =
      options.maxResponseTokens ??
      Math.min(
        options.modelSettings.maxResponseTokens ?? this.ctx.settings.maxResponseTokens,
        this.ctx.settings.maxResponseTokens,
      );

    log.info(
      `MaxResponseTokens: ${maxResponseTokens} modelSettings: ${options.modelSettings.maxResponseTokens} settings ${this.ctx.settings.maxResponseTokens}`,
    );

    return {
      systemPrompt: formattedSystemPrompt,
      participants: sims.join('\n'),
      location: formattedLocation,
      dateTime,
      season,
      weather,
      memories: groupedMemories,
      action: formattedAction,
      maxResponseTokens,
      maxTokens: options.modelSettings.max_tokens,
      assistantPreResponse: formattedAssistantPreResponse,
      prePreAction: formattedPrePreAction,
      preAssistantPreResponse: formattedPreAssistantPreResponse,
      stopTokens: formattedStopTokens,
      continue: options.continue,
      promptHistoryMode: options.promptHistoryMode,
      postures,
      preAction: formattedPreAction,
    };
  }
}
