import log from 'electron-log';
import {
  ChatContinueInteractionEvent,
  ChatInteractionEvent,
  ContinueInteractionEvent,
  DoSomethingInteractionEvent,
  InteractionEvent,
  InteractionEvents,
  InteractionMappingEvent,
  SSEvent,
  SSEventType,
  WWEventType,
  WWInteractionEvent,
  WantsInteractionEvent,
} from '../models/InteractionEvents';
import { getRandomItem } from '../util/getRandomItem';
import { InteractionEventResult, InteractionEventStatus, LLMExchange } from '../models/InteractionEventResult';
import {
  notifyMapAnimation,
  notifyMapInteraction,
  playTTS,
  playTTSLines,
  sendChatGeneration,
} from '../util/notifyRenderer';
import { markScenePaced } from '../util/pacedScenes';
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
import {
  cleanAIClassificationOutput,
  cleanupAIOutput,
  DialogueLine,
  escapeRegExp,
  formatSceneForChatWindow,
} from '../formatter/PromptFormatter';
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

// Actors are asked for a bare subtitle, but models still sneak in speaker labels,
// quotation marks, and parenthetical notes — strip everything but the spoken words
function extractSubtitle(rawText: string, speakerNames: string[]): string {
  const cleaned = cleanupAIOutput(rawText);
  let subtitle =
    cleaned
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? '';
  speakerNames.forEach((name) => {
    subtitle = subtitle.replace(new RegExp(`^${escapeRegExp(name)}\\s*:\\s*`, 'i'), '');
  });
  subtitle = subtitle.replace(/^\([^)]*\)\s*/, '');
  const quoted = /^"(.*)"$/s.exec(subtitle);
  if (quoted) {
    subtitle = quoted[1];
  }
  return subtitle.trim();
}

// The reviewer returns one `Name: line` per row; rows that don't start with a known
// speaker (commentary, headers) are discarded
function parseReviewedLines(rawText: string, speakerNames: string[]): DialogueLine[] {
  const lines: DialogueLine[] = [];
  cleanupAIOutput(rawText)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .forEach((line) => {
      const name = speakerNames.find((speaker) => new RegExp(`^${escapeRegExp(speaker)}\\s*:`, 'i').test(line));
      if (name) {
        const text = extractSubtitle(line, speakerNames);
        if (text.length > 1) {
          lines.push({ speaker: name, text });
        }
      }
    });
  return lines;
}

function toTranscript(lines: DialogueLine[]): string {
  return lines.map((line) => `${line.speaker}: ${line.text}`).join('\n');
}

export type DirectedGenerationOptions = {
  action?: string;
  continueScene?: boolean;
  directorModel?: string;
  // Parallel to event.sentient_sims order
  actorModels?: (string | undefined)[];
  // Real game events return the memory to the mod, which saves it back via POST /memories
  // when the interaction completes; the scenario tester has no mod, so it saves directly
  saveMemory?: boolean;
};

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
      if (this.ctx.settings.directedScenesEnabled && event.sentient_sims.length >= 2) {
        return this.runDirectedGeneration(event, { action: preAction });
      }
      return this.runGeneration(event, {
        preAction,
        prePreAction: 'At {location} ({location_type}), {postures},',
      });
    }

    return { status: InteractionEventStatus.NOOP };
  }

  async handleContinue(event: ContinueInteractionEvent) {
    if (this.ctx.settings.directedScenesEnabled && event.sentient_sims.length >= 2) {
      // Directed continue needs prior memories to pick up from; fall through when there are none
      const directed = await this.runDirectedGeneration(event, { continueScene: true });
      if (directed.status === InteractionEventStatus.GENERATED) {
        return directed;
      }
    }

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
    if (this.ctx.settings.directedScenesEnabled && doSomethingEvent.sentient_sims.length >= 2) {
      return this.runDirectedGeneration(doSomethingEvent, { action: doSomethingEvent.action });
    }
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

    const directedScenes = this.ctx.settings.directedScenesEnabled;

    // TODO: Add an options for formatted stop tokens that aren't necessarily in the prompt
    let output = cleanupAIOutput(response.text, stopTokens, { classic: !directedScenes });

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
      if (!directedScenes) {
        newMemory.content = output;
        // Classic playback: one narrator utterance, no per-speaker parsing or voice casting
        this.playTtsLines([{ speaker: 'Narrator', text: output }]);
        return {
          status: InteractionEventStatus.GENERATED,
          text: output,
          request: response.request,
          memory: newMemory,
        };
      }

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
        text: formatSceneForChatWindow(output),
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
    const systemPrompt = `You are a director reviewing a short generated scene from The Sims. Fix any issues and return only the corrected text — no commentary, no labels, no extra formatting.

Fix these issues if present:
- Remove invented physical actions, props, furniture, or locations not already established in the scene
- Remove references to invented shared history or past events ("that time we...", "remember when...", specific past anecdotes)
- Remove overly cinematic, melodramatic, or poetic language — keep it grounded and everyday
- Replace physical action beats with delivery notes (how a character sounds or feels) if applicable, or remove them entirely and leave pure dialogue
- Remove trailing incomplete sentences
- Put each character's line on its own line
Never cut the scene down to a single line when multiple characters speak — preserve the back-and-forth between them.
Only change a line when it violates one of the rules above. Otherwise keep the exact wording and character voice — puns, verbal tics, hesitations, and slang are performance choices, not mistakes.
If the scene is already good, return it unchanged.`;

    const providerConfig = this.ctx.providerConfigs.getConfigForAction(AIActionType.GENERATE);

    let oneShotRequest: OneShotRequest = {
      systemPrompt,
      messages: [text],
      maxResponseTokens: 300,
      maxTokens: 3900,
    };

    getInputFormatters(providerConfig.apiType).forEach((formatter) => {
      oneShotRequest = formatter.formatOneShotRequest(oneShotRequest);
    });

    const openAIRequestBuilder = new OpenAIRequestBuilder(this.ctx.getTokenCounter(providerConfig.apiType));
    const openAIRequest = openAIRequestBuilder.buildOneShotOpenAIRequest(oneShotRequest);
    openAIRequest.model = providerConfig.model;
    openAIRequest.apiType = providerConfig.apiType;
    const response = await this.ctx.getGenerationService(providerConfig.apiType).sentientSimsGenerate(openAIRequest);
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
    const providerConfig = this.ctx.providerConfigs.getConfigForAction(AIActionType.GENERATE);

    let oneShotRequest: OneShotRequest = {
      systemPrompt,
      messages: [userText],
      maxResponseTokens,
      maxTokens: 3900,
    };

    getInputFormatters(providerConfig.apiType).forEach((formatter) => {
      oneShotRequest = formatter.formatOneShotRequest(oneShotRequest);
    });

    const openAIRequestBuilder = new OpenAIRequestBuilder(this.ctx.getTokenCounter(providerConfig.apiType));
    const openAIRequest = openAIRequestBuilder.buildOneShotOpenAIRequest(oneShotRequest);
    openAIRequest.model = model ?? providerConfig.model;
    openAIRequest.apiType = providerConfig.apiType;
    const response = await this.ctx.getGenerationService(providerConfig.apiType).sentientSimsGenerate(openAIRequest);
    return { exchange: { label, request: openAIRequest, responseText: response.text }, text: response.text };
  }

  async runDirectedScene(request: DirectedSceneRequest): Promise<InteractionEventResult> {
    const { event } = request;
    if ((!event.testing_action && !request.continueScene) || event.sentient_sims.length < 2) {
      log.error('Directed scene requires a testing_action and at least two sims');
      return { status: InteractionEventStatus.NOOP };
    }
    return this.runDirectedGeneration(event, {
      action: event.testing_action,
      continueScene: request.continueScene,
      directorModel: request.directorModel,
      actorModels: request.actorModels,
      // The scenario tester has no game mod to save the memory, so persist it here
      saveMemory: true,
    });
  }

  async runDirectedGeneration(event: SSEvent, options: DirectedGenerationOptions): Promise<InteractionEventResult> {
    const providerConfig = this.ctx.providerConfigs.getConfigForAction(actionTypeForEvent(event.event_type));
    const promptOptions: PromptRequestBuilderOptions = {
      action: options.action,
      apiType: providerConfig.apiType,
      modelSettings: await this.ctx.modelSettings.getModelSettings(providerConfig.model, providerConfig.apiType),
    };
    const promptRequest = this.ctx.promptBuilder.buildPromptRequest(event, promptOptions);

    // promptRequest.location is already wrapped in <LOCATION> tags
    const sceneContext = [
      promptRequest.location,
      promptRequest.dateTime,
      promptRequest.season,
      promptRequest.weather,
      promptRequest.postures,
      promptRequest.participants,
    ]
      .filter((part) => part && part.trim().length > 0)
      .join('\n');

    const previously = promptRequest.memories
      .slice(-6)
      .map((memory) => memory.content)
      .join('\n');
    const previouslyBlock = previously ? `Previously in this scene:\n${previously}\n\n` : '';

    // Continuing a scene re-uses the same event; driving it with the original action again
    // would just replay the same beat, so swap in a continuation instruction instead
    const continuingScene = Boolean(options.continueScene) && previously.length > 0;
    const sceneAction = continuingScene
      ? 'The scene continues. Pick up the conversation exactly where it left off and move it forward — do not repeat or rephrase anything already said.'
      : (promptRequest.action ?? options.action);

    if (!sceneAction) {
      log.error('Directed generation has no action to drive the scene');
      return { status: InteractionEventStatus.NOOP };
    }

    const simNames = event.sentient_sims.map((sim) => sim.name);
    const exchanges: LLMExchange[] = [];

    // 1. Director splits the full context into one complete, self-contained prompt per actor
    const briefingSystemPrompt = `You are directing a scene of a show starring sentient Sims — this episode features ${simNames.join(' and ')}. The audience tunes in because these characters feel truly alive: vivid, compelling, full of personality. You have the FULL scene context below; the user message tells you what is happening right now. First decide what kind of scene this wants to be, then write one shared SCENE briefing plus one private briefing per actor. Each actor will see ONLY the shared briefing and their own private briefing — nothing else — so together they must contain everything that actor needs to play the scene.

${sceneContext}

Choosing the genre: read the characters, their moods, their history, and what is happening, then commit to the genre that fits this moment best — sitcom, rom-com, thriller, tragedy, reality-show drama, farce, noir, slow-burn romance, anything. Do not default to comedy; a heartbreak plays as tragedy, a scheme plays as a caper, a confrontation plays as a thriller. If the conversation is already underway, keep the genre it is already playing in unless the scene has clearly turned.

The shared SCENE briefing must cover, in under 60 words:
- Genre and tone: the genre you chose and how the delivery should sound — the scene has one register, and this sets it for every actor
- Setting: where and when the scene takes place
- Situation: what is happening right now

Each actor's private briefing must cover, in under 80 words:
- Role: "You are playing <name>." — their personality, current mood, and how it colors this moment
- Want: what their character wants out of this scene
- Angle: the specific attitude or feeling to play, and how they carry themselves in this conversation
- Relevant context: only the private details and past events that matter for this scene — never the character's whole life story

Rules:
- Be economical: every sentence must earn its place, and the word budgets are hard limits. Tight briefings make sharper performances.
- Direct for a real conversation, not a highlight reel. Each line should be a natural reply to the one before it, and the exchange should build toward something. A plain, honest line that moves the scene forward beats a clever one that does not connect.
- Keep secrets secret. Anything a character would not know — the other character's private thoughts, feelings, plans, or secrets — belongs only in the other actor's private briefing, never in the shared briefing.
- Smooth over wrinkles: if the context is awkward, contradictory, or overloaded, resolve it into a clean, playable scene.
- If the user message contains "Previously in this scene", the conversation is already underway: tell each actor to pick up mid-flow and build on what has already been said — no greetings, no introductions, no re-describing the setting.
- Direct them to be BRIEF: real conversation is quick short lines, not speeches. An actor who needs more than one short sentence is overacting.
- Do not write any dialogue and do not tell the actors specific lines to say.

Respond in exactly this format, nothing else:
=== SCENE ===
<the shared scene briefing>
${simNames.map((name) => `=== PROMPT FOR ${name} ===\n<the private briefing for ${name}>`).join('\n')}`;

    const briefing = await this.runOneShot(
      'Director Briefing',
      briefingSystemPrompt,
      `${previouslyBlock}${sceneAction}`,
      500,
      options.directorModel,
    );
    exchanges.push(briefing.exchange);

    // Each actor receives the shared scene briefing followed by their private briefing
    const sceneMatch = /===\s*SCENE\s*===\s*([\s\S]*?)(?=\n\s*===\s*PROMPT FOR|$)/i.exec(briefing.text);
    const sharedScene = sceneMatch ? sceneMatch[1].trim() : '';
    const actorPrompts = new Map<string, string>();
    simNames.forEach((name) => {
      const promptMatch = new RegExp(
        `===\\s*PROMPT FOR\\s+${escapeRegExp(name)}\\s*===\\s*([\\s\\S]*?)(?=\\n\\s*===\\s*PROMPT FOR|$)`,
        'i',
      ).exec(briefing.text);
      const actorPrompt = promptMatch ? promptMatch[1].trim() : '';
      if (actorPrompt.length > 1) {
        actorPrompts.set(name, sharedScene ? `${sharedScene}\n\n${actorPrompt}` : actorPrompt);
      } else {
        // If the director's output couldn't be parsed, fall back to the raw scene context
        actorPrompts.set(name, `You are playing ${name}.\n\n${sceneContext}`);
      }
    });

    // 2. Actors perform one turn each. Each actor returns a bare subtitle — only the words
    //    they speak, no preamble — and the speaker label is added programmatically after.
    const sceneLines: DialogueLine[] = [];
    for (let i = 0; i < event.sentient_sims.length; i += 1) {
      const sim = event.sentient_sims[i];
      const actorSystemPrompt = `${actorPrompts.get(sim.name)}

How to respond:
- Stay in character as ${sim.name} at all times.
- Reply with ONLY the words ${sim.name} says out loud — a bare subtitle. No name tag, no quotation marks, no stage directions, no delivery notes, no commentary.
- ONE short line, ten words or so, the way people actually talk. Never a speech.
- Talk like a real person in this conversation: your line must be a direct, natural reply to what was just said, in ${sim.name}'s voice and in the tone your director set. Not every line needs to be clever — a plain reply that keeps the conversation flowing beats a quip that does not connect.
- Move the conversation forward — answer questions that were asked, follow up on what the other person said, never repeat or rephrase anything already said.
- If the conversation is already underway (anything under "Previously in this scene"), jump straight in mid-flow — no greetings and no re-introductions.
- Do not mention physical actions, props, furniture, or locations.`;

      const conversationSoFar = toTranscript(sceneLines);
      const actorUserText = `${previouslyBlock}${sceneAction}${
        conversationSoFar ? `\n\nThe conversation so far:\n${conversationSoFar}` : ''
      }`;
      const performance = await this.runOneShot(
        `Actor: ${sim.name}`,
        actorSystemPrompt,
        actorUserText,
        60,
        options.actorModels?.[i],
      );
      exchanges.push(performance.exchange);

      const subtitle = extractSubtitle(performance.text, simNames);
      if (subtitle.length > 1) {
        sceneLines.push({ speaker: sim.name, text: subtitle });
      }
    }

    if (sceneLines.length === 0) {
      log.error('No actor produced a usable line for the directed scene');
      return { status: InteractionEventStatus.NOOP, exchanges };
    }

    // 3. Reviewer: the director reviews the whole conversation and locks the final cut
    const compileSystemPrompt = `You are the director of a show starring sentient Sims. You are reviewing the newest lines of a scene between ${simNames.join(' and ')} before they go to air. The scene was performed in a specific genre and tone — comedy, thriller, tragedy, romance, whatever the delivered lines are playing in. Infer that register from the lines and preserve it. What matters most is that the scene reads as one continuous, coherent conversation: every line follows naturally from the line before it.

You are an editor, not a writer. Do NOT continue the conversation, do NOT reply to the delivered lines, and do NOT add new lines — your output is the delivered lines themselves, passed through or repaired. Any scene direction in the user message (such as an instruction to continue the scene or move the conversation forward) was addressed to the actors, and they have already performed it — it is context for you, not a task. Your default is to return them EXACTLY as written, in the same order. Jokes, jabs, verbal tics, hesitations, plain replies, and slang are performance choices — they stay. A line does not need to be clever or quotable to be kept. Only rewrite a line if it:
- Does not connect to the line before it — ignores a direct question, changes the subject for no reason, or is a standalone quip instead of a reply
- Mentions physical actions, props, furniture, or locations not already established in the scene
- References invented shared history or past events
- Breaks the genre and tone the rest of the scene is playing in
- Repeats or rephrases something already said, contradicts another line, or trails off mid-sentence
- Greets or re-introduces a character when the conversation is already underway
- Runs long — cut a rambling line down to the sentence that carries the conversation
When you do rewrite, change only what is broken and keep the actor's intent and voice.

Respond with the final scene as one line per row in exactly this format, nothing else:
<character name>: <the words they say>

- Every line is a bare subtitle: no quotation marks, no parentheses, no stage directions, no commentary
- Both characters must speak — never collapse the scene to a single line
- Keep it to two to four lines total, each one short
- Return exactly the delivered lines, kept or repaired — never lines from "Previously in this scene", and never new lines of your own`;

    const compiled = await this.runOneShot(
      'Director Review',
      compileSystemPrompt,
      `${previouslyBlock}The direction the actors were given: ${sceneAction}\n\nThe actors' delivered lines to review — return these lines kept or repaired, do not reply to them:\n${toTranscript(sceneLines)}`,
      400,
      options.directorModel,
    );
    exchanges.push(compiled.exchange);

    const reviewedLines = parseReviewedLines(compiled.text, simNames);
    // The reviewer must preserve the back-and-forth; if its output lost a speaker or
    // could not be parsed, air the actors' original performances instead
    const reviewedSpeakers = new Set(reviewedLines.map((line) => line.speaker));
    const finalLines = reviewedLines.length >= 2 && reviewedSpeakers.size >= 2 ? reviewedLines : sceneLines;
    const dialogueText = toTranscript(finalLines);

    // The scene's driving action is shown above the dialogue in the in-game memories window,
    // but it is never spoken: TTS streams finalLines, which stay pure dialogue, and the paced
    // subtitle block is suppressed. Continuations reuse the synthetic "scene continues"
    // instruction rather than a real action, so they show only the dialogue.
    const preActionLine = continuingScene ? undefined : sceneAction;
    const finalText = preActionLine ? `${preActionLine}\n${dialogueText}` : dialogueText;

    const newMemory: MemoryEntity = {
      content: finalText,
      location_id: event.environment.location_id,
      event_type: event.event_type,
    };
    const interactionName = (event as Partial<InteractionEvent>).interaction_name;
    if (interactionName) {
      newMemory.interaction_name = interactionName;
    }
    if (options.saveMemory) {
      const participants = this.ctx.participantRepository.getParticipants(
        event.sentient_sims.map((sim) => ({ id: sim.sim_id, fullName: sim.name })),
      );
      this.ctx.memoryRepository.createMemory({ memory: newMemory, participants });
    }

    // The scene reaches the game one line at a time: the memory block's subtitle is
    // suppressed (paced flag on memory_created) and the renderer streams each line to
    // the mod as it starts playing. The preaction streams first as a speakerless line
    // so the live in-game view matches the stored memory.
    markScenePaced(finalText);
    this.playTtsLines(finalLines, event.sentient_sims, { paced: true, preamble: preActionLine });

    return {
      status: InteractionEventStatus.GENERATED,
      text: formatSceneForChatWindow(finalText),
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

  playTtsLines(lines: DialogueLine[], sims?: SentientSim[], options?: { paced?: boolean; preamble?: string }) {
    playTTSLines(lines, sims, options);
  }
}
