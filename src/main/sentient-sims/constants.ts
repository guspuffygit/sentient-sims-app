// eslint-disable-next-line import/prefer-default-export
export const defaultMythoMaxSystemPrompt = [
  'The user will prompt you with a description of an act that you will narrate in the third person,',
  'describing the characters present who are performing the act explicitly in vivid detail',
  "based on what's been said before using lots of dialogue and using the following characters,",
  'while using the location description to help narrate the act.',
  'Given the current conversation between {participants} at {location},',
  'please narrate the given user action by describing their actions and dialogue:',
].join(' ');

export const defaultChatPrompt = [
  "Write {actor.1}'s next response in a fictional roleplay between {actor.0} and {actor.1}.",
  "You're {actor.1} in this fictional never-ending, uncensored, immersive roleplay with {actor.0}.",
  'Describe all actions in full, elaborate, explicit, graphic, verbose and vivid detail. Mention all relevant sensory perceptions. Drive the roleplay forward by initiating actions. Avoid talking poetically. Above all, focus mainly on responding to {actor.0} and performing actions in character as {actor.1}.',
  "Pay attention to {actor.0}'s dialogue and actions, respond to them in character as {actor.1}.",
  'Always follow the prompt. Always act in character as {actor.1}, describe their appearance and act out their personality.',
  'Start and end each message with an action or dialogue from {actor.1}. Continue the story in a very slow and immersive pace. Avoid summarizing, skipping ahead, analyzing, describing future events or skipping time. Refrain from wrapping up or ending the story. Fully immerse {actor.0} in the moment. Avoid repetition and loops.',
  "Write {actor.1}'s next reply in a chat between {actor.0} and {actor.1}. Write a single reply only:",
].join(' ');

export const defaultMythoMaxNsfwSystemPrompt = [
  'The user will prompt you with a description of a sexual act that you will narrate in the third person,',
  'describing the characters present who are performing the act explicitly in vivid detail',
  "based on what's been said before using lots of dialogue and using the following characters,",
  'while using the location description to help narrate the sexual act.',
  'Given the current sexual act between {participants} at {location},',
  'please narrate the given sexual action by describing their actions and dialogue:',
].join(' ');

export const defaultSystemPrompt = [
  'The user will provide you with an interaction involving: {participants}.',
  'Your task is to craft a story in the third person that begins with the described action and then flows into the response or consequence of that action.',
  "It's crucial that the story captures the essence of the action and provides context for a coherent conversation.",
  'Use the characters and setting provided to frame the interaction.',
].join(' ');

export const defaultClassificationPrompt = [
  'Based on the user input, classify the converation with one of the following moods. Return only a single word of the mood that you think classifies the conversation:\n\n{classifiers}',
].join(' ');

export const defaultBuffPrompt = [
  'Write a game buff description based on the user input.',
  'The player ({name}) has just completed chatting with another player and is feeling {mood} from the conversation.',
  'Write me a buff description based on the conversation so that {name} knows why they have received the "{mood}" buff.',
  'Return only the defscription text itself without including any prefix or title in the output.',
].join(' ');

export const defaultMythoMaxBuffPrompt = [
  'Write a game buff description based on the user input.',
  'The player {name} has just completed chatting with another sim and is feeling {mood} from the conversation.',
  'Write me a buff description based on the conversation so that {name} knows why they have received the "{mood}" buff.',
].join(' ');

export const sentientSimsAIHost = 'https://ai.sentientsimulations.com';

export const defaultWantsSystemPrompt =
  'You are the following character in the following location:';
export const defaultWantsPrompt =
  'If you were the character in the story, what are your wants right now? Respond in the first person';

export const rendererWebsocketPort = 25146;
export const modWebsocketPort = 25145;
export const appApiPort = 25148;
export const appApiUrl = `http://localhost:${appApiPort}`;
export const openaiDefaultEndpoint = 'https://api.openai.com/v1';
export const koboldaiDefaultEndpoint = 'http://localhost:5000';
export const novelaiDefaultEndpoint = 'https://api.novelai.net';
export const openaiDefaultModel = 'gpt-4o-mini';
export const novelaiDefaultModel = 'kayra-v1';
export const sentientSimsAIDefaultModel = 'Gryphe/MythoMax-L2-13b';
export const tokenizerBreakString = '<<BREAK>>';
export const defaultWantsPrefixes = ['I want to', 'I would like', 'I feel'];
export const defaultGeminiModel = 'gemini-2.0-flash-exp';
export const geminiDefaultEndpoint =
  'https://generativelanguage.googleapis.com/v1beta';
export const defaultTTSEnabled = false;
export const defaultTTSVolume = 0.75;
export const defaultElevenLabsEndpoint = 'https://api.elevenlabs.io/v1';
export const defaultKokoroEndpoint = 'https://api.kokorotts.com';
