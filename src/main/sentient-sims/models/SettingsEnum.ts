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
  MAPPING_NOTIFICATION_ENABLED = 'mappingNotificationEnabled',
  OPENAI_ENDPOINT = 'openaiEndpoint',
  KOBOLDAI_ENDPOINT = 'koboldAIEndpoint',
  SENTIENTSIMSAI_ENDPOINT = 'sentientsimsAIEndpoint',
  NOVELAI_ENDPOINT = 'novelAIEndpoint',
  // [NEW] Added settings for Gemini API integration
  GEMINI_KEYS = 'geminiKeys', // Supports multiple keys separated by commas (e.g., "key1,key2,key3")
  GEMINI_ENDPOINT = 'geminiEndpoint', // Endpoint for Gemini API
  GEMINI_MODEL = 'geminiModel', // Selected Gemini model (e.g., "gemini-2.0-flash-exp")
}

export enum DeprecatedSettingsEnum {
  CUSTOM_LLM_ENABLED = 'customLLMEnabled',
}
