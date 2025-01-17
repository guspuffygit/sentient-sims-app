import log from 'electron-log';
import {
  formatAction,
  formatSentientSim,
  formatDateTime,
} from '../formatter/PromptFormatter';
import { SSEvent, SSRelationships } from '../models/InteractionEvents';
import { RepositoryService } from './RepositoryService';
import { getSystemPrompt } from '../systemPrompts';
import { ApiType } from '../models/ApiType';
import {
  FormattedMemoryMessage,
  PromptRequest,
} from '../models/OpenAIRequestBuilder';
import { SentientSim } from '../models/SentientSim';
import { MemoryEntity } from '../db/entities/MemoryEntity';
import { ChatCompletionMessageRole } from '../models/ChatCompletionMessageRole';
import { ModelSettings } from '../modelSettings';
import { defaultRelationshipBitDescriptions } from '../descriptions/relationshipDescriptions';
import { LocationEntity } from '../db/entities/LocationEntity';

export type GenerationOptions = {
  action?: string;
  prePreAction?: string;
  preAssistantPreResponse?: string;
  assistantPreResponse?: string;
  stopTokens?: string[];
  sexCategoryType?: number;
  sexLocationType?: number;
  continue?: boolean;
};

const maxGroupSizeLength = 1700;

export type PromptRequestBuilderOptions = GenerationOptions & {
  apiType: ApiType;
  modelSettings: ModelSettings;
};

export class PromptRequestBuilderService {
  private readonly repositoryService: RepositoryService;

  constructor(repositoryService: RepositoryService) {
    this.repositoryService = repositoryService;
  }

  async formatSims(
    sentientSims: SentientSim[],
    location: LocationEntity,
    relationships?: SSRelationships
  ): Promise<string[]> {
    const participants =
      await this.repositoryService.participant.getParticipants(
        sentientSims.map((sentientSim) => {
          try {
            return { id: sentientSim.sim_id, fullName: sentientSim.name };
          } catch (err: any) {
            log.error('Help!!', err);
            log.error(JSON.stringify(sentientSim, null, 2));
            throw err;
          }
        })
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

      formattedParticipants.push(formatSentientSim(sentientSim));
    });

    const relationshipDescriptions: string[] = [];
    // TODO: Fix relationship bits from interaction mapping
    if (relationships && relationships.relationship_bits) {
      relationships.relationship_bits.forEach((bit) => {
        if (defaultRelationshipBitDescriptions.has(bit.name)) {
          const bitDescription = defaultRelationshipBitDescriptions.get(
            bit.name
          );
          if (!bitDescription?.ignored && bitDescription?.description) {
            relationshipDescriptions.push(
              formatAction(
                bitDescription.description,
                [
                  sims.get(bit.sim_one_id) as SentientSim,
                  sims.get(bit.sim_two_id) as SentientSim,
                ],
                location
              )
            );
          }
        }
      });
    }

    if (relationshipDescriptions.length > 0) {
      formattedParticipants.push(relationshipDescriptions.join(' '));
    }

    return formattedParticipants;
  }

  getMemories(sentientSims: SentientSim[]) {
    const participantIds = sentientSims.map(
      (sentientSim) => sentientSim.sim_id
    );

    return this.repositoryService.memory.getParticipantsMemories({
      participant_ids: participantIds,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  groupMemories(memories: MemoryEntity[]): FormattedMemoryMessage[] {
    const messages: FormattedMemoryMessage[] = [];

    function addMessage(role: ChatCompletionMessageRole, text: string) {
      // Combine messages from the same role
      if (messages.length > 0 && messages[messages.length - 1].role === role) {
        if (messages[messages.length - 1].content.length < maxGroupSizeLength) {
          messages[messages.length - 1].content += ` ${text.trim()}`;
          return;
        }
        if (role === 'assistant') {
          // If you let assistant run for too long, after about 500 tokens it starts to repeat
          // This helps give it a kick
          messages.push({
            content: 'Continue talking and interacting',
            role: 'user',
          });
        }
      }

      messages.push({
        content: text,
        role,
      });
    }

    memories.forEach((memory) => {
      if (memory.pre_action && memory.pre_action.trim()) {
        addMessage('user', memory.pre_action);
      }

      if (memory.observation && memory.observation.trim()) {
        addMessage('user', memory.observation);
      }

      if (memory.content && memory.content.trim()) {
        addMessage('assistant', memory.content);
      }
    });

    return messages;
  }

  async buildPromptRequest(
    event: SSEvent,
    options: PromptRequestBuilderOptions
  ): Promise<PromptRequest> {
    const location = this.repositoryService.location.getLocation({
      id: event.environment.location_id,
    });

    const dateTime = formatDateTime(event.environment);

    let formattedAction;
    if (options.action) {
      formattedAction = formatAction(
        options.action,
        event.sentient_sims,
        location,
        options.sexCategoryType,
        options.sexLocationType
      );
    }

    let formattedAssistantPreResponse = '';
    if (options.assistantPreResponse) {
      formattedAssistantPreResponse = formatAction(
        options.assistantPreResponse,
        event.sentient_sims,
        location,
        options.sexCategoryType,
        options.sexLocationType
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
        options.sexLocationType
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
          options.sexLocationType
        )
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
        options.sexLocationType
      );
      log.debug(`preAssistantPreResponse: ${formattedPreAssistantPreResponse}`);
    }

    const systemPrompt = getSystemPrompt(event.event_type, options.apiType);
    const formattedSystemPrompt = formatAction(
      systemPrompt,
      event.sentient_sims,
      location,
      options.sexCategoryType,
      options.sexLocationType
    );

    const simsPromise = this.formatSims(
      event.sentient_sims,
      location,
      event.relationships
    );
    const memories = this.getMemories(event.sentient_sims);
    const groupedMemories = this.groupMemories(memories);
    const sims = await simsPromise;

    return {
      systemPrompt: formattedSystemPrompt,
      participants: sims.join('\n'),
      location: location.description,
      dateTime,
      memories: groupedMemories,
      action: formattedAction,
      maxResponseTokens: 90,
      maxTokens: options.modelSettings.max_tokens,
      assistantPreResponse: formattedAssistantPreResponse,
      prePreAction: formattedPrePreAction,
      preAssistantPreResponse: formattedPreAssistantPreResponse,
      stopTokens: formattedStopTokens,
      continue: options.continue,
    };
  }
}
