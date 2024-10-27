import log from 'electron-log';
import {
  ChatContinueInteractionEvent,
  ChatInteractionEvent,
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
import { defaultClassificationPrompt, defaultWantsPrompt } from '../constants';
import { SettingsService } from './SettingsService';
import {
  getGenerationService,
  getModelSettings,
  getTokenCounter,
} from '../factories/generationServiceFactory';
import {
  BuffRequest,
  ClassificationRequest,
  OneShotRequest,
  OpenAIRequestBuilder,
} from '../models/OpenAIRequestBuilder';
import { SettingsEnum } from '../models/SettingsEnum';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import {
  cleanAIClassificationOutput,
  cleanupAIOutput,
} from '../formatter/PromptFormatter';
import { MemoryEntity } from '../db/entities/MemoryEntity';
import { InteractionService } from './InteractionService';
import { InputFormatter } from '../formatter/InputOutputFormatting';
import { MythoMaxFormatter } from '../formatter/MythoMaxFormatter';
import { NovelAIFormatter } from '../formatter/NovelAIFormatter';
import { getBuffSystemPrompt } from '../systemPrompts';
import { AIModel } from '../models/AIModel';

function getInputFormatters(apiType: ApiType): InputFormatter[] {
  const inputFormatters: InputFormatter[] = [];

  if (apiType === ApiType.CustomAI || apiType === ApiType.KoboldAI) {
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
      case SSEventType.CHAT:
        return this.handleChat(event as ChatInteractionEvent);
      case SSEventType.CHAT_CONTINUE:
        return this.handleChatContinue(event as ChatContinueInteractionEvent);
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

  async handleChat(chatEvent: ChatInteractionEvent) {
    return this.runGeneration(chatEvent, {
      action: chatEvent.action,
      prePreAction: '{actor.0}:',
      preAssistantPreResponse: '{actor.1}:',
      stopTokens: ['{actor.0}:', '{actor.1}:'],
    });
  }

  async handleChatContinue(chatContinueEvent: ChatContinueInteractionEvent) {
    return this.runGeneration(chatContinueEvent, {
      preAssistantPreResponse: '{actor.1}:',
      stopTokens: ['{actor.0}:', '{actor.1}:'],
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
      preAssistantPreResponse: options.preAssistantPreResponse,
      prePreAction: options.prePreAction,
      stopTokens: options.stopTokens,
      apiType: this.settingsService.get(SettingsEnum.AI_API_TYPE) as ApiType,
      modelSettings: getModelSettings(this.settingsService),
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
      promptOptions.apiType === ApiType.CustomAI ||
      promptOptions.apiType === ApiType.KoboldAI
    ) {
      stopTokens.push('### Input:');
      stopTokens.push('### Response:');
      stopTokens.push('### Response: (length = medium)');
    }
    promptRequest?.stopTokens?.forEach((stopToken) => {
      stopTokens.push(stopToken);
    });

    log.debug(`stop tokens: ${JSON.stringify(stopTokens, null, 2)}`);

    // TODO: Add an options for formatted stop tokens that aren't necessarily in the prompt

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

  async runClassification(
    classificationRequest: ClassificationRequest
  ): Promise<InteractionEventResult> {
    const generationService = getGenerationService(this.settingsService);
    const tokenCounter = getTokenCounter(this.settingsService);

    const apiType: ApiType = this.settingsService.get(
      SettingsEnum.AI_API_TYPE
    ) as ApiType;

    const systemPrompt = defaultClassificationPrompt.replaceAll(
      '{classifiers}',
      classificationRequest.classifiers.join(', ')
    );

    let oneShotRequest: OneShotRequest = {
      systemPrompt,
      messages: classificationRequest.messages,
      maxResponseTokens: 15,
      maxTokens: 3900,
      guidedChoice: classificationRequest.classifiers,
    };

    getInputFormatters(apiType).forEach((formatter) => {
      // eslint-disable-next-line no-param-reassign
      oneShotRequest = formatter.formatOneShotRequest(oneShotRequest);
    });

    const openAIRequestBuilder = new OpenAIRequestBuilder(tokenCounter);
    const openAIRequest =
      openAIRequestBuilder.buildOneShotOpenAIRequest(oneShotRequest);

    const response = await generationService.sentientSimsGenerate(
      openAIRequest
    );

    const output = cleanAIClassificationOutput(response.text);

    let status: InteractionEventStatus = InteractionEventStatus.UNCLASSIFIED;

    if (classificationRequest.classifiers.includes(output.toLowerCase())) {
      status = InteractionEventStatus.CLASSIFIED;
    }

    return {
      status,
      text: output,
      request: response.request,
    };
  }

  async runBuff(buffRequest: BuffRequest): Promise<InteractionEventResult> {
    const generationService = getGenerationService(this.settingsService);
    const tokenCounter = getTokenCounter(this.settingsService);

    const apiType: ApiType = this.settingsService.get(
      SettingsEnum.AI_API_TYPE
    ) as ApiType;

    const systemPrompt = getBuffSystemPrompt(apiType)
      .replaceAll('{mood}', buffRequest.mood)
      .replaceAll('{name}', buffRequest.name);

    let oneShotRequest: OneShotRequest = {
      systemPrompt,
      messages: buffRequest.messages,
      maxResponseTokens: 90,
      maxTokens: 3900,
    };

    getInputFormatters(apiType).forEach((formatter) => {
      // eslint-disable-next-line no-param-reassign
      oneShotRequest = formatter.formatOneShotRequest(oneShotRequest);
    });

    const openAIRequestBuilder = new OpenAIRequestBuilder(tokenCounter);
    const openAIRequest =
      openAIRequestBuilder.buildOneShotOpenAIRequest(oneShotRequest);

    const response = await generationService.sentientSimsGenerate(
      openAIRequest
    );

    const output = cleanupAIOutput(response.text);

    return {
      status: InteractionEventStatus.GENERATED,
      text: output,
      request: response.request,
    };
  }

  async getModels(): Promise<AIModel[]> {
    const generationService = getGenerationService(this.settingsService);

    return generationService.getModels();
  }
}
