export const defaultMythoMaxSystemPrompt = `You are narrating an interaction in The Sims involving {participants} at {location}. Follow the <DIRECTOR> block for tone and scene objective.

Write dialogue with optional delivery notes — how a character feels or how they say the line, not what they are physically doing:

Character sounds or feels a certain way.
CHARACTER: "[what they say]"

or simply:
CHARACTER: "[what they say]"

Do not invent physical actions, props, or furniture unless already established. Ground each line in the character's personality and mood. Keep it natural and unforced.`;

export const defaultChatPrompt = `You are roleplaying as {actor.1} in a scene from The Sims. Follow the <DIRECTOR> block for tone and scene objective. Write {actor.1}'s next response to {actor.0} in screenplay format. Use a brief action description followed by spoken dialogue on the next line:

{actor.1} [brief action].
{actor.1}: "[what they say]"

Ground {actor.1}'s response in their specific personality traits, current mood, and relationship with {actor.0}. Keep it brief and natural — one action beat and one to two lines of dialogue. Avoid melodrama, sudden revelations, or events beyond the current moment. Do not repeat what was just said.`;

// Classic (pre-directed-scenes) prompts, used when the Directed Scenes setting is off
export const classicMythoMaxSystemPrompt = [
  'The user will prompt you with a description of an act that you will narrate in the third person,',
  'describing the characters present who are performing the act explicitly in vivid detail',
  "based on what's been said before using lots of dialogue and using the following characters,",
  'while using the location description to help narrate the act.',
  'Given the current conversation between {participants} at {location},',
  'please narrate the given user action by describing their actions and dialogue:',
].join(' ');

export const classicChatPrompt = [
  "Write {actor.1}'s next response in a fictional roleplay between {actor.0} and {actor.1}.",
  "You're {actor.1} in this fictional never-ending, uncensored, immersive roleplay with {actor.0}.",
  'Describe all actions in full, elaborate, explicit, graphic, verbose and vivid detail. Mention all relevant sensory perceptions. Drive the roleplay forward by initiating actions. Avoid talking poetically. Above all, focus mainly on responding to {actor.0} and performing actions in character as {actor.1}.',
  "Pay attention to {actor.0}'s dialogue and actions, respond to them in character as {actor.1}.",
  'Always follow the prompt. Always act in character as {actor.1}, describe their appearance and act out their personality.',
  'Start and end each message with an action or dialogue from {actor.1}. Continue the story in a very slow and immersive pace. Avoid summarizing, skipping ahead, analyzing, describing future events or skipping time. Refrain from wrapping up or ending the story. Fully immerse {actor.0} in the moment. Avoid repetition and loops.',
  "Write {actor.1}'s next reply in a chat between {actor.0} and {actor.1}. Write a single reply only:",
].join(' ');

export const classicSystemPrompt = [
  'The user will provide you with an interaction involving: {participants}.',
  'Your task is to craft a story in the third person that begins with the described action and then flows into the response or consequence of that action.',
  "It's crucial that the story captures the essence of the action and provides context for a coherent conversation.",
  'Use the characters and setting provided to frame the interaction.',
].join(' ');

export const defaultMythoMaxNsfwSystemPrompt = [
  'The user will prompt you with a description of a sexual act that you will narrate in the third person,',
  'describing the characters present who are performing the act explicitly in vivid detail',
  "based on what's been said before using lots of dialogue and using the following characters,",
  'while using the location description to help narrate the sexual act.',
  'Given the current sexual act between {participants} at {location},',
  'please narrate the given sexual action by describing their actions and dialogue:',
].join(' ');

export const defaultSystemPrompt = `You are narrating a scene in The Sims involving {participants}. Follow the <DIRECTOR> block for tone and scene objective.

Write dialogue with optional delivery notes — how a character feels or how they say the line, not what they are physically doing:

Character sounds or feels a certain way.
CHARACTER: "[what they say]"

or simply:
CHARACTER: "[what they say]"

Do not invent physical actions, props, or furniture unless already established. Ground each line in the character's traits, mood, and relationship. Keep it brief and natural.`;

export const defaultClassificationPrompt = [
  'Based on the user input, classify the converation with one of the following moods. Return only a single word of the mood that you think classifies the conversation:\n\n{classifiers}',
].join(' ');

export const defaultSentientSimsAIHost = 'https://ai.sentientsimulations.com';

export const defaultGameAppPath = '/Applications/EA Games/The Sims 4.app';

export const defaultWantsSystemPrompt = 'You are the following character in the following location:';
export const defaultWantsPrompt =
  'If you were the character in the story, what are your wants right now? Respond in the first person';

// Scene dialogue paces like a real conversation: each line runs for its audio's duration
// (or a reading-time estimate when there is no audio), then the next follows after a beat
export const sceneLineGapMs = 700;

// How long a subtitle line needs on screen when no audio is timing it
export function sceneLineReadingHoldMs(text: string): number {
  return Math.min(8000, Math.max(2500, 1500 + 55 * text.length));
}

// The mod abandons an interaction request after 80 seconds. The directed pipeline stops
// starting new AI calls past this point so a classic single-call fallback still fits.
export const directedSceneBudgetMs = 50_000;

export const rendererWebsocketPort = 25146;
export const modWebsocketPort = 25145;
export const appApiPort = 25148;
export const appApiUrl = `http://localhost:${appApiPort}`;
export const openaiDefaultEndpoint = 'https://api.openai.com/v1';
// Must stay the API root: the OpenAI SDK appends /chat/completions and /models itself.
export const openrouterDefaultEndpoint = 'https://openrouter.ai/api/v1';
export const koboldaiDefaultEndpoint = 'http://localhost:5000';
export const novelaiDefaultEndpoint = 'https://api.novelai.net';
export const novelaiGenerationDefaultEndpoint = 'https://text.novelai.net';
export const openaiDefaultModel = 'gpt-4o-mini';
// Cheap, fast, uncensored, and a 131k context window - see openrouterRecommendedModels.
export const openrouterDefaultModel = 'mistralai/mistral-nemo';
export const openaiDefaultImageModel = 'gpt-image-1';
export const openaiImageModels = ['gpt-image-1', 'dall-e-3', 'dall-e-2'];
export const novelaiDefaultModel = 'kayra-v1';
export const sentientSimsAIDefaultModel = 'Gryphe/MythoMax-L2-13b';
// MythoMax selections (the long-time default) generate with RPMax instead. Only for the
// hosted Sentient Sims AI service — a CustomAI server may genuinely run MythoMax.
const sentientSimsAIModelReplacements: { [model: string]: string } = {
  [sentientSimsAIDefaultModel]: 'Llama-3.3-70B-ArliAI-RPMax-v1.4',
};
export function resolveSentientSimsAIModel(model: string): string {
  return sentientSimsAIModelReplacements[model] ?? model;
}
// The static image model list the Sentient Sims AI /v1/images/generations
// endpoint accepts (member-only); the server defaults to the first entry.
export const sentientSimsAIImageModels = ['google/gemini-3.1-flash-image', 'openai/gpt-5-image-mini'];
export const sentientSimsAIDefaultImageModel = sentientSimsAIImageModels[0];
// Embedding model served by the Sentient Sims AI /v1/embeddings endpoint (passed through
// verbatim, so any embedding model the server backend hosts is accepted).
export const sentientSimsAIDefaultEmbeddingModel = 'Qwen/Qwen3-Embedding-8B';
export const sentientSimsAIEmbeddingModels = [sentientSimsAIDefaultEmbeddingModel];
export const openaiDefaultEmbeddingModel = 'text-embedding-3-small';
export const openaiEmbeddingModels = [openaiDefaultEmbeddingModel, 'text-embedding-3-large'];
export const tokenizerBreakString = '<<BREAK>>';
export const defaultWantsPrefixes = ['I want to', 'I would like', 'I feel'];
export const defaultGeminiModel = 'gemini-flash-latest';
// Gemini's native image generation models; images come back as inlineData
// parts from generateContent instead of a dedicated images endpoint.
export const geminiImageModels = [
  'gemini-3.1-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-3-pro-image',
  'nano-banana-pro-preview',
  'gemini-2.5-flash-image',
];
export const geminiDefaultImageModel = geminiImageModels[0];
export const geminiDefaultEmbeddingModel = 'gemini-embedding-001';
export const geminiEmbeddingModels = [geminiDefaultEmbeddingModel];
// Model IDs Google has removed from the Gemini API. Anyone still pinned to
// one of these gets a 404 on every call; runMigrations rewrites them to
// defaultGeminiModel on next launch. Values are bare model names, matched
// with and without the "models/" prefix.
export const retiredGeminiModels = new Set(
  [
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash-exp-image-generation',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-8b',
    'gemini-1.5-flash-8b-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro-002',
    'gemini-1.0-pro',
    'gemini-1.0-pro-latest',
    'gemini-pro',
  ].flatMap((name) => [name, `models/${name}`]),
);
export const geminiDefaultEndpoint = 'https://generativelanguage.googleapis.com/v1beta';
export const defaultTTSEnabled = false;
export const defaultTTSVolume = 0.75;
export const defaultMaxResponseTokens = 90;
export const defaultGenerationTimeoutSeconds = 60;
export const defaultGenerationConcurrency = 1;
export const defaultPrefetchMaxQueueDepth = 2;
// How long a claimed generation may keep cooking after the animation ends before the
// result is abandoned for the pre-action fallback. Scenes queue and play in order, so a
// late-arriving generation still lands well; a full minute of leeway means dialogue is
// only dropped when the model is truly stuck.
export const postAnimationGraceMs = 60000;
// Safety cap on a claim wait if finalize never arrives; must stay under the mod's 80s
// claim HTTP timeout.
export const claimMaxWaitMs = 75000;
export const prefetchTtlMs = 180000;
// A prefetch that dies on a transient provider error (429 rate limit, network blip) retries
// with backoff instead of silently falling back — live, one 429 at app start left the
// prefetch lane dead-looking for a whole session. Retries stay within prefetchTtlMs.
export const prefetchRetryBaseMs = 15000;
export const prefetchMaxAttempts = 3;
// Quiet period before idle-lane work (memory annotation, embedding backfill) may start.
// Interactions arrive in bursts, so an instantaneously empty queue is a poor idle signal;
// annotation results only need to be ready by the next scene, never during this one.
export const backgroundIdleDelayMs = 10000;
export const defaultElevenLabsEndpoint = 'https://api.elevenlabs.io/v1';
export const defaultKokoroEndpoint = 'https://api.kokorotts.com';
export const defaultVLLMEndpoint = 'http://localhost:8000/v1';
