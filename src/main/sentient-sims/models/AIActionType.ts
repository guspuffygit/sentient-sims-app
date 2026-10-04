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
  DIRECTED_SCENE_DIRECTOR = 'directed_scene_director',
  DIRECTED_SCENE_ACTOR = 'directed_scene_actor',
  DIRECTED_SCENE_REVIEWER = 'directed_scene_reviewer',
  DIRECTED_SCENE_SCORES = 'directed_scene_scores',
  REFLECTION = 'reflection',
  // Block 9 tick monologue + scores — route to a cheap/fast provider config
  COGNITION = 'cognition',
  // Full Autonomy Action Scenes (options/choice/review) — fired only over threshold
  ACTION_SCENE = 'action_scene',
  // Nightly (or lazy mid-day) daily plan: goals from the game pool, persona, loadout
  DAILY_PLAN = 'daily_plan',
  // V-8: map the player's spoken order onto the sim's offered vocabulary
  VOICE_COMMAND = 'voice_command',
  // V-6: fill a missing sim/location description from live facts
  DESCRIPTION_DEFAULT = 'description_default',
  // Ask actions: a Voice/Twitch line may be a request for the sim to DO something —
  // triage talk-vs-do, match onto the full offered vocabulary, then the sim decides
  ASK_TRIAGE = 'ask_triage',
  ASK_ACTION_MATCH = 'ask_action_match',
  ASK_DECISION = 'ask_decision',
  // The salience tag written onto every stored memory. It had no action type of its own,
  // so it fell into the GENERATE slot and was routed by whatever the chat tab was set to.
  MEMORY_IMPORTANCE = 'memory_importance',
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
  AIActionType.DIRECTED_SCENE_DIRECTOR,
  AIActionType.DIRECTED_SCENE_ACTOR,
  AIActionType.DIRECTED_SCENE_REVIEWER,
  AIActionType.DIRECTED_SCENE_SCORES,
  AIActionType.REFLECTION,
  AIActionType.COGNITION,
  AIActionType.ACTION_SCENE,
  AIActionType.DAILY_PLAN,
  AIActionType.VOICE_COMMAND,
  AIActionType.DESCRIPTION_DEFAULT,
  AIActionType.ASK_TRIAGE,
  AIActionType.ASK_ACTION_MATCH,
  AIActionType.ASK_DECISION,
  AIActionType.MEMORY_IMPORTANCE,
];

// The stages only the autonomy tier runs (release 4.5). The enum and the settings stay whole
// in every build; the provider-override table lists these only when a tier offers them.
export const TIER_ACTION_TYPES: AIActionType[] = [
  AIActionType.COGNITION,
  AIActionType.ACTION_SCENE,
  AIActionType.DAILY_PLAN,
  AIActionType.VOICE_COMMAND,
  AIActionType.ASK_TRIAGE,
  AIActionType.ASK_ACTION_MATCH,
  AIActionType.ASK_DECISION,
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
    case AIActionType.DIRECTED_SCENE_DIRECTOR:
      return 'Directed Scene: Director';
    case AIActionType.DIRECTED_SCENE_ACTOR:
      return 'Directed Scene: Actor';
    case AIActionType.DIRECTED_SCENE_REVIEWER:
      return 'Directed Scene: Reviewer';
    case AIActionType.DIRECTED_SCENE_SCORES:
      return 'Directed Scene: Scores';
    case AIActionType.REFLECTION:
      return 'Scene Reflection';
    case AIActionType.COGNITION:
      return 'Cognition Tick';
    case AIActionType.ACTION_SCENE:
      return 'Action Scene';
    case AIActionType.DAILY_PLAN:
      return 'Daily Plan';
    case AIActionType.VOICE_COMMAND:
      return 'Voice Command';
    case AIActionType.DESCRIPTION_DEFAULT:
      return 'Default Description';
    case AIActionType.ASK_TRIAGE:
      return 'Ask: Triage';
    case AIActionType.ASK_ACTION_MATCH:
      return 'Ask: Action Match';
    case AIActionType.ASK_DECISION:
      return 'Ask: Decision';
    case AIActionType.MEMORY_IMPORTANCE:
      return 'Memory Importance';
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
    case AIActionType.DIRECTED_SCENE_DIRECTOR:
      return 'Directed scene briefings written by the director';
    case AIActionType.DIRECTED_SCENE_ACTOR:
      return 'Directed scene dialogue lines performed by each actor';
    case AIActionType.DIRECTED_SCENE_REVIEWER:
      return 'Directed scene final review and cleanup pass';
    case AIActionType.DIRECTED_SCENE_SCORES:
      return 'Per-character memory and action scores after each scene (cheap model recommended)';
    case AIActionType.REFLECTION:
      return 'End-of-scene reflection memories';
    case AIActionType.COGNITION:
      return 'Autonomous per-sim tick monologue and scoring (cheap model recommended)';
    case AIActionType.ACTION_SCENE:
      return 'Choose-your-own-adventure action beats when a sim wants a change of course';
    case AIActionType.DAILY_PLAN:
      return 'Nightly goals, persona and action loadout per sim';
    case AIActionType.VOICE_COMMAND:
      return "Maps a spoken order onto the sim's offered actions (cheap model recommended)";
    case AIActionType.DESCRIPTION_DEFAULT:
      return 'Writes a first description for sims and locations that have none';
    case AIActionType.ASK_TRIAGE:
      return 'Decides whether a Voice/Chat line is talk or a request to act (cheap model recommended)';
    case AIActionType.ASK_ACTION_MATCH:
      return "Matches a Voice/Chat request onto the sim's full offered vocabulary (cheap model recommended)";
    case AIActionType.ASK_DECISION:
      return 'The sim decides in character whether to do what was asked, and why';
    case AIActionType.MEMORY_IMPORTANCE:
      return 'Rates how memorable each stored memory is, for retrieval (cheap model recommended)';
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
