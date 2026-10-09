// N-3: a weak-but-TRUE pre-action for an interaction nobody has mapped yet. The
// 08-04..08-14 playtest log carried 280 UNMAPPED_INTERACTION events; the ones that reached
// the model as contentless scenes are where the "popup/code glitch" hallucination came
// from. A synthesized line says only what the tuning name says — the character is busy
// with <that> — and never invents an object, a mood or an outcome.
//
// When the mod sends the interaction's pie-menu label the line is the game's own words,
// "Audrey Bennett: Talk about Recent Studies (with Yuki Behr)", instead of the tuning
// name picked apart ("is busy with 'archetype sage talk about recent studies'").
//
// The game renders that label against THIS save, so it can carry a real name: "Play with
// Elliot Jr". The mod sends a second form with {actor.N} where the names were, and it is
// the one to build the line from - the line goes in the prompt (where the formatter puts
// the names back) AND is offered in the mapping browser as text to publish to every user
// of the mod, none of whom have an Elliot Jr.
//
// Junk tunings (idles, passives, constraint satisfiers, carry proxies) are IGNORED rather
// than synthesized: nobody wants a scene about sim_Stand.

import { InteractionDescription } from '../descriptions/interactionDescriptions';

const IGNORE_FRAGMENTS = [
  'idle',
  'passive',
  'satisfyconstraint',
  'createcarry',
  'proxy',
  'holdwing',
  'wings_hold',
  '_listen',
  'reaction',
  '_react',
  'transition',
  'fake',
  'cheat',
  'debug',
  'picker',
  'autonomoussimpicker',
  'staging',
  'continuation',
  'nls',
];

// Scaffolding tokens the tuning names carry that mean nothing to a reader
const NOISE_TOKENS = new Set([
  'mixer',
  'social',
  'socials',
  'super',
  'si',
  'superinteraction',
  'targeted',
  'friendly',
  'alwayson',
  'always',
  'on',
  'stc',
  'group',
  'emotionspecific',
  'emotion',
  'specific',
  'autonomous',
  'autonomously',
  'generic',
  'sim',
  'sims',
  'trait',
  'from',
  'buff',
  'simpreference',
  'preference',
  'likes',
  'activities',
  'active',
  'object',
  'targetonly',
  'actoronly',
  'actortarget',
  'lowscore',
  'middlescore',
  'highscore',
  'ep19',
  'ep',
  'gp',
  'sp',
  'ctyae',
  'ctyaeu',
  'tyae',
  'yae',
  'skills',
  'skill',
  'career',
  'activecareer',
  'event',
  'tag',
  'clone',
  'nonfairy',
  'fairytononfairy',
  'occult',
  'lifestyles',
  'lifestyle',
  'recent',
]);

function tokens(name: string): string[] {
  return name
    .replace(/^TURBODRIVER:/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-:.]+/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0 && !/^\d+$/.test(token))
    .filter((token) => !NOISE_TOKENS.has(token));
}

export function synthesizeInteractionDescription(
  interactionName: string | undefined,
  simCount: number,
  displayName?: string,
  displayNameTemplate?: string,
): InteractionDescription | undefined {
  if (!interactionName) {
    return undefined;
  }
  const lowered = interactionName.toLowerCase();
  if (IGNORE_FRAGMENTS.some((fragment) => lowered.includes(fragment))) {
    return { ignored: true };
  }
  // The template's braces are its {actor.N} tokens and must survive; a rendered label's
  // braces would only ever be an unfilled token, so those are still stripped
  const template = displayNameTemplate?.replace(/\s+/g, ' ').trim();
  const label = template || displayName?.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
  if (label) {
    // A label that already names its target ("Chat with Yuki", "Give {actor.1} a hug")
    // says so itself
    const withTarget = simCount >= 2 && !/\bwith\b/i.test(label) && !label.includes('{actor.1}');
    return {
      pre_actions: [`{actor.0}: ${label}${withTarget ? ' (with {actor.1})' : ''}`],
    };
  }
  const words = tokens(interactionName);
  if (words.length === 0) {
    return { ignored: true };
  }
  const phrase = words.join(' ');
  const withTarget = simCount >= 2 && !/\bsolo\b/.test(phrase);
  return {
    pre_actions: [`{actor.0} is busy with '${phrase}'${withTarget ? ' with {actor.1}' : ''}.`],
  };
}
