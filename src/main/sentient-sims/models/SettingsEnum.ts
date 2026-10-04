export enum SettingsEnum {
  MOD_RELEASE = 'modRelease',
  OPENAI_MODEL = 'openaiModel',
  NOVELAI_MODEL = 'novelaiModel',
  SENTIENTSIMSAI_MODEL = 'sentientsimsAIModel',
  MODS_DIRECTORY = 'modsDirectory',
  AI_API_TYPE = 'aiApiType',
  ACCESS_TOKEN = 'accessToken',
  OPENAI_KEY = 'openaiKey',
  NOVELAI_KEY = 'novelaiKey',
  LOCALIZATION_ENABLED = 'localizationEnabled',
  LOCALIZATION_LANGUAGE = 'localizationLanguage',
  DEBUG_LOGS = 'debugLogs',
  NSFW_ENABLED = 'nsfwEnabled',
  DIRECTED_SCENES_ENABLED = 'directedScenesEnabled',
  MAPPING_NOTIFICATION_ENABLED = 'mappingNotificationEnabled',
  OPENAI_ENDPOINT = 'openaiEndpoint',
  OPENROUTER_KEY = 'openrouterKey',
  OPENROUTER_ENDPOINT = 'openrouterEndpoint',
  OPENROUTER_MODEL = 'openrouterModel',
  VLLM_ENDPOINT = 'vllmEndpoint',
  VLLM_APIKEY = 'vllmKey',
  VLLM_MODEL = 'vllmModel',
  KOBOLDAI_ENDPOINT = 'koboldAIEndpoint',
  SENTIENTSIMSAI_ENDPOINT = 'sentientsimsAIEndpoint',
  NOVELAI_ENDPOINT = 'novelAIEndpoint',
  NOVELAI_GENERATION_ENDPOINT = 'novelAIGenerationEndpoint',
  GEMINI_KEYS = 'geminiKeys', // Supports multiple keys separated by commas (e.g., "key1,key2,key3")
  GEMINI_ENDPOINT = 'geminiEndpoint',
  GEMINI_MODEL = 'geminiModel',
  TRAIT_MAPPING_PATH = 'traitMappingPath',
  TTS_ENABLED = 'ttsEnabled',
  TTS_API_TYPE = 'ttsApiType',
  TTS_VOLUME = 'ttsVolume',
  OPENAI_TTS_SETTINGS = 'openaiTtsSettings',
  SENTIENTSIMSAI_TTS_SETTINGS = 'sentientsimsaiTtsSettings',
  KOKOROAI_ENDPOINT = 'kokoroaiEndpoint',
  KOKOROAI_TTS_SETTINGS = 'kokoroaiTtsSettings',
  ELEVENLABS_KEY = 'elevenlabsKey',
  ELEVENLABS_ENDPOINT = 'elevenlabsEndpoint',
  ELEVENLABS_TTS_SETTINGS = 'elevenlabsTtsSettings',
  ELEVENLABS_VOICES = 'elevenlabsVoices',
  SETUP_WIZARD_PAGE = 'setupWizardPage',
  PATREON_LINKING = 'patreonLinking',
  MAX_RESPONSE_TOKENS = 'maxResponseTokens',
  GENERATION_TIMEOUT_SECONDS = 'generationTimeoutSeconds',
  GENERATION_CONCURRENCY = 'generationConcurrency',
  PREFETCH_MAX_QUEUE_DEPTH = 'prefetchMaxQueueDepth',
  // Legacy single-provider embedding selection; migrated into EMBEDDING_PROVIDER_CONFIGS
  EMBEDDING_API_TYPE = 'embeddingApiType',
  SENTIENTSIMSAI_EMBEDDING_MODEL = 'sentientsimsAIEmbeddingModel',
  EMBEDDING_PROVIDER_CONFIGS = 'embeddingProviderConfigs',
  DEFAULT_EMBEDDING_PROVIDER_CONFIG_ID = 'defaultEmbeddingProviderConfigId',
  AI_PROVIDER_CONFIGS = 'aiProviderConfigs',
  DEFAULT_AI_PROVIDER_CONFIG_ID = 'defaultAiProviderConfigId',
  AI_ACTION_PROVIDER_OVERRIDES = 'aiActionProviderOverrides',
  // Per-stage system prompt overrides, keyed by pipeline StageId
  STAGE_PROMPT_OVERRIDES = 'stagePromptOverrides',
  // How many memories retrieval scores per query (Phase 3.1 H3). Raised from the old
  // hardcoded 500 now that the entity-focus window makes a wider pool useful.
  MEMORY_RETRIEVAL_CANDIDATE_LIMIT = 'memoryRetrievalCandidateLimit',
  // Cognition (Block 9): the autonomous per-sim tick loop
  COGNITION_ENABLED = 'cognitionEnabled',
  COGNITION_AUTONOMY_LEVEL = 'cognitionAutonomyLevel', // off | suggest | full
  COGNITION_TICK_INTERVAL_SECONDS = 'cognitionTickIntervalSeconds',
  COGNITION_MAX_CONCURRENT = 'cognitionMaxConcurrent',
  COGNITION_PER_SIM_HOURLY_BUDGET = 'cognitionPerSimHourlyBudget',
  COGNITION_PIPELINE = 'cognitionPipeline', // legacy review dial; unused since the Action Scene pipeline
  // Full Autonomy: a tick/scene action score at or above this stages an Action Scene
  COGNITION_ACTION_SCORE_THRESHOLD = 'cognitionActionScoreThreshold',
  // Daily plans: nightly goals-from-pool + persona sentence + discretionary action loadout
  DAILY_GOALS_ENABLED = 'dailyGoalsEnabled',
  DAILY_LOADOUT_SIZE = 'dailyLoadoutSize',
  // Voice input: hold-to-talk mic capture transcribed via an OpenAI-compatible
  // /audio/transcriptions endpoint, injected into the game as the active sim speaking
  VOICE_INPUT_ENABLED = 'voiceInputEnabled',
  VOICE_INPUT_ENDPOINT = 'voiceInputEndpoint',
  VOICE_INPUT_KEY = 'voiceInputKey',
  VOICE_INPUT_MODEL = 'voiceInputModel',
  VOICE_INPUT_HOTKEY = 'voiceInputHotkey',
  VOICE_INPUT_HOTKEY_MODE = 'voiceInputHotkeyMode', // hold | toggle
  VOICE_INPUT_LANGUAGE = 'voiceInputLanguage', // ISO-639-1 hint, empty = auto-detect
  VOICE_INPUT_DEVICE_ID = 'voiceInputDeviceId', // empty = system default mic
  // V-1: voice/subtitle playback pauses with a user pause and paces with speed 2/3
  PLAYBACK_FOLLOWS_GAME_CLOCK = 'playbackFollowsGameClock',
  // V-3: who the player IS when they speak into the game (The Voice, guardian angel, ...)
  PLAYER_VOICE_PERSONA = 'playerVoicePersona',
  PLAYER_VOICE_PERSONA_BIO = 'playerVoicePersonaBio',
  // The player's own name, spoken to sims instead of the persona's label ('' = the label)
  PLAYER_VOICE_PERSONA_NAME = 'playerVoicePersonaName',
  // V-8: a second hotkey where speech is an ORDER to the sim, not talk
  VOICE_COMMAND_HOTKEY = 'voiceCommandHotkey',
  // Ask actions: triage Voice/Twitch lines for talk-vs-do; a "do" matches the full action
  // vocabulary and the sim answers yes-or-no in character before it dispatches
  ASK_ACTIONS_ENABLED = 'askActionsEnabled',
  // F5: a success reported this soon after dispatch, for a push never seen running and
  // with no design reason to be instant, is graded suspect instead of written as truth
  OUTCOME_INSTANT_SUCCESS_MS = 'outcomeInstantSuccessMs',
  // V-5a: how many rounds a directed scene may continue itself
  SCENE_MAX_ROUNDS = 'sceneMaxRounds',
  // Player-facing replies (chat window, voice, conscience, Twitch): the actor's token
  // budget for a reply to the player, how long a conversation thread stays open between
  // the player's lines, and whether a reply may turn straight into an action
  PLAYER_REPLY_MAX_TOKENS = 'playerReplyMaxTokens',
  PLAYER_CONVERSATION_IDLE_MINUTES = 'playerConversationIdleMinutes',
  CONVERSATION_ACTIONS_ENABLED = 'conversationActionsEnabled',
  // The scorer's action verdict a reply must reach before it may act (its own bar, above
  // the tick's: a chat is not an invitation to go do chores)
  CONVERSATION_ACTION_SCORE_THRESHOLD = 'conversationActionScoreThreshold',
  // V-6: write a first description for undescribed sims/lots instead of the stock default
  GENERATED_DEFAULT_DESCRIPTIONS = 'generatedDefaultDescriptions',
  GAME_APP_PATH = 'gameAppPath',
  IMAGE_PROVIDER_CONFIGS = 'imageProviderConfigs',
  DEFAULT_IMAGE_PROVIDER_CONFIG_ID = 'defaultImageProviderConfigId',
  // Twitch !ask: viewers' chat questions delivered to the active sim via the player-voice
  // pipeline (anonymous read-only IRC; the optional account login powers the follower gate)
  TWITCH_CHAT_ENABLED = 'twitchChatEnabled',
  TWITCH_CHANNEL = 'twitchChannel',
  TWITCH_COMMAND_WORD = 'twitchCommandWord',
  TWITCH_VIEWER_COOLDOWN_SECONDS = 'twitchViewerCooldownSeconds',
  TWITCH_GLOBAL_COOLDOWN_SECONDS = 'twitchGlobalCooldownSeconds',
  TWITCH_ASK_PERMISSION = 'twitchAskPermission', // everyone | subs | mods
  TWITCH_FOLLOWERS_ONLY = 'twitchFollowersOnly',
  // "Name=simId" lines: extra !ask targets for sims the game reports namelessly (service
  // NPCs like the Grim Reaper) — reachable by chat even when not on the lot
  TWITCH_SIM_ALIASES = 'twitchSimAliases',
  TWITCH_CLIENT_ID = 'twitchClientId',
  TWITCH_AUTH = 'twitchAuth', // stored device-flow tokens + broadcaster identity
  // Speak each viewer's typed question aloud in a dedicated ElevenLabs voice before the reply
  TWITCH_SPEAK_QUESTIONS = 'twitchSpeakQuestions',
  TWITCH_CHAT_VOICE_ID = 'twitchChatVoiceId', // '' = the built-in default chat voice
}

export enum DeprecatedSettingsEnum {
  CUSTOM_LLM_ENABLED = 'customLLMEnabled',
}
