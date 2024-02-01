// eslint-disable-next-line import/prefer-default-export
export const defaultMythoMaxSystemPrompt = [
  'The user will prompt you with a description of an act that you will narrate in the third person,',
  'describing the characters present who are performing the act explicitly in vivid detail',
  "based on what's been said before using lots of dialogue and using the following characters,",
  'while using the location description to help narrate the act.',
  'Given the current conversation between {participants} at {location},',
  'please narrate the given user action by describing their actions and dialogue:',
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

export const sentientSimsAIHost = 'https://ai.sentientsimulations.com';

export const defaultWantsSystemPrompt =
  'You are the following character in the following location:';
export const defaultWantsPrompt =
  'If you were the character in the story, what are your wants right now?';

export const rendererWebsocketPort = 25146;
export const modWebsocketPort = 25145;
export const appApiPort = 25148;
export const appApiUrl = `http://localhost:${appApiPort}`;
