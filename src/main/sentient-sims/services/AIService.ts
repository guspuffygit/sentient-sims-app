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
import { InteractionEventResult, InteractionEventStatus, LLMExchange } from '../models/InteractionEventResult';
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
import { DirectedSceneRequest } from '../models/DirectedSceneRequest';
import { SentientSim } from '../models/SentientSim';
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
import { AIActionType, actionTypeForEvent } from '../models/AIActionType';

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
    const providerConfig = this.ctx.providerConfigs.getConfigForAction(AIActionType.GENERATE);
    return this.ctx.getGenerationService(providerConfig.apiType).sentientSimsGenerate({
      ...promptRequest,
      model: promptRequest.model ?? providerConfig.model,
      apiType: promptRequest.apiType ?? providerConfig.apiType,
    });
  }

  async interactionEvent(event: InteractionEvents): Promise<InteractionEventResult> {
    switch (event.event_type) {
      case SSEventType.DO_SOMETHING:
        return this.handleDoSomething(event as DoSomethingInteractionEvent);
      case SSEventType.CHAT:
        return this.handleChat(event as ChatInteractionEvent);
      case SSEventType.CHAT_CONTINUE:
        return this.handleChatContinue(event);
      case SSEventType.INTERACTION:
        return this.handleInteraction(event as InteractionEvent);
      case SSEventType.WICKED_WHIMS:
        return this.handleWickedWhims(event as WWInteractionEvent);
      case SSEventType.WANTS:
        return this.handleWants(event);
      case SSEventType.CONTINUE:
        return this.handleContinue(event);
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

    if (description.pre_actions) {
      const preAction = getRandomItem(description.pre_actions);
      return this.runGeneration(event, {
        preAction,
        prePreAction: 'At {location} ({location_type}), {postures},',
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
      preAction: defaultWantsPrompt,
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

    let preAction;

    const animation = await this.ctx.animations.getAnimation(event.animation_author, event.animation_identifier);

    if (event.ww_event_type === WWEventType.ASKING) {
      preAction = '{actor.0} is asking {actor.1} if they want to go have sex';
    } else if (event.ww_event_type === WWEventType.STARTING) {
      preAction = "{actor.0} is taking {actor.1}'s hand and leading them to start {sex_category} {sex_location}.";
      if (event.sentient_sims.length === 1) {
        preAction = '{actor.0} is walking to start {sex_category} {sex_location}.';
      }
    } else if (event.ww_event_type === WWEventType.ACTIVE) {
      if (event.testing_action) {
        preAction = event.testing_action;
      } else if (animation) {
        preAction = animation.act;
      } else if (this.ctx.animations.isAnimationMappingEnabled()) {
        return { status: InteractionEventStatus.UNMAPPED_ANIMATION };
      } else {
        return { status: InteractionEventStatus.NOOP };
      }
    } else {
      if (animation?.act) {
        event.animation_name = animation.name;
        event.testing_action = animation.act;
      }
      notifyMapAnimation(event);
      return { status: InteractionEventStatus.MAPPING_ANIMATION };
    }

    return this.runGeneration(event, {
      preAction,
      prePreAction: 'At {location} ({location_type}), {postures},',
      sexCategoryType: event.sex_category,
      sexLocationType: event.sex_location,
    });
  }

  async handleDoSomething(doSomethingEvent: DoSomethingInteractionEvent) {
    return this.runGeneration(doSomethingEvent, {
      action: doSomethingEvent.action,
      prePreAction: 'At {location} ({location_type}), {postures},',
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
    const providerConfig = this.ctx.providerConfigs.getConfigForAction(actionTypeForEvent(event.event_type));
    log.debug(
      `Using provider config for ${event.event_type}: ${providerConfig.name} (${providerConfig.apiType}${providerConfig.model ? `, ${providerConfig.model}` : ''})`,
    );

    const promptOptions: PromptRequestBuilderOptions = {
      action: options.action,
      sexCategoryType: options.sexCategoryType,
      sexLocationType: options.sexLocationType,
      preAssistantPreResponse: options.preAssistantPreResponse,
      assistantPreResponse: options.assistantPreResponse,
      preAction: options.preAction,
      prePreAction: options.prePreAction,
      stopTokens: options.stopTokens,
      apiType: providerConfig.apiType,
      modelSettings: await this.ctx.modelSettings.getModelSettings(providerConfig.model, providerConfig.apiType),
      continue: options.continue,
      promptHistoryMode: options.promptHistoryMode,
    };

    let promptRequest = this.ctx.promptBuilder.buildPromptRequest(event, promptOptions);

    // save memory before any model specific formatting
    const newMemory: MemoryEntity = {
      location_id: event.environment.location_id,
      event_type: event.event_type,
    };
    if (promptRequest.preAction) {
      newMemory.pre_action = promptRequest.preAction;
    }
    if (promptRequest.action) {
      newMemory.action = promptRequest.action;
    }

    if ('interaction_name' in event) {
      newMemory.interaction_name = event.interaction_name;
    } else if ('animation_name' in event) {
      newMemory.interaction_name = event.animation_name;
    }

    getInputFormatters(promptOptions.apiType).forEach((formatter) => {
      promptRequest = formatter.formatInput(promptRequest);
    });

    const openAIRequestBuilder = new OpenAIRequestBuilder(this.ctx.getTokenCounter(providerConfig.apiType));
    const openAIRequest = openAIRequestBuilder.buildOpenAIRequest(promptRequest);
    openAIRequest.model = providerConfig.model;
    openAIRequest.apiType = providerConfig.apiType;

    const response = await this.ctx.getGenerationService(providerConfig.apiType).sentientSimsGenerate(openAIRequest);

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
    promptRequest.stopTokens?.forEach((stopToken) => {
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
      const rawSceneText = output;
      const directorReview = await this.runDirectorReview(rawSceneText);
      output = directorReview.text;
      newMemory.content = output;

      this.playTts(output, event.sentient_sims);

      const exchanges: LLMExchange[] = [
        { label: 'Scene Generation', request: openAIRequest, responseText: rawSceneText },
        { label: 'Director Review', request: directorReview.request, responseText: directorReview.text },
      ];

      return {
        status: InteractionEventStatus.GENERATED,
        text: output,
        request: response.request,
        exchanges,
        memory: newMemory,
      };
    }

    log.error(`There wasn't any output from the AI`);
    return {
      status: InteractionEventStatus.NOOP,
      request: response.request,
    };
  }

  async runDirectorReview(text: string): Promise<{ text: string; request: OpenAICompatibleRequest }> {
    const providerConfig = this.ctx.providerConfigs.getDefaultConfig();
    const apiType: ApiType = providerConfig.apiType;


    const systemPrompt = `You are a director reviewing a short generated scene from The Sims. Fix any issues and return only the corrected text — no commentary, no labels, no extra formatting.

Fix these issues if present:
- Remove invented physical actions, props, furniture, or locations not already established in the scene
- Remove references to invented shared history or past events ("that time we...", "remember when...", specific past anecdotes)
- Remove overly cinematic, melodramatic, or poetic language — keep it grounded and everyday
- Replace physical action beats with delivery notes (how a character sounds or feels) if applicable, or remove them entirely and leave pure dialogue
- Remove trailing incomplete sentences
If the scene is already good, return it unchanged.`;

    let oneShotRequest: OneShotRequest = {
      systemPrompt,
      messages: [text],
      maxResponseTokens: 300,
      maxTokens: 3900,
    };

    getInputFormatters(apiType).forEach((formatter) => {
      oneShotRequest = formatter.formatOneShotRequest(oneShotRequest);
    });

    const openAIRequestBuilder = new OpenAIRequestBuilder(this.ctx.getTokenCounter(apiType));
    const openAIRequest = openAIRequestBuilder.buildOneShotOpenAIRequest(oneShotRequest);
    openAIRequest.model = providerConfig.model;
    openAIRequest.apiType = apiType;

    const response = await this.ctx.getGenerationService(apiType).sentientSimsGenerate(openAIRequest);
    const reviewed = cleanupAIOutput(response.text);
    return { text: reviewed.length > 1 ? reviewed : text, request: openAIRequest };
  }

  private async runOneShot(
    label: string,
    systemPrompt: string,
    userText: string,
    maxResponseTokens: number,
    model?: string,
  ): Promise<{ exchange: LLMExchange; text: string }> {
    let oneShotRequest: OneShotRequest = {
      systemPrompt,
      messages: [userText],
      maxResponseTokens,
      maxTokens: 3900,
    };

    getInputFormatters(this.ctx.settings.aiApiType).forEach((formatter) => {
      oneShotRequest = formatter.formatOneShotRequest(oneShotRequest);
    });

    const openAIRequestBuilder = new OpenAIRequestBuilder(this.ctx.tokenCounter);
    const openAIRequest = openAIRequestBuilder.buildOneShotOpenAIRequest(oneShotRequest);
    if (model) {
      openAIRequest.model = model;
    }
    const response = await this.ctx.genai.sentientSimsGenerate(openAIRequest);
    return { exchange: { label, request: openAIRequest, responseText: response.text }, text: response.text };
  }

  async runDirectedScene(request: DirectedSceneRequest): Promise<InteractionEventResult> {
    const { event } = request;
    const action = event.testing_action;
    if (!action || event.sentient_sims.length < 2) {
      log.error('Directed scene requires a testing_action and at least two sims');
      return { status: InteractionEventStatus.NOOP };
    }

    const promptOptions: PromptRequestBuilderOptions = {
      action,
      apiType: this.ctx.settings.aiApiType,
      modelSettings: await this.ctx.modelSettings.getModelSettings(),
    };
    const promptRequest = this.ctx.promptBuilder.buildPromptRequest(event, promptOptions);

    const sceneContext = [`<LOCATION>\n${promptRequest.location}\n</LOCATION>`, promptRequest.participants].join('\n');

    const previously = promptRequest.memories
      .slice(-6)
      .map((memory) => memory.content)
      .join('\n');
    const previouslyBlock = previously ? `Previously in this scene:\n${previously}\n\n` : '';
    const sceneAction = promptRequest.action ?? action;

    const simNames = event.sentient_sims.map((sim) => sim.name);
    const exchanges: LLMExchange[] = [];

    // 1. Director briefing: one short cue per actor
    const briefingSystemPrompt = `You are the director of a short scene in The Sims. Based on the scene context and characters below, write one short cue for each actor to set up their performance — tone, intent, and what their character wants in this moment. Do not write any dialogue.

${sceneContext}

Respond in exactly this format, one line per actor, nothing else:
${simNames.map((name) => `CUE ${name}: <one or two sentences of direction>`).join('\n')}`;

    const briefing = await this.runOneShot(
      'Director Briefing',
      briefingSystemPrompt,
      `${previouslyBlock}${sceneAction}`,
      200,
      request.directorModel,
    );
    exchanges.push(briefing.exchange);

    const cues = new Map<string, string>();
    simNames.forEach((name) => {
      const cueMatch = new RegExp(`CUE\\s+${name}\\s*:\\s*([^\\n]+)`, 'i').exec(briefing.text);
      cues.set(name, cueMatch ? cueMatch[1].trim() : briefing.text.trim());
    });

    // 2. Each actor performs in order, seeing the lines delivered so far
    let linesSoFar = '';
    for (let i = 0; i < event.sentient_sims.length; i += 1) {
      const sim = event.sentient_sims[i];
      const actorSystemPrompt = `You are playing ${sim.name} in a scene from The Sims. Stay in character.

${sceneContext}

Director's cue for you: ${cues.get(sim.name)}

Respond only as ${sim.name} in screenplay format — optionally one short delivery note line (how they sound or feel, not what they physically do), then:
${sim.name}: "[what they say]"
One to two lines of dialogue. Do not write lines for any other character. Do not invent physical actions, props, or furniture.`;

      const actorUserText = `${previouslyBlock}${sceneAction}${linesSoFar ? `\n\n${linesSoFar}` : ''}`;
      const performance = await this.runOneShot(
        `Actor: ${sim.name}`,
        actorSystemPrompt,
        actorUserText,
        150,
        request.actorModels?.[i],
      );
      exchanges.push(performance.exchange);

      const cleanedLines = cleanupAIOutput(performance.text);
      linesSoFar = linesSoFar ? `${linesSoFar}\n${cleanedLines}` : cleanedLines;
    }

    // 3. Director compiles and audits the performances into the final scene
    const compileSystemPrompt = `You are the director compiling your actors' performances into the final version of a short scene from The Sims. Merge their lines into one coherent screenplay scene and fix any issues. Return only the final scene text — no commentary, no labels.

Fix these issues if present:
- Remove invented physical actions, props, furniture, or locations not already established in the scene
- Remove references to invented shared history or past events
- Remove overly cinematic, melodramatic, or poetic language — keep it grounded and everyday
- Keep delivery notes short (how a character sounds or feels), or cut them for pure dialogue
- Remove duplicated or contradictory lines and trailing incomplete sentences
Keep the scene to two to four lines total.`;

    const compiled = await this.runOneShot(
      'Director Review',
      compileSystemPrompt,
      `${sceneAction}\n\n${linesSoFar}`,
      300,
      request.directorModel,
    );
    exchanges.push(compiled.exchange);

    const compiledText = cleanupAIOutput(compiled.text);
    const finalText = compiledText.length > 1 ? compiledText : linesSoFar;

    // Save memory so a follow-up directed scene continues the conversation
    const participants = this.ctx.participantRepository.getParticipants(
      event.sentient_sims.map((sim) => ({ id: sim.sim_id, fullName: sim.name })),
    );
    const newMemory: MemoryEntity = {
      action: sceneAction,
      content: finalText,
      location_id: event.environment.location_id,
      event_type: event.event_type,
      interaction_name: event.interaction_name,
    };
    this.ctx.memoryRepository.createMemory({ memory: newMemory, participants });

    this.playTts(finalText, event.sentient_sims);

    return {
      status: InteractionEventStatus.GENERATED,
      text: finalText,
      request: compiled.exchange.request,
      exchanges,
      memory: newMemory,
    };
  }

  async runClassification(
    classificationRequest: ClassificationRequest,
    actionType: AIActionType = AIActionType.CLASSIFICATION,
  ): Promise<InteractionEventResult> {
    const providerConfig = this.ctx.providerConfigs.getConfigForAction(actionType);
    const apiType: ApiType = providerConfig.apiType;

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

    const openAIRequestBuilder = new OpenAIRequestBuilder(this.ctx.getTokenCounter(apiType));
    const openAIRequest = openAIRequestBuilder.buildOneShotOpenAIRequest(oneShotRequest);
    openAIRequest.model = providerConfig.model;
    openAIRequest.apiType = apiType;

    const response = await this.ctx.getGenerationService(apiType).sentientSimsGenerate(openAIRequest);

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
    // The whole buff pipeline (classification + description) follows the BUFF override
    const classificationResult = await this.runClassification(
      {
        name: event.name,
        classifiers: event.classifiers,
        messages: event.messages,
      },
      AIActionType.BUFF,
    );

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
    const providerConfig = this.ctx.providerConfigs.getConfigForAction(AIActionType.BUFF);
    const apiType: ApiType = providerConfig.apiType;

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

    const openAIRequestBuilder = new OpenAIRequestBuilder(this.ctx.getTokenCounter(apiType));
    const openAIRequest = openAIRequestBuilder.buildOneShotOpenAIRequest(oneShotRequest);
    openAIRequest.model = providerConfig.model;
    openAIRequest.apiType = apiType;

    const response = await this.ctx.getGenerationService(apiType).sentientSimsGenerate(openAIRequest);

    const output = `${buffRequest.name} is feeling ${buffRequest.mood} because ${cleanupAIOutput(response.text)}`;

    return {
      status: InteractionEventStatus.GENERATED,
      text: output,
      request: response.request,
    };
  }

  async getModels(apiType?: ApiType): Promise<AIModel[]> {
    const service = apiType ? this.ctx.getGenerationService(apiType) : this.ctx.genai;
    return service.getModels();
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

  playTts(text: string, sims?: SentientSim[]) {
    playTTS(text, sims);
  }
}
