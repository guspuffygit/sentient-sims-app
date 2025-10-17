import log from 'electron-log';
import {
  ChatContinueInteractionEvent,
  ChatInteractionEvent,
  ContinueInteractionEvent,
  DoSomethingInteractionEvent,
  InteractionEvent,
  InteractionEvents,
  InteractionMappingEvent,
  SSEventType,
  WWEventType,
  WWInteractionEvent,
  WantsInteractionEvent,
} from '../models/InteractionEvents';
import { getRandomItem } from '../util/getRandomItem';
import { InteractionEventResult, InteractionEventStatus } from '../models/InteractionEventResult';
import { notifyMapAnimation, notifyMapInteraction, playTTS, sendChatGeneration } from '../util/notifyRenderer';
import { GenerationOptions, PromptRequestBuilderOptions } from './PromptRequestBuilderService';
import { containsPlayerSim } from '../util/eventContainsPlayerSim';
import { ApiType } from '../models/ApiType';
import { defaultClassificationPrompt, defaultWantsPrefixes, defaultWantsPrompt } from '../constants';
import {
  BuffEventRequest,
  BuffDescriptionRequest,
  ClassificationRequest,
  OneShotRequest,
  OpenAIRequestBuilder,
} from '../models/OpenAIRequestBuilder';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { cleanAIClassificationOutput, cleanupAIOutput } from '../formatter/PromptFormatter';
import { MemoryEntity } from '../db/entities/MemoryEntity';
import { InputFormatter } from '../formatter/InputOutputFormatting';
import { MythoMaxFormatter } from '../formatter/MythoMaxFormatter';
import { NovelAIFormatter } from '../formatter/NovelAIFormatter';
import { AIModel } from '../models/AIModel';
import { DefaultFormatter } from '../formatter/DefaultFormatter';
import { InteractionDescription } from '../descriptions/interactionDescriptions';
import { PromptHistoryMode } from '../models/PromptHistoryMode';
import { sendModNotification } from '../websocketServer';
import { ModAddBuff, ModWebsocketMessageType } from '../models/ModWebsocketMessage';
import { ApiContext } from './ApiContext';

function getInputFormatters(apiType: ApiType): InputFormatter[] {
  if (apiType === ApiType.CustomAI || apiType === ApiType.KoboldAI) {
    return [new MythoMaxFormatter()];
  }

  if (apiType === ApiType.NovelAI) {
    return [new NovelAIFormatter()];
  }

  return [new DefaultFormatter()];
}

export class AIService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  async generate(promptRequest: OpenAICompatibleRequest) {
    return this.ctx.genai.sentientSimsGenerate(promptRequest);
  }

  async interactionEvent(event: InteractionEvents): Promise<InteractionEventResult> {
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
        return this.handleContinue(event as ContinueInteractionEvent);
      case SSEventType.INTERACTION_MAPPING:
        return this.handleInteractionMapping(event as InteractionMappingEvent);
      default:
        return { status: InteractionEventStatus.NOOP };
    }
  }

  async handleInteraction(event: InteractionEvent) {
    let description: InteractionDescription | undefined;
    if (event.testing_action) {
      description = {
        pre_actions: [event.testing_action],
      };
    } else {
      description = await this.ctx.interactions.getInteractionDescription(event.interaction_name);
    }

    if (description?.ignored === true) {
      return { status: InteractionEventStatus.IGNORED };
    }

    const hasPlayerSim = containsPlayerSim(event);
    if (!hasPlayerSim && !description?.always_run) {
      return { status: InteractionEventStatus.NOT_PLAYER_SIM };
    }

    if (!description) {
      return { status: InteractionEventStatus.UNMAPPED_INTERACTION };
    }

    if (description?.pre_actions) {
      const action = getRandomItem(description.pre_actions);
      return this.runGeneration(event, {
        action,
        prePreAction: 'At {location} ({location_type}), ',
      });
    }

    return { status: InteractionEventStatus.NOOP };
  }

  async handleContinue(event: ContinueInteractionEvent) {
    let result = await this.runGeneration(event, { continue: true });
    if (!result.text) {
      result = await this.runGeneration(event, {
        continue: true,
        preAssistantPreResponse: ' ',
      });
    }
    return result;
  }

  async handleWants(event: WantsInteractionEvent) {
    const randomAction = defaultWantsPrefixes[Math.floor(Math.random() * defaultWantsPrefixes.length)];
    return this.runGeneration(event, {
      action: defaultWantsPrompt,
      preAssistantPreResponse: `{actor.0}:`,
      assistantPreResponse: randomAction,
      promptHistoryMode: PromptHistoryMode.NO_USER_HISTORY,
    });
  }

  async handleWickedWhims(event: WWInteractionEvent) {
    if (!this.ctx.animations.isNsfwEnabled()) {
      return { status: InteractionEventStatus.NSFW_DISABLED };
    }

    if (!containsPlayerSim(event)) {
      return { status: InteractionEventStatus.NOOP };
    }

    let action;

    const animation = await this.ctx.animations.getAnimation(event.animation_author, event.animation_identifier);

    if (event.ww_event_type === WWEventType.ASKING) {
      action = '{actor.0} is asking {actor.1} if they want to go have sex';
    } else if (event.ww_event_type === WWEventType.STARTING) {
      action = "{actor.0} is taking {actor.1}'s hand and leading them to start {sex_category} {sex_location}.";
      if (event.sentient_sims.length === 1) {
        action = '{actor.0} is walking to start {sex_category} {sex_location}.';
      }
    } else if (event.ww_event_type === WWEventType.ACTIVE) {
      if (event.testing_action) {
        action = event.testing_action;
      } else if (animation) {
        action = animation.act;
      } else if (this.ctx.animations.isAnimationMappingEnabled()) {
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
      prePreAction: 'At {location} ({location_type}), ',
      sexCategoryType: event.sex_category,
      sexLocationType: event.sex_location,
    });
  }

  async handleDoSomething(doSomethingEvent: DoSomethingInteractionEvent) {
    return this.runGeneration(doSomethingEvent, {
      action: doSomethingEvent.action,
      prePreAction: 'At {location} ({location_type}), ',
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

  async runGeneration(event: InteractionEvents, options: GenerationOptions = {}): Promise<InteractionEventResult> {
    const promptOptions: PromptRequestBuilderOptions = {
      action: options.action,
      sexCategoryType: options.sexCategoryType,
      sexLocationType: options.sexLocationType,
      preAssistantPreResponse: options.preAssistantPreResponse,
      assistantPreResponse: options.assistantPreResponse,
      prePreAction: options.prePreAction,
      stopTokens: options.stopTokens,
      apiType: this.ctx.settings.aiApiType,
      modelSettings: this.ctx.modelSettings,
      continue: options.continue,
      promptHistoryMode: options.promptHistoryMode,
    };

    let promptRequest = await this.ctx.promptBuilder.buildPromptRequest(event, promptOptions);

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

    const openAIRequestBuilder = new OpenAIRequestBuilder(this.ctx.tokenCounter);
    const openAIRequest = openAIRequestBuilder.buildOpenAIRequest(promptRequest);

    const response = await this.ctx.genai.sentientSimsGenerate(openAIRequest);

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

    // Remove preAssistantPreResponse from output
    if (promptRequest.preAssistantPreResponse && output.startsWith(promptRequest.preAssistantPreResponse.trim())) {
      output = output.substring(promptRequest.preAssistantPreResponse.trim().length).trim();
    }

    if (promptRequest.assistantPreResponse && !output.startsWith(promptRequest.assistantPreResponse)) {
      output = [promptRequest.assistantPreResponse, output].join(' ').trim();
    }

    const lastMessage = openAIRequest.messages[openAIRequest.messages.length - 1];

    if (lastMessage.role === 'assistant' && output.startsWith(lastMessage.content)) {
      output = output.replace(lastMessage.content, '').trim();
    }

    output = output.trim();

    if (output.length > 1) {
      newMemory.content = output;

      this.playTts(output);

      return {
        status: InteractionEventStatus.GENERATED,
        text: output,
        request: response.request,
        memory: newMemory,
      };
    }

    log.error(`There wasn't any output from the AI`);
    return {
      status: InteractionEventStatus.NOOP,
      request: response.request,
    };
  }

  async runClassification(classificationRequest: ClassificationRequest): Promise<InteractionEventResult> {
    const apiType: ApiType = this.ctx.settings.aiApiType;

    const systemPrompt = defaultClassificationPrompt.replaceAll(
      '{classifiers}',
      classificationRequest.classifiers.join(', '),
    );

    let oneShotRequest: OneShotRequest = {
      systemPrompt,
      messages: classificationRequest.messages,
      maxResponseTokens: 15,
      maxTokens: 3900,
      guidedChoice: classificationRequest.classifiers,
    };

    getInputFormatters(apiType).forEach((formatter) => {
      oneShotRequest = formatter.formatOneShotRequest(oneShotRequest);
    });

    const openAIRequestBuilder = new OpenAIRequestBuilder(this.ctx.tokenCounter);
    const openAIRequest = openAIRequestBuilder.buildOneShotOpenAIRequest(oneShotRequest);

    const response = await this.ctx.genai.sentientSimsGenerate(openAIRequest);

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

  async runBuff(event: BuffEventRequest) {
    const classificationResult = await this.runClassification({
      name: event.name,
      classifiers: event.classifiers,
      messages: event.messages,
    });

    if (classificationResult.status !== InteractionEventStatus.CLASSIFIED || !classificationResult.text) {
      return;
    }

    sendChatGeneration(classificationResult);

    const buffDescriptionResult = await this.runBuffDescription({
      name: event.name,
      mood: classificationResult.text,
      messages: event.messages,
    });

    if (buffDescriptionResult.status !== InteractionEventStatus.GENERATED || !buffDescriptionResult.text) {
      return;
    }

    sendChatGeneration(buffDescriptionResult);

    const modAddBuff: ModAddBuff = {
      type: ModWebsocketMessageType.ADD_BUFF,
      sim_id: event.sim_id,
      mood: classificationResult.text,
      buff_description: buffDescriptionResult.text,
    };

    sendModNotification(modAddBuff);
  }

  async runBuffDescription(buffRequest: BuffDescriptionRequest): Promise<InteractionEventResult> {
    const apiType: ApiType = this.ctx.settings.aiApiType;

    const systemPrompt = `\
You will write a game buff description that will be displayed about the character ${buffRequest.name}.
${buffRequest.name} has just completed chatting and is feeling ${buffRequest.mood} from the conversation.
Use the details of the conversation to craft the buff description to tell why ${buffRequest.name} is feeling ${buffRequest.mood}.
Return only the description text itself without any commentary or formatting without breaking the 4th wall.
Write me a buff description based on the conversation so that ${buffRequest.name} knows why they have received the "${buffRequest.mood}" buff based on this conversation:\n
`;

    let oneShotRequest: OneShotRequest = {
      systemPrompt:
        'Response to the request without extra commentary or formatting, only return the answer to the request.',
      messages: buffRequest.messages,
      userPreResponse: systemPrompt,
      assistantPreResponse: `Buff Title: ${buffRequest.mood}\nBuff Description: ${buffRequest.name} is feeling ${buffRequest.mood} because`,
      maxResponseTokens: 90,
      maxTokens: 3900,
    };

    getInputFormatters(apiType).forEach((formatter) => {
      oneShotRequest = formatter.formatOneShotRequest(oneShotRequest);
    });

    const openAIRequestBuilder = new OpenAIRequestBuilder(this.ctx.tokenCounter);
    const openAIRequest = openAIRequestBuilder.buildOneShotOpenAIRequest(oneShotRequest);

    const response = await this.ctx.genai.sentientSimsGenerate(openAIRequest);

    const output = `${buffRequest.name} is feeling ${buffRequest.mood} because ${cleanupAIOutput(response.text)}`;

    return {
      status: InteractionEventStatus.GENERATED,
      text: output,
      request: response.request,
    };
  }

  async getModels(): Promise<AIModel[]> {
    return this.ctx.genai.getModels();
  }

  async handleInteractionMapping(event: InteractionMappingEvent) {
    if (event.status === InteractionEventStatus.IGNORED) {
      log.debug(`Interaction mapped to ignored: ${event.interaction_name}`);
      await this.ctx.interactions.updateUnmappedInteraction({
        name: event.interaction_name,
        event,
        ignored: true,
      });
      return { status: InteractionEventStatus.IGNORED };
    }

    if (event.status === InteractionEventStatus.UNMAPPED_INTERACTION) {
      log.debug(`Unmapped interaction will be mapped: ${event.interaction_name}`);
      if (event.sentient_sims.length <= 2) {
        notifyMapInteraction(event);
        return { status: InteractionEventStatus.MAPPING_INTERACTION };
      }
      log.debug(
        `Interaction ${event.interaction_name} has more than 2 sims: ${event.sentient_sims.length}, mapping isnt supported yet for more than 2.`,
      );
    }

    log.debug(`NOOP interaction mapping: ${event.interaction_name}`);
    return { status: InteractionEventStatus.NOOP };
  }

  playTts(text: string) {
    playTTS(text);
  }
}
