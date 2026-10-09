import { describe, expect, it } from 'vitest';
import { buildFallbackActorPrompt } from 'main/sentient-sims/services/AIService';

// Release 4.5 (2026-09-23): when the director's briefing fails or has no section for an
// actor, that actor used to receive the WHOLE scene context - every performer's character
// block, the other sims' labelled private diaries and facts, and the retrieved memories
// the others own. The fallback now carries the scene prefix and the actor's own block only.
describe('directed scene fallback prompt', () => {
  const scenePrefix = ['<LOCATION>\nHome (Residential), a small house\n</LOCATION>', 'It is Monday morning.'].join(
    '\n',
  );
  const participants = [
    '<CHARACTER_IN_INTERACTION>',
    'Mara Vale is a female young adult.',
    'Mara Vale likes painting.',
    '</CHARACTER_IN_INTERACTION>',
    '<CHARACTER_IN_INTERACTION>',
    'Theo Vale is a male adult.',
    'Theo Vale is married to Mara Vale.',
    '</CHARACTER_IN_INTERACTION>',
    '<ALSO_PRESENT>\nA cat named Biscuit\n</ALSO_PRESENT>',
    '<DIRECTOR>\nKeep it short\n</DIRECTOR>',
    '<PAST_REFLECTIONS speaker="Theo Vale">\nI have been hiding the gambling debt from Mara.\n</PAST_REFLECTIONS>',
    '<KNOWN_FACTS speaker="Theo Vale">\nTheo owes 4000 simoleons.\n</KNOWN_FACTS>',
    '<RELEVANT_MEMORIES>\nTheo thinks: she must never find out.\n</RELEVANT_MEMORIES>',
  ].join('\n');

  it('gives the actor the scene prefix and their own character block only', () => {
    const prompt = buildFallbackActorPrompt('Mara Vale', scenePrefix, participants);
    expect(prompt.startsWith('You are playing Mara Vale.')).toBe(true);
    expect(prompt).toContain('<LOCATION>');
    expect(prompt).toContain('It is Monday morning.');
    expect(prompt).toContain('Mara Vale likes painting.');
    // Nothing that belongs to the other sim or to the director stage
    expect(prompt).not.toContain('Theo Vale is a male adult');
    expect(prompt).not.toContain('gambling debt');
    expect(prompt).not.toContain('KNOWN_FACTS');
    expect(prompt).not.toContain('PAST_REFLECTIONS');
    expect(prompt).not.toContain('RELEVANT_MEMORIES');
    expect(prompt).not.toContain('ALSO_PRESENT');
    expect(prompt).not.toContain('<DIRECTOR>');
  });

  it('matches the block by its header line, not by a mention inside another block', () => {
    // Theo's block mentions Mara; Mara's fallback must still pick her own block
    const prompt = buildFallbackActorPrompt('Mara Vale', scenePrefix, participants);
    expect(prompt.match(/<CHARACTER_IN_INTERACTION>/g)).toHaveLength(1);
    const theo = buildFallbackActorPrompt('Theo Vale', scenePrefix, participants);
    expect(theo).toContain('Theo Vale is married to Mara Vale.');
    expect(theo).not.toContain('Mara Vale likes painting.');
  });

  it('degrades to name and scene when there is no block for the actor', () => {
    const prompt = buildFallbackActorPrompt('Nobody Here', scenePrefix, participants);
    expect(prompt).toBe(`You are playing Nobody Here.\n\n${scenePrefix}`);
    expect(buildFallbackActorPrompt('Nobody Here', '', '')).toBe('You are playing Nobody Here.');
  });
});
