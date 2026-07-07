import { SSEventType } from './InteractionEvents';

// Every distinct kind of AI request the app makes. Each one can be routed to
// its own provider config, falling back to the default config when no
// override is set.
export enum AIActionType {
  INTERACTION = 'interaction',
  DO_SOMETHING = 'do_something',
  CHAT = 'chat',
  CHAT_CONTINUE = 'chat_continue',
  CONTINUE = 'continue',
  WANTS = 'wants',
  WICKED_WHIMS = 'wicked_whims',
  CLASSIFICATION = 'classification',
  BUFF = 'buff',
  GENERATE = 'generate',
  DIRECTOR = 'director',
  ACTOR = 'actor',
}

export const AllAIActionTypes: AIActionType[] = [
  AIActionType.INTERACTION,
  AIActionType.DO_SOMETHING,
  AIActionType.CHAT,
  AIActionType.CHAT_CONTINUE,
  AIActionType.CONTINUE,
  AIActionType.WANTS,
  AIActionType.WICKED_WHIMS,
  AIActionType.CLASSIFICATION,
  AIActionType.BUFF,
  AIActionType.GENERATE,
  AIActionType.DIRECTOR,
  AIActionType.ACTOR,
];

// configId per action; missing key means "use the default provider config"
export type AIActionOverrides = Partial<Record<AIActionType, string>>;

export function AIActionTypeName(actionType: AIActionType): string {
  switch (actionType) {
    case AIActionType.INTERACTION:
      return 'Interaction';
    case AIActionType.DO_SOMETHING:
      return 'Do Something';
    case AIActionType.CHAT:
      return 'Chat';
    case AIActionType.CHAT_CONTINUE:
      return 'Chat Continue';
    case AIActionType.CONTINUE:
      return 'Continue';
    case AIActionType.WANTS:
      return 'Wants';
    case AIActionType.WICKED_WHIMS:
      return 'Wicked Whims';
    case AIActionType.CLASSIFICATION:
      return 'Classification';
    case AIActionType.BUFF:
      return 'Buff';
    case AIActionType.GENERATE:
      return 'Chat Generation';
    case AIActionType.DIRECTOR:
      return 'Director';
    case AIActionType.ACTOR:
      return 'Actor';
    default:
      return actionType;
  }
}

export function AIActionTypeDescription(actionType: AIActionType): string {
  switch (actionType) {
    case AIActionType.INTERACTION:
      return 'Mapped in-game interactions between sims';
    case AIActionType.DO_SOMETHING:
      return 'Player initiated Do Something actions';
    case AIActionType.CHAT:
      return 'Player initiated sim chat';
    case AIActionType.CHAT_CONTINUE:
      return 'Continuing a sim chat';
    case AIActionType.CONTINUE:
      return 'Continuing a story generation';
    case AIActionType.WANTS:
      return 'Sim wants generation';
    case AIActionType.WICKED_WHIMS:
      return 'Wicked Whims animation events';
    case AIActionType.CLASSIFICATION:
      return 'Classifying conversations, like moods';
    case AIActionType.BUFF:
      return 'Buff mood classification and description generation';
    case AIActionType.GENERATE:
      return 'Chat tab generation in the app';
    case AIActionType.DIRECTOR:
      return 'Director briefing and review for multi-sim directed scenes';
    case AIActionType.ACTOR:
      return 'Individual sim performances inside a directed scene';
    default:
      return '';
  }
}

export function actionTypeForEvent(eventType: SSEventType): AIActionType {
  switch (eventType) {
    case SSEventType.DO_SOMETHING:
      return AIActionType.DO_SOMETHING;
    case SSEventType.CHAT:
      return AIActionType.CHAT;
    case SSEventType.CHAT_CONTINUE:
      return AIActionType.CHAT_CONTINUE;
    case SSEventType.CONTINUE:
      return AIActionType.CONTINUE;
    case SSEventType.WANTS:
      return AIActionType.WANTS;
    case SSEventType.WICKED_WHIMS:
      return AIActionType.WICKED_WHIMS;
    case SSEventType.INTERACTION:
    case SSEventType.INTERACTION_MAPPING:
    default:
      return AIActionType.INTERACTION;
  }
}
