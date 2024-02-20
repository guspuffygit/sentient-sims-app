import {
  DoSomethingInteractionEvent,
  InteractionEvent,
  InteractionEvents,
  SSEventType,
  WWEventType,
  WWInteractionEvent,
  WantsInteractionEvent,
} from '../models/InteractionEvents';
import { AnimationsService } from './AnimationsService';
import { getRandomItem } from '../util/getRandomItem';
import {
  InteractionEventResult,
  InteractionEventStatus,
} from '../models/InteractionEventResult';
import { notifyMapAnimation } from '../util/notifyRenderer';
import {
  GenerationOptions,
  PromptRequestBuilderOptions,
  PromptRequestBuilderService,
} from './PromptRequestBuilderService';
import { containsPlayerSim } from '../util/eventContainsPlayerSim';
import { ApiType } from '../models/ApiType';
import { defaultWantsPrompt } from '../constants';
import { SettingsService } from './SettingsService';
import {
  getGenerationService,
  getTokenCounter,
} from '../factories/generationServiceFactory';
import { OpenAIRequestBuilder } from '../models/OpenAIRequestBuilder';
import { SettingsEnum } from '../models/SettingsEnum';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { cleanupAIOutput } from '../formatter/PromptFormatter';
import { MemoryEntity } from '../db/entities/MemoryEntity';
import { InteractionService } from './InteractionService';
import { InputFormatter } from '../formatter/InputOutputFormatting';
import { MythoMaxFormatter } from '../formatter/MythoMaxFormatter';
import { NovelAIFormatter } from '../formatter/NovelAIFormatter';

function getInputFormatters(apiType: ApiType): InputFormatter[] {
  const inputFormatters: InputFormatter[] = [];

  if (apiType === ApiType.CustomAI || apiType === ApiType.SentientSimsAI) {
    inputFormatters.push(new MythoMaxFormatter());
  }

  if (apiType === ApiType.NovelAI) {
    inputFormatters.push(new NovelAIFormatter());
  }

  return inputFormatters;
}

export class AIService {
  private readonly settingsService: SettingsService;

  private readonly promptRequestBuilderService: PromptRequestBuilderService;

  private readonly animationsService: AnimationsService;

  private readonly interactionService: InteractionService;

  constructor(
    settingsService: SettingsService,
    promptRequestBuilderService: PromptRequestBuilderService,
    animationsService: AnimationsService,
    interactionService: InteractionService
  ) {
    this.settingsService = settingsService;
    this.promptRequestBuilderService = promptRequestBuilderService;
    this.animationsService = animationsService;
    this.interactionService = interactionService;
  }

  async generate(promptRequest: OpenAICompatibleRequest) {
    const generationService = getGenerationService(this.settingsService);
    return generationService.sentientSimsGenerate(promptRequest);
  }

  async interactionEvent(
    event: InteractionEvents
  ): Promise<InteractionEventResult> {
    switch (event.event_type) {
      case SSEventType.DO_SOMETHING:
        return this.handleDoSomething(event as DoSomethingInteractionEvent);
      case SSEventType.INTERACTION:
        return this.handleInteraction(event as InteractionEvent);
      case SSEventType.WICKED_WHIMS:
        return this.handleWickedWhims(event as WWInteractionEvent);
      case SSEventType.WANTS:
        return this.handleWants(event as WantsInteractionEvent);
      case SSEventType.CONTINUE:
        return this.runGeneration(event);
      default:
        return { status: InteractionEventStatus.NOOP };
    }
  }

  async handleInteraction(event: InteractionEvent) {
    const description = this.interactionService.getInteractionDescription(
      event.interaction_name
    );

    if (!description) {
      this.interactionService.updateUnmappedInteraction({
        name: event.interaction_name,
        event,
      });
      return { status: InteractionEventStatus.UNMAPPED_INTERACTION };
    }

    if (description?.ignored === true) {
      return { status: InteractionEventStatus.IGNORED };
    }

    const hasPlayerSim = containsPlayerSim(event);
    if (!hasPlayerSim && !description?.always_run) {
      return { status: InteractionEventStatus.NOT_PLAYER_SIM };
    }

    if (description?.pre_actions) {
      const action = getRandomItem(description.pre_actions);
      return this.runGeneration(event, {
        action,
      });
    }

    return { status: InteractionEventStatus.NOOP };
  }

  async handleWants(event: WantsInteractionEvent) {
    return this.runGeneration(event, {
      action: defaultWantsPrompt,
      assistantPreResponse: 'I want to',
    });
  }

  async handleWickedWhims(event: WWInteractionEvent) {
    if (!this.animationsService.isNsfwEnabled()) {
      return { status: InteractionEventStatus.NSFW_DISABLED };
    }

    if (!containsPlayerSim(event)) {
      return { status: InteractionEventStatus.NOOP };
    }

    let action;

    const animation = await this.animationsService.getAnimation(
      event.animation_author,
      event.animation_identifier
    );

    if (event.ww_event_type === WWEventType.ASKING) {
      action = '{actor.0} is asking {actor.1} if they want to go have sex';
    } else if (event.ww_event_type === WWEventType.STARTING) {
      action =
        "{actor.0} is taking {actor.1}'s hand and leading them to start {sex_category} {sex_location}.";
      if (event.sentient_sims.length === 1) {
        action = '{actor.0} is walking to start {sex_category} {sex_location}.';
      }
    } else if (event.ww_event_type === WWEventType.ACTIVE) {
      if (event.testing_action) {
        action = event.testing_action;
      } else if (animation) {
        action = animation.act;
      } else if (this.animationsService.isAnimationMappingEnabled()) {
        return { status: InteractionEventStatus.UNMAPPED_ANIMATION };
      } else {
        return { status: InteractionEventStatus.NOOP };
      }
    } else if (event.ww_event_type === WWEventType.MAPPING) {
      if (animation?.act) {
        event.animation_name = animation.name;
        event.testing_action = animation.act;
      }
      notifyMapAnimation(event);
      return { status: InteractionEventStatus.MAPPING_ANIMATION };
    } else {
      throw Error(`Unknown WWEventType: ${event.ww_event_type}`);
    }

    return this.runGeneration(event, {
      action,
      sexCategoryType: event.sex_category,
      sexLocationType: event.sex_location,
    });
  }

  async handleDoSomething(doSomethingEvent: DoSomethingInteractionEvent) {
    return this.runGeneration(doSomethingEvent, {
      action: doSomethingEvent.action,
    });
  }

  async runGeneration(
    event: InteractionEvents,
    options: GenerationOptions = {}
  ): Promise<InteractionEventResult> {
    const generationService = getGenerationService(this.settingsService);
    const tokenCounter = getTokenCounter(this.settingsService);

    const promptOptions: PromptRequestBuilderOptions = {
      action: options.action,
      sexCategoryType: options.sexCategoryType,
      sexLocationType: options.sexLocationType,
      apiType: this.settingsService.get(SettingsEnum.AI_API_TYPE) as ApiType,
    };

    let promptRequest =
      await this.promptRequestBuilderService.buildPromptRequest(
        event,
        promptOptions
      );

    // save memory before any model specific formatting
    const newMemory: MemoryEntity = {
      location_id: event.environment.location_id,
    };
    if (promptRequest.action) {
      newMemory.pre_action = promptRequest.action;
    }

    getInputFormatters(promptOptions.apiType).forEach((formatter) => {
      promptRequest = formatter.formatInput(promptRequest);
    });

    const openAIRequestBuilder = new OpenAIRequestBuilder(tokenCounter);
    const openAIRequest =
      openAIRequestBuilder.buildOpenAIRequest(promptRequest);

    const response = await generationService.sentientSimsGenerate(
      openAIRequest
    );

    const stopTokens = [];
    // TODO: model specific OUTPUT formatting cleanup stop tokens
    if (
      promptOptions.apiType === ApiType.SentientSimsAI ||
      promptOptions.apiType === ApiType.CustomAI
    ) {
      stopTokens.push('### Input:');
      stopTokens.push('### Response:');
      stopTokens.push('### Response: (length = medium)');
    }

    let output = cleanupAIOutput(response.text, stopTokens);

    // always append pre response to response
    if (options.assistantPreResponse) {
      output = `${options.assistantPreResponse.trim()} ${output.trim()}`;
    }

    newMemory.content = output;

    return {
      status: InteractionEventStatus.GENERATED,
      text: output,
      request: response.request,
      memory: newMemory,
    };
  }
}
