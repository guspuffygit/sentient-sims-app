import { SpeechPromptContext } from 'main/sentient-sims/pipeline/prompts/scene';

// Fixed inputs for the pre-lean buildSpeechSystemPrompt (2026-10-27). speechPrompts.json holds
// the outputs the function produced before speechRules() was extracted; full mode must still
// produce them byte for byte.
const actorPrompt = [
  'Setting the scene: a sitcom beat in the kitchen.',
  '',
  'You are playing Mara Vale. Sharp, tired, fond of Theo.',
].join('\n');
const factsBlock = '<KNOWN_FACTS>\nMara Vale is married to Theo Vale.\nMara Vale has no job.\n</KNOWN_FACTS>';
const statusBlock = '<STATUS>\nMara Vale is hungry.\n</STATUS>\n<TODAYS_PLAN>\nPaint.\n</TODAYS_PLAN>';

export const SPEECH_FIXTURE_INPUTS: Record<string, SpeechPromptContext> = {
  pair: { simName: 'Mara Vale', actorPrompt, monologueOnly: false, factsBlock },
  pairNoFacts: { simName: 'Mara Vale', actorPrompt, monologueOnly: false },
  monologue: { simName: 'Mara Vale', actorPrompt, monologueOnly: true, factsBlock },
  playerFacing: {
    simName: 'Mara Vale',
    actorPrompt,
    monologueOnly: false,
    factsBlock,
    playerFacing: true,
    statusBlock,
  },
  playerFacingNoStatus: { simName: 'Mara Vale', actorPrompt, monologueOnly: false, factsBlock, playerFacing: true },
  playerFacingMonologue: {
    simName: 'Mara Vale',
    actorPrompt,
    monologueOnly: true,
    factsBlock,
    playerFacing: true,
    statusBlock,
  },
};
