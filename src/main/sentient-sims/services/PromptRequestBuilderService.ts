import log from 'electron-log';
import {
  formatAction,
  formatSentientSim,
  formatDateTime,
  formatSeason,
  formatWeather,
} from '../formatter/PromptFormatter';
import { InteractionEvent, SSEvent, SSRelationships } from '../models/InteractionEvents';
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
import { ObjectDescription, objectDescriptions } from '../descriptions/objectDescriptions';

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
};

const maxGroupSizeLength = 1700;

export type PromptRequestBuilderOptions = GenerationOptions & {
  apiType: ApiType;
  modelSettings: ModelSettings;
};

export class PromptRequestBuilderService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  formatSims(sentientSims: SentientSim[], location: LocationEntity, relationships?: SSRelationships): string[] {
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

      participants.forEach((participant) => {
        if (participant.id === sentientSim.sim_id && participant.description) {
          sentientSim.description = participant.description;
        }
      });

      formattedParticipants.push(
        `<CHARACTER_IN_INTERACTION>\n${formatSentientSim(sentientSim)}\n</CHARACTER_IN_INTERACTION>`,
      );
    });

    const relationshipDescriptions: string[] = [];
    // TODO: Fix relationship bits from interaction mapping
    if (relationships && relationships.relationship_bits) {
      relationships.relationship_bits.forEach((bit) => {
        if (defaultRelationshipBitDescriptions.has(bit.name)) {
          const bitDescription = defaultRelationshipBitDescriptions.get(bit.name);
          if (!bitDescription?.ignored && bitDescription?.description) {
            relationshipDescriptions.push(
              formatAction(
                bitDescription.description,
                [sims.get(bit.sim_one_id) as SentientSim, sims.get(bit.sim_two_id) as SentientSim],
                location,
              ),
            );
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

  getMemories(sentientSims: SentientSim[]) {
    const participantIds = sentientSims.map((sentientSim) => sentientSim.sim_id);

    return this.ctx.memoryRepository.getParticipantsMemories({
      participant_ids: participantIds,
    });
  }

  groupMemories(memories: MemoryEntity[]): FormattedMemoryMessage[] {
    const messages: PreFormattedMemoryMessage[] = [];

    const locations: Record<number, LocationEntity> = {};

    const addMessage = (role: ChatCompletionMessageRole, text: string, locationId: number) => {
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
          location.id === messages[messages.length - 1].location
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
          });
        }
      }

      if (role === 'assistant') {
        messages.push({
          content: text,
          role,
          location: locationId,
        });
      } else {
        messages.push({
          content: `At ${location.name} (${location.lot_type}), ${text}`,
          role,
          location: locationId,
        });
      }
    };

    memories.forEach((memory) => {
      if (memory.pre_action && memory.pre_action.trim()) {
        addMessage('user', memory.pre_action, memory.location_id);
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

  buildPromptRequest(event: SSEvent, options: PromptRequestBuilderOptions): PromptRequest {
    const location = this.ctx.locationRepository.getLocation({
      id: event.environment.location_id,
    });

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

    const systemPrompt = getSystemPrompt(event.event_type, options.apiType);
    const formattedSystemPrompt = formatAction(
      systemPrompt,
      event.sentient_sims,
      location,
      options.sexCategoryType,
      options.sexLocationType,
      postures,
    );

    const sims = this.formatSims(event.sentient_sims, location, event.relationships);
    sims.push(this.buildDirectorBlock(event));
    sims.push(this.buildSceneGuidance());
    const memories = this.getMemories(event.sentient_sims);
    const groupedMemories = this.groupMemories(memories);
    const formattedLocation = formatAction(
      '<LOCATION>\n{location} ({location_type}), {location_description}\n</LOCATION>',
      event.sentient_sims,
      location,
      options.sexCategoryType,
      options.sexLocationType,
      postures,
    );

    const maxResponseTokens = Math.min(
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
