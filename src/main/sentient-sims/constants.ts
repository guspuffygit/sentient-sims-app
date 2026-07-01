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

export const defaultWantsSystemPrompt = 'You are the following character in the following location:';
export const defaultWantsPrompt =
  'If you were the character in the story, what are your wants right now? Respond in the first person';

export const rendererWebsocketPort = 25146;
export const modWebsocketPort = 25145;
export const appApiPort = 25148;
export const appApiUrl = `http://localhost:${appApiPort}`;
export const openaiDefaultEndpoint = 'https://api.openai.com/v1';
export const koboldaiDefaultEndpoint = 'http://localhost:5000';
export const novelaiDefaultEndpoint = 'https://api.novelai.net';
export const novelaiGenerationDefaultEndpoint = 'https://text.novelai.net';
export const openaiDefaultModel = 'gpt-4o-mini';
export const novelaiDefaultModel = 'kayra-v1';
export const sentientSimsAIDefaultModel = 'Gryphe/MythoMax-L2-13b';
export const tokenizerBreakString = '<<BREAK>>';
export const defaultWantsPrefixes = ['I want to', 'I would like', 'I feel'];
export const defaultGeminiModel = 'gemini-2.0-flash-exp';
export const geminiDefaultEndpoint = 'https://generativelanguage.googleapis.com/v1beta';
export const defaultTTSEnabled = false;
export const defaultTTSVolume = 0.75;
export const defaultMaxResponseTokens = 90;
export const defaultElevenLabsEndpoint = 'https://api.elevenlabs.io/v1';
export const defaultKokoroEndpoint = 'https://api.kokorotts.com';
export const defaultVLLMEndpoint = 'http://localhost:8000/v1';
