/* eslint-disable import/prefer-default-export */

export function formatLLamaPrompt(prompt: string) {
  // return [
  //   'This response is written in the style of a novel excerpt written in the third person by an omniscient narrator, containing vivid descriptions of each scene.',
  //   'Every response takes into account every previous response.',
  //   'The response stays in the present and does not contain information about the future.',
  //   'At the end of each response, there is a cliffhanger, staying in the present, leaving it open what happens next.',
  //   'Never end with a summary or moral of the story.',
  //   'Consider the user context when writing the story.',
  //   `USER: ${prompt}`,
  //   `ASSISTANT:`,
  // ].join('\n');
  return [
    "Write a story in the third person, describing scenes clearly, based on what's been said before, without predicting the future or giving a lesson, ending each part on a cliffhanger, and considering the user context.",
    `USER: ${prompt}`,
    `ASSISTANT:`,
  ].join('\n');
}
