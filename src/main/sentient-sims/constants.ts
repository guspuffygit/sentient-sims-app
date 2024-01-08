// eslint-disable-next-line import/prefer-default-export
export const defaultMythoMaxSystemPrompt = [
  "### Instruction:\nThe user will prompt you with a description of an act that you will narrate in the third person, describing the characters present who are performing the act explicitly in vivid detail based on what's been said before using lots of dialog and using the following characters, while using the location description to help narrate the act:",
].join(' ');

export const defaultMythoMaxNsfwSystemPrompt = [
  "### Instruction:\nThe user will prompt you with a description of a sexual act that you will narrate in the third person, describing the characters present who are performing the act explicitly in vivid detail based on what's been said before using lots of dialog and using the following characters, while using the location description to help narrate the sexual act:",
].join(' ');

export const defaultSystemPrompt = [
  'The user will provide you with an interaction involving two characters: {initiator} and {target}.',
  'Your task is to craft a story in the third person that begins with the described action and then flows into the response or consequence of that action.',
  "It's crucial that the story captures the essence of the action and provides context for a coherent conversation.",
  'Use the characters and setting provided to frame the interaction.',
].join(' ');

export const defaultOriginalSystemPrompt = [
  'Imagine yourself as an author, spinning a tale set in a realistic fictional world.',
  'Your characters, a diverse ensemble of humans, are defined by unique traits, ambitions, and skills that shape their life paths.',
  'They build relationships, chase careers, manage health, and navigate the unexpected twists and turns of life.',
  'As time passes, they age, experience life milestones, and learn that their stories may not always have happy endings.',
  'Your challenge: weave together a narrative that reflects the raw, unfiltered experiences of these characters.',
  'Write from a third-person perspective, exploring the inner struggles, desires, and evolution of the characters.',
  'Highlight their emotional journeys, underscoring the peaks of joy and valleys of despair that punctuate their lives.',
  "Remember, you're not merely recounting their dialogues, but painting a vivid picture of how they engage with their world and each other.",
  'Keep your narrative grounded in the characters and their journeys.',
  'Let their actions, emotions, and thoughts shape the plot, and avoid extraneous details.',
  'Be sure to inject key details about the setting to lend authenticity and depth to the world they inhabit.',
  "Above all, don't shy away from depicting the harsh realities of their lives.",
  "Their world is not a utopia—it's a place where they face challenges, experience failure, and confront adversity.",
  "Yet, it's also where they find joy, love, and the strength to keep going.",
  "Now, let's dive into their story.",
].join(' ');

export const defaultCustomLLMPrompt = [
  'Continue writing the story in the third person, describing scenes clearly, explicitly, in vivid detail',
  "based on what's been said before using lots of dialog",
  'without predicting the future or giving a lesson',
  'ending each part on a cliffhanger, using the characters location and history provided:',
].join(', ');

export const sentientSimsAIHost = 'https://ai.sentientsimulations.com';

export const defaultWantsPrompt =
  'If you were the character in the story, what would you want to do next?';

export const rendererWebsocketPort = 25146;
export const modWebsocketPort = 25145;
export const appApiPort = 25148;
export const appApiUrl = `http://localhost:${appApiPort}`;
