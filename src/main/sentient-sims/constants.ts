// eslint-disable-next-line import/prefer-default-export
export const defaultSystemPrompt = [
  'The user will prompt you with an action that you will rewrite in the form of a story in the third person,',
  "describing scenes clearly, explicitly, in vivid detail based on what's been said before using lots of dialog without predicting the future or giving a lesson.",
  'Use the following characters, and location to help rewrite the user action into story format:',
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
  'Writing the story in the third person, describing scenes clearly, explicitly, in vivid detail',
  "based on what's been said before using lots of dialog",
  'without predicting the future or giving a lesson',
  'ending each part on a cliffhanger, using the characters location and history provided:',
].join(', ');

export const sentientSimsAIHost = 'https://ai.sentientsimulations.com';

export const defaultWantsPrompt =
  'If you were the character in the story, what would you want to do?';

// eslint-disable-next-line import/prefer-default-export
// export const defaultSystemPrompt = [
//   'You shall rewrite the user action prompt in the form of a story in the third person.',
//   'Responses must be detailed, creative, immersive, and drive the scenario forward using lots of dialog without predicting the future using',
//   'the following characters, and location to help rewrite the user action into story format:',
// ].join(' ');
