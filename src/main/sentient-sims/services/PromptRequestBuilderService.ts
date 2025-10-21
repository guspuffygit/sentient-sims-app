import log from 'electron-log';
import { formatAction, formatSentientSim, formatDateTime, formatSeason } from '../formatter/PromptFormatter';
import { SSEvent, SSRelationships } from '../models/InteractionEvents';
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

  async formatSims(
    sentientSims: SentientSim[],
    location: LocationEntity,
    relationships?: SSRelationships,
  ): Promise<string[]> {
    const participants = await this.ctx.participantRepository.getParticipants(
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
        if (bodyPosturePosition?.ignored !== true && bodyPosturePosition?.description) {
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
      if (!locations[locationId]) {
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

  async buildPromptRequest(event: SSEvent, options: PromptRequestBuilderOptions): Promise<PromptRequest> {
    const location = this.ctx.locationRepository.getLocation({
      id: event.environment.location_id,
    });

    const dateTime = formatDateTime(event.environment);
    const season = formatSeason(event.environment);
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
    options?.stopTokens?.forEach((stopToken) => {
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

    const simsPromise = this.formatSims(event.sentient_sims, location, event.relationships);
    const memories = this.getMemories(event.sentient_sims);
    const groupedMemories = this.groupMemories(memories);
    const sims = await simsPromise;
    const formattedLocation = formatAction(
      '<LOCATION>\n{location} ({location_type}), {location_description}\n</LOCATION>',
      event.sentient_sims,
      location,
      options.sexCategoryType,
      options.sexLocationType,
      postures,
    );

    return {
      systemPrompt: formattedSystemPrompt,
      participants: sims.join('\n'),
      location: formattedLocation,
      dateTime,
      season,
      memories: groupedMemories,
      action: formattedAction,
      maxResponseTokens: 90,
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
